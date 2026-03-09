import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/unauthorized', '/offline'],
        },
        sitemap: 'https://redhope.io.vn/sitemap.xml',
    };
}
