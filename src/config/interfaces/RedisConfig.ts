export interface RedisConfig {
  isEnabled: boolean;

  name?: string; // name of the Redis service
  host?: string;
  password?: string;
  port?: number;
  db: number | undefined;

  cacheMaxAge: number;

  isSentinelEnabled: boolean;
  sentinels?: { host: string; port: number }[];
  sentinelPassword?: string;
}
