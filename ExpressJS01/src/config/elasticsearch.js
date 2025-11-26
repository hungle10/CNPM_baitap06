const { Client } = require("@elastic/elasticsearch");

const ELASTIC_URL = process.env.ELASTICSEARCH_URL || process.env.ELASTIC_URL;

const esEnabled = Boolean(ELASTIC_URL);

let client = null;

if (esEnabled) {
  client = new Client({ node: ELASTIC_URL });
}

module.exports = {
  esEnabled,
  client,
};
