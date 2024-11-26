export function truncateString(
  str: string,
  limit: number,
  clipMode: "by-word" | "by-character" = "by-character",
  truncationMode: "head" | "tail" = "tail",
  ellipsis: string = "...",
) {
  if (str.length <= limit) {
    return str;
  }

  const ellipsisLength = ellipsis.length;
  switch (clipMode) {
    case "by-word": {
      const wordSeparator = " ";
      let words = str.split(wordSeparator);
      switch (truncationMode) {
        case "head": {
          const truncatedStr = words.reverse().reduce((prev, curr) => {
            const expectedTruncatedStrLength =
              prev.length + wordSeparator.length + curr.length + ellipsisLength;
            if (expectedTruncatedStrLength <= limit) {
              return prev + wordSeparator.length + curr;
            }
            return prev;
          }, "");
          return `${ellipsis}${truncatedStr}`;
        }
        case "tail": {
          const truncatedStr = words.reduce((prev, curr) => {
            const expectedTruncatedStrLength =
              prev.length + wordSeparator.length + curr.length + ellipsisLength;
            if (expectedTruncatedStrLength <= limit) {
              return prev + wordSeparator.length + curr;
            }
            return prev;
          }, "");
          return `${truncatedStr}${ellipsis}`;
        }
        default:
          throw new Error(`Invalid truncation mode: ${truncationMode}`);
      }
    }
    case "by-character": {
      switch (truncationMode) {
        case "head": {
          return `${ellipsis}${str.slice(str.length - limit + ellipsisLength)}`;
        }
        case "tail": {
          return `${str.slice(0, limit - ellipsisLength)}${ellipsis}`;
        }
        default:
          throw new Error(`Invalid truncation mode: ${truncationMode}`);
      }
    }
    default:
      throw new Error(`Invalid clipMode: ${clipMode}`);
  }
}
