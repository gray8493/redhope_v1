const vnProvinces = require('vietnam-provinces');
console.log(JSON.stringify(vnProvinces.provinces?.slice(0, 3) || 'No provinces', null, 2));
