export interface ErrorDto {
  message: string;
}

export function getErrorDto(customMessage?: string): ErrorDto {
  return {
    message: customMessage || 'An error has occurred',
  };
}
