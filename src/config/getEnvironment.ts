export function getEnvironment(): {
  [keyof: string]: string | undefined;
} {
  let env: {
    [keyof: string]: string | undefined;
  };
  if (typeof window === "undefined") {
    // Called by the backend, therefore access the process environment
    env = process.env;
  } else {
    // Called by the frontend, therefore access the global environment constant defined in  /__env.js
    const this_window = window as unknown as Window & {
      __env: {
        [keyof: string]: string;
      };
    };
    env = this_window.__env;
  }
  return env ?? {};
}
