import { Logger } from "@/util/logger";

class RedisConnectionStatus {
  private static instance: RedisConnectionStatus;
  private isConnected: boolean = false;
  private logger = new Logger('RedisConnectionStatus');

  private constructor() {}

  static getInstance(): RedisConnectionStatus {
    if (!RedisConnectionStatus.instance) {
      RedisConnectionStatus.instance = new RedisConnectionStatus();
    }
    return RedisConnectionStatus.instance;
  }

  setConnected(status: boolean) {
    this.isConnected = status;
  }

  isRedisConnected(): boolean {
    return this.isConnected;
  }
}

export const redisStatus = RedisConnectionStatus.getInstance();