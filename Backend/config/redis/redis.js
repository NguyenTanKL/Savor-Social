const redis = require('redis');

const client = redis.createClient({
  url: 'redis://localhost:6379',
});

client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await client.connect();
})();

module.exports = client;