export class ServerError extends Error {
  constructor(name: string = "ServerError", message: string) {
    super(message);
    this.name = name;
  }
}
