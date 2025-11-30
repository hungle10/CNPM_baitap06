const { Client } = require('@elastic/elasticsearch');

const ES_HOST = process.env.ES_HOST || 'http://localhost:9200';

const client = new Client({ node: ES_HOST });

module.exports = client;
