const Redis = require("ioredis");

const env = require("../config/env");

class MemoryCacheService {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const record = this.store.get(key);

    if (!record) {
      return null;
    }

    if (record.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return record.value;
  }

  async set(key, value, ttlSeconds = env.cacheTtlSeconds) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key) {
    this.store.delete(key);
  }
}

class RedisCacheService {
  constructor(client) {
    this.client = client;
  }

  async get(key) {
    const raw = await this.client.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  async set(key, value, ttlSeconds = env.cacheTtlSeconds) {
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async delete(key) {
    await this.client.del(key);
  }
}

function createCacheService() {
  if (env.redisUrl) {
    const client = new Redis(env.redisUrl, { lazyConnect: true });
    client.connect().catch(() => {
      console.warn("Redis connection failed, falling back to in-memory cache.");
    });
    return new RedisCacheService(client);
  }

  return new MemoryCacheService();
}

module.exports = createCacheService();
