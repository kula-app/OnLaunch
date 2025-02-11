import { RedisConfig } from "@/config/interfaces/RedisConfig";
import { loadServerConfig } from "@/config/loadServerConfig";
import { Logger } from "@/util/logger";
import Redis, { RedisOptions } from "ioredis";

function getRedisConfiguration(): RedisConfig {
  return loadServerConfig().redisConfig;
}

function redisClientSingleton(config = getRedisConfiguration()):
  | {
      isEnabled: true;
      client: Redis;
    }
  | {
      isEnabled: false;
    } {
  const logger = new Logger(__filename);

  if (!config.isEnabled) {
    logger.verbose(`Redis is not enabled`);
    return {
      isEnabled: false,
    };
  }

  try {
    let options: RedisOptions = {
      db: config.db,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 3000, // Add explicit connection timeout
      commandTimeout: 3000, // Add command timeout
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Only reconnect on specific errors
          return true;
        }
        return false;
      },
      retryStrategy: (times) => {
        if (times > 3) { // Reduce max retries from 5 to 3
          return null;
        }
        return Math.min(times * 100, 1000); // More conservative retry delay
      }
    };

    if (config.isSentinelEnabled) {
      logger.log(`Setting Redis options for sentinel configuration`);
      options = {
        ...options,
        sentinels: config.sentinels,
        sentinelPassword: config.sentinelPassword,
        password: config.password,
        name: config.name,
        enableReadyCheck: false, // Disable ready check for faster connection
      };
    } else {
      logger.log(`Setting Redis options for single instance`);
      options = {
        ...options,
        host: config.host,
        port: config.port,
        password: config.password,
        enableReadyCheck: false, // Disable ready check for faster connection
      };
    }

    const redis = new Redis(options);

    // Add connection event handlers
    redis.on("connect", () => {
      logger.verbose("[Redis] Connected successfully");
    });

    redis.on("error", (error: unknown) => {
      logger.error(`[Redis] Error connecting: ${error}`);
    });

    // Add connection ready handler
    redis.on("ready", () => {
      logger.verbose("[Redis] Client is ready");
    });

    // Handle cases where Redis becomes unavailable after initial connection
    redis.on("close", () => {
      logger.warn("[Redis] Connection closed");
    });

    return {
      isEnabled: true,
      client: redis,
    };
  } catch (e) {
    logger.error(`[Redis] Could not create a Redis instance: ${e}`);
    // Return disabled state instead of throwing
    return {
      isEnabled: false,
    };
  }
}

// Modify the global singleton initialization to be more resilient
const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof redisClientSingleton> | undefined;
};

// Add initialization retry with timeout
const initializeRedis = () => {
  try {
    const redis = redisClientSingleton();
    globalForRedis.redis = redis;
    return redis;
  } catch (error) {
    console.error("[Redis] Failed to initialize Redis client:", error);
    return { isEnabled: false };
  }
};

const redis = globalForRedis.redis ?? initializeRedis();

export default redis;
