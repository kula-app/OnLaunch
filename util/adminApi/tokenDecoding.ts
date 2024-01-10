enum TokenType {
  App = "app",
  Org = "org",
}

export function decodeToken(
  token: string | undefined
): { type: TokenType; token: string } | null {
  if (typeof token === "undefined") {
    return null; // Token is undefined
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

  if (type !== TokenType.App && type !== TokenType.Org) {
    return null; // Invalid token type
  }

  return {
    type: type as TokenType,
    token: token,
  };
}
