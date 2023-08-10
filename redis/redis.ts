import Redis, { RedisOptions } from "ioredis";
import { loadConfig } from "../config/loadConfig";
import { Logger } from "../util/logger";

function getRedisConfiguration(): {
  port: number;
  host: string;
  password: string;
} {
  return loadConfig().redisConfig;
}

export function createRedisInstance(config = getRedisConfiguration()) {
  const logger = new Logger(__filename);

  try {
    const options: RedisOptions = {
      host: config.host,
    };

    if (config.port) {
      options.port = config.port;
    }

    if (config.password) {
      options.password = config.password;
    }

    const redis = new Redis(options);

    redis.on("error", (error: unknown) => {
      logger.error(`[Redis] Error connecting: ${error}`);
    });

    return redis;
  } catch (e) {
    logger.error(`[Redis] Could not create a Redis instance`);
    throw new Error(`[Redis] Could not create a Redis instance`);
  }
}
