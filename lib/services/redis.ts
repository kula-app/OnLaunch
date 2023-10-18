import Redis, { RedisOptions } from "ioredis";
import { RedisConfig } from "../../config/interfaces/RedisConfig";
import { loadConfig } from "../../config/loadConfig";
import { Logger } from "../../util/logger";

function getRedisConfiguration(): RedisConfig {
  return loadConfig().server.redisConfig;
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
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000); // exponentially increase the retry delay, but not more than 2 seconds

        if (times > 5) {
          // If we've retried at least 5 times, give up.
          return null;
        }

        return delay;
      },
    };
    if (config.isSentinelEnabled) {
      // If sentinel is enabled, use the sentinel configuration
      logger.log(`Setting Redis options for sentinel configuration`);
      options = {
        ...options,
        sentinels: config.sentinels,
        sentinelPassword: config.sentinelPassword,
        password: config.password,
        name: config.name,
      };
    } else {
      // If sentinel is not enabled, use the standalone Redis configuration
      logger.log(`Setting Redis options for single instance`);
      options = {
        ...options,
        host: config.host,
        port: config.port,
        password: config.password,
      };
    }

    const redis = new Redis(options);

    redis.on("error", (error: unknown) => {
      logger.error(`[Redis] Error connecting: ${error}`);
    });

    return {
      isEnabled: true,
      client: redis,
    };
  } catch (e) {
    logger.error(`[Redis] Could not create a Redis instance`);
    throw new Error(`[Redis] Could not create a Redis instance`);
  }
}

// Typed access to the global context
const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof redisClientSingleton> | undefined;
};

const redis = globalForRedis.redis ?? redisClientSingleton();
globalForRedis.redis = redis;

export default redis;
