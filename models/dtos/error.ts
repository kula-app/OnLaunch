interface ErrorDto {
  message: string;
}

function getErrorDto(customMessage?: string): ErrorDto {
  return {
    message: customMessage || "An error has occurred",
  };
}
