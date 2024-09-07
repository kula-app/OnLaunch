export interface NextAuthConfig {
  url: string;
  provider: {
    credentials: {
      isEnabled: boolean;
    };
    github: {
      clientId?: string;
      clientSecret?: string;
    };
    google: {
      clientId?: string;
      clientSecret?: string;
    };
  };
}
