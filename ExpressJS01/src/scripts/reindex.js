/**
 * Utility script to run bulk reindexing of products into Elasticsearch.
 * Usage: set environment variables (MYSQL_* and ELASTICSEARCH_URL) and run:
 *   node ./src/scripts/reindex.js
 */

require("dotenv").config();

const { bulkIndexAllProducts } = require("../services/elasticsearchService");

(async () => {
  try {
    const r = await bulkIndexAllProducts();
    console.log("Reindex result:", r);
    process.exit(0);
  } catch (err) {
    console.error("Reindex failed:", err);
    process.exit(1);
  }
})();
