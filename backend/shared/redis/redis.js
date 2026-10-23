import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
    console.log("Redis connected");
})

export default redis;