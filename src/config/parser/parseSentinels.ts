// Parse the sentinels from an environment variable
export const parseSentinels = (sentinelString?: string) => {
  if (!sentinelString) return undefined;
  return sentinelString.split(',').map((item) => {
    const [host, port] = item.split(':');
    return { host, port: Number(port) };
  });
};
