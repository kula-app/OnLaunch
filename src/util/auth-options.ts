import { loadServerConfig } from "@/config/loadServerConfig";
import prisma from "@/services/db";
import type { NextAuthOptions } from "next-auth";
import { User as AuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import type { Provider } from "next-auth/providers";
import { verifyPassword } from "./auth";
import { PrismaAdapter } from "./custom-prisma-adapter";
import { Logger } from "./logger";

const logger = new Logger(__filename);

// augment next-auth session that's used throughout
// the application to include an 'id' field
declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      name: string;
    };
  }
}

const providers: Provider[] = [];

const config = loadServerConfig();
if (config.nextAuth.provider.credentials.isEnabled) {
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<AuthUser | null> => {
        if (!credentials) {
          // Do not allow anonymous sign in
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            NOT: {
              isDeleted: true,
            },
          },
        });

        if (!user) {
          throw new Error("Wrong credentials!");
        }
        if (!user.password || !user.salt) {
          logger.error(`User ${user.id} has no password or salt`);
          throw new Error("Wrong credentials!");
        }
        const isValid = await verifyPassword(
          credentials.password,
          user.salt,
          user.password,
        );
        if (!isValid) {
          throw new Error("Wrong credentials!");
        }
        if (!user.isVerified) {
          throw new Error("Verify account!");
        }

        return {
          id: user.authId,
          email: user.email,
          name: user.firstName?.concat(" ").concat(user.lastName as string),
        };
      },
    }),
  );
}

if (
  config.nextAuth.provider.github.clientId &&
  config.nextAuth.provider.github.clientSecret
) {
  providers.push(
    GitHubProvider({
      clientId: config.nextAuth.provider.github.clientId,
      clientSecret: config.nextAuth.provider.github.clientSecret,
    }),
  );
}

if (
  config.nextAuth.provider.google.clientId &&
  config.nextAuth.provider.google.clientSecret
) {
  providers.push(
    GoogleProvider({
      clientId: config.nextAuth.provider.google.clientId,
      clientSecret: config.nextAuth.provider.google.clientSecret,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  callbacks: {
    async session({ session, token }) {
      if (!token.sub) {
        logger.error(`No token sub found: ${JSON.stringify(token)}`);
        return session;
      }
      const user = await prisma.user.findFirst({
        where: {
          authId: token.sub,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    },
  },
  providers: providers,
};
