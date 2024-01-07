enum TokenType {
  App = "app",
  Org = "org",
}

export function decodeToken(
  token: string | undefined
): { type: TokenType; id: number; accessToken: string } | null {
  if (typeof token === "undefined") {
    return null; // Token is undefined
  }

  // Find the positions of the first two underscores
  const firstUnderscoreIndex = token.indexOf("_");
  const secondUnderscoreIndex = token.indexOf("_", firstUnderscoreIndex + 1);

  // Check if the underscores are found and correctly placed
  // The encoded token may contain more than 2 underscores
  if (
    firstUnderscoreIndex === -1 ||
    secondUnderscoreIndex === -1 ||
    firstUnderscoreIndex === secondUnderscoreIndex
  ) {
    return null; // Invalid token format
  }

  // Extract the type, id, and the actual token
  const type = token.substring(0, firstUnderscoreIndex);
  const id = token.substring(firstUnderscoreIndex + 1, secondUnderscoreIndex);
  const accessToken = token.substring(secondUnderscoreIndex + 1);

  if (type !== TokenType.App && type !== TokenType.Org) {
    return null; // Invalid token type
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return null; // Invalid ID
  }

  return {
    type: type as TokenType,
    id: numericId,
    accessToken: accessToken,
  };
}
