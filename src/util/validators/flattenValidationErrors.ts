import type { ValidationError } from "class-validator";

export function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];
  const visit = (error: ValidationError) => {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children?.length) {
      for (const child of error.children) {
        visit(child);
      }
    }
  };
  for (const error of errors) {
    visit(error);
  }
  if (messages.length === 0) {
    return ["An unknown error occurred"];
  }
  return messages;
}
