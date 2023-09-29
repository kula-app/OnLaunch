// Return a color label for the text provided for a subscription tag
export const getColorLabel = (subName: string | undefined): string => {
  if (subName?.toLocaleLowerCase().startsWith("premium")) {
    return "purple";
  } else if (subName?.toLocaleLowerCase().startsWith("basic")) {
    return "teal";
  } else {
    return "green";
  }
};

// Return the string to display the nametag
export const translateSubName = (subName: string | undefined): string => {
  return subName?.toLocaleLowerCase().replace("unlimited", "∞") || "";
};
