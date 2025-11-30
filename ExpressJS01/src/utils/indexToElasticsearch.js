require('dotenv').config();

const sequelize = require('../config/database');
const Product = require('../models/product');
const esService = require('../services/esService');

async function indexAll() {
  try {
    // Ensure DB connection works before querying products
    console.log('Checking DB connection...');
    await sequelize.authenticate();
    console.log('✅ DB connection OK');
  try {
    const products = await Product.findAll({ raw: true });
    if (!products || products.length === 0) {
      console.log('No products found in DB to index');
      return;
    }

    try {
      await esService.bulkIndex(products);
      console.log('✅ Indexed products into Elasticsearch');
    } catch (err) {
      console.error('Failed to index products into Elasticsearch:', err && err.message ? err.message : err);
      throw err;
    }
  } catch (err) {
    console.error('❌ indexToElasticsearch failed.');
    if (err && err.message && err.message.indexOf('getaddrinfo') >= 0) {
      console.error(' - Database host/port may be incorrect or DB is not reachable. Check .env and DB status.');
    }
    console.error(err && err.message ? err.message : err);
  }
}

if (require.main === module) {
  indexAll().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = indexAll;
