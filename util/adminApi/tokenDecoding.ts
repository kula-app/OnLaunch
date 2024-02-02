import { AdminTokenType } from "../../models/adminTokenType";
import { Logger } from "../logger";

const logger = new Logger(__filename);

const delimiter = "_";

export function encodeToken(token: string, type: string): string | null {
  if ((<any>Object).values(AdminTokenType).includes(type)) {
    return `${type}${delimiter}${token}`;
  } else {
    logger.error(`Invalid token type to encode: ${type}`);
    return null;
  }
}

export function decodeToken(
  token: string | undefined
): { type: AdminTokenType; token: string } | null {
  if (!token) {
    return null;
  }

  // Find the position of the first underscore
  const firstUnderscoreIndex = token.indexOf("_");

  // Check if the underscore is found
  // The encoded token may contain more than 1 underscore
  if (firstUnderscoreIndex === -1) {
    return null; // Invalid token format
  }

  // Extract the type
  const type = token.substring(0, firstUnderscoreIndex);

  if (type !== AdminTokenType.App && type !== AdminTokenType.Org) {
    return null; // Invalid token type
  }

  if (token.length > firstUnderscoreIndex) {
    const tokenWithoutPrefix = token.substring(firstUnderscoreIndex + 1);
    return {
      type: type as AdminTokenType,
      token: tokenWithoutPrefix,
    };
  }

  return null;
}
