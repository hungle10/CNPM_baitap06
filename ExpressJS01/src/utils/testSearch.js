const axios = require('axios');

async function runSearchTests() {
  const base = process.env.TEST_BACKEND_URL || 'http://localhost:8888/v1/api';

  try {
    console.log('Running ES search smoke tests...');

    console.log('- Basic full-text search (q=mouse)');
    const r1 = await axios.get(`${base}/products/search?q=mouse&page=1&limit=5`);
    console.log('  status:', r1.status, 'hits:', r1.data?.data?.length);

    console.log('- Filter by category (category=Headphones)');
    const r2 = await axios.get(`${base}/products/search?category=Headphones`);
    console.log('  status:', r2.status, 'hits:', r2.data?.data?.length);

    console.log('- Price range (minPrice=50&maxPrice=150)');
    const r3 = await axios.get(`${base}/products/search?minPrice=50&maxPrice=150`);
    console.log('  status:', r3.status, 'hits:', r3.data?.data?.length);

    console.log('- Promotion filter (isOnPromotion=true)');
    const r4 = await axios.get(`${base}/products/search?isOnPromotion=true&sortBy=views&sortOrder=desc`);
    console.log('  status:', r4.status, 'hits:', r4.data?.data?.length);

    console.log('Search smoke tests finished OK');
  } catch (err) {
    console.error('Search smoke failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

if (require.main === module) runSearchTests();

module.exports = runSearchTests;
