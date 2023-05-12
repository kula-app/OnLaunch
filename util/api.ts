import { Logger } from "./logger";

export async function returnDataOrThrowError(response: Response) {
  const logger = new Logger(__filename);
  const data = await response.json();

  if (!response.ok) {
    logger.log(`An error has occurred while making an API call: ${data.message}`);
    throw new Error(data.message || "an error occurred");
  }

  return data;
}
