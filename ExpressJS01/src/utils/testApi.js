const axios = require('axios');

async function smoke() {
  const base = process.env.TEST_BACKEND_URL || 'http://localhost:8888/v1/api';

  try {
    console.log('Fetching products...');
    const r1 = await axios.get(`${base}/products?page=1&limit=3`);
    console.log('Products response status:', r1.status);
    console.log('Sample product count:', r1.data?.data?.length);

    console.log('Fetching categories...');
    const r2 = await axios.get(`${base}/products/categories`);
    console.log('Categories:', r2.data);

    console.log('Smoke test OK');
  } catch (err) {
    console.error('Smoke test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  smoke();
}

module.exports = smoke;
