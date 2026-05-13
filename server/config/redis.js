const Redis = require('ioredis');

const redisOptions = {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        if (times > 5) {
            console.error('Redis connection failed after 5 retries. Please make sure Redis is running.');
            // Return null to stop retrying
            return null;
        }
        return Math.min(times * 500, 2000);
    }
};

const redisClient = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', redisOptions);

const redisPub = redisClient.duplicate();
const redisSub = redisClient.duplicate();

// Handle errors gracefully on all clients to prevent crash loops
redisClient.on('error', (err) => console.error('Redis Main Error:', err.message));
redisPub.on('error', (err) => console.error('Redis Pub Error:', err.message));
redisSub.on('error', (err) => console.error('Redis Sub Error:', err.message));

redisClient.on('connect', () => {
    console.log('Connected to Redis successfully');
});

module.exports = { redisClient, redisPub, redisSub };
