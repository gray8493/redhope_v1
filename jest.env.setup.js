// Load environment variables from .env.local for Jest tests
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            if (key && value) {
                process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        }
    });
    console.log('✅ Loaded environment variables from .env.local for integration tests');
} else {
    console.warn('⚠️  .env.local not found - integration tests may be skipped');
}
