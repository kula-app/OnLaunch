import path from "path";

export class Logger {
  private filename: string;

  constructor(filename: string) {
    if (filename !== "Middleware") {
      this.filename = path.basename(filename);
    } else {
      this.filename = filename;
    }
  }

  private getTimeStamp(): string {
    return new Date().toISOString();
  }

  public log(message: string): void {
    console.log(`[${this.getTimeStamp()}] [LOG] [${this.filename}] ${message}`);
  }

  public error(message: string): void {
    console.error(
      `[${this.getTimeStamp()}] [ERROR] [${this.filename}] ${message}`
    );
  }

  public verbose(message: string): void {
    console.log(
      `[${this.getTimeStamp()}] [VERBOSE] [${this.filename}] ${message}`
    );
  }
}
