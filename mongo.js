const CosmosClient = require('@azure/cosmos').CosmosClient;
const env = require('./env/environment');

const endpoint = env.endpoint;
const key = env.key;

const options = {
    endpoint: endpoint,
    key: key,
};

const client = new CosmosClient(options);

module.exports = {
    client,
};
