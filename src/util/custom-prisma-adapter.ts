import prisma from "@/services/db";
import type { Account, AuthToken, Session, User } from "@prisma/client";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken as AdapterVerificationToken,
} from "next-auth/adapters";
import type { ProviderType } from "next-auth/providers";
import { v4 as uuid } from "uuid";
import { Logger } from "./logger";

const logger = new Logger(__filename);

function mapUserToAdapterUser(user: User): AdapterUser {
  return {
    id: user.authId ?? user.id.toString(),

    name:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : (user.firstName ?? user.lastName ?? ""),
    email: user.email ?? "",
    emailVerified: user.verifiedAt,

    image: null,
  };
}

function mapAccountToAdapterAccount(
  account: Account & {
    user: {
      id: number;
      authId: string | null;
    };
  },
): AdapterAccount {
  return {
    userId: account.user.authId ?? account.user.id.toString(),
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    type: account.type as ProviderType,

    token_type: account.tokenType ?? undefined,
    access_token: account.accessToken ?? undefined,
    id_token: account.idToken ?? undefined,
    refresh_token: account.refreshToken ?? undefined,
    scope: account.scope ?? undefined,

    expires_at: account.expiresIn ?? undefined,
    session_state: account.sessionState ?? undefined,
  };
}

function mapSessionToAdapterSession(
  session: Session & {
    user: {
      id: number;
      authId: string | null;
    };
  },
): AdapterSession {
  return {
    sessionToken: session.sessionToken,
    userId: session.user.authId ?? session.user.id.toString(),
    expires: session.expires,
  };
}

function mapAuthTokenToAdapterAuthToken(
  authToken: AuthToken,
): AdapterVerificationToken {
  return {
    identifier: authToken.identifier,
    token: authToken.token,
    expires: authToken.expiresAt,
  };
}

/**
 * This is a custom adapter for Next-Auth that uses Prisma as the database.
 *
 * It is based on the official Prisma adapter, but it has been modified to work with our custom Prisma schema.
 */
export function PrismaAdapter(): Required<Adapter> {
  return {
    // User
    createUser: async (data) => {
      logger.log(`Creating user with data: ${JSON.stringify(data)}`);
      const user = await prisma.user.create({
        data: {
          authId: uuid(),
          firstName: data.name,
          lastName: undefined,

          email: data.email,
          isVerified: !!data.emailVerified,
          verifiedAt: data.emailVerified,
        },
      });
      return mapUserToAdapterUser(user);
    },
    getUser: async (id) => {
      logger.log(`Getting user with id: ${id}`);
      const user = await prisma.user.findFirst({
        where: {
          authId: id,
        },
      });
      if (!user) {
        return null;
      }
      return mapUserToAdapterUser(user);
    },
    getUserByEmail: async (email) => {
      logger.log(`Getting user with email: ${email}`);
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      if (!user) {
        return null;
      }
      return mapUserToAdapterUser(user);
    },
    async getUserByAccount(provider_providerAccountId) {
      logger.log(
        `Getting user by account with provider ${provider_providerAccountId.provider} and account id ${provider_providerAccountId.providerAccountId}`,
      );
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId,
        },
        select: { user: true },
      });
      if (!account?.user) {
        return null;
      }
      return mapUserToAdapterUser(account.user);
    },
    updateUser: async (user) => {
      logger.log(`Updating user with data: ${JSON.stringify(user)}`);
      const existingUser = await prisma.user.findFirstOrThrow({
        where: {
          authId: user.id,
        },
      });
      const updatedUser = await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          updatedAt: new Date(),

          email: user.email,
          firstName: user.name,

          isVerified: !!user.emailVerified,
          verifiedAt: user.emailVerified,
        },
      });
      return mapUserToAdapterUser(updatedUser);
    },
    deleteUser: async (id) => {
      logger.log(`Deleting user with id: ${id}`);
      const existingUser = await prisma.user.findFirstOrThrow({
        where: {
          authId: id,
        },
      });
      const deletedUser = await prisma.user.delete({
        where: {
          id: existingUser.id,
        },
      });
      return mapUserToAdapterUser(deletedUser);
    },
    // Account
    linkAccount: async (data) => {
      logger.log(`Linking account with data: ${JSON.stringify(data)}`);
      const user = await prisma.user.findFirstOrThrow({
        where: {
          authId: data.userId,
        },
      });
      const account = await prisma.account.create({
        data: {
          userId: user.id,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refreshToken: data.refresh_token ?? null,
          accessToken: data.access_token ?? null,
          expiresIn: data.expires_at ?? null,
          tokenType: data.token_type ?? null,
          scope: data.scope ?? null,
          idToken: data.id_token ?? null,
          sessionState: data.session_state ?? null,
        },
        include: {
          user: {
            select: {
              id: true,
              authId: true,
            },
          },
        },
      });
      return mapAccountToAdapterAccount(account);
    },
    unlinkAccount: async (provider_providerAccountId) => {
      logger.log(
        `Unlinking account with provider ${provider_providerAccountId.provider} and account id ${provider_providerAccountId.providerAccountId}`,
      );
      const account = await prisma.account.delete({
        where: {
          provider_providerAccountId,
        },
        include: {
          user: {
            select: {
              id: true,
              authId: true,
            },
          },
        },
      });
      return mapAccountToAdapterAccount(account);
    },
    async getSessionAndUser(sessionToken) {
      logger.log(
        `Getting session and user with session token: ${sessionToken}`,
      );
      const userAndSession = await prisma.session.findUnique({
        where: {
          sessionToken,
        },
        include: {
          user: true,
        },
      });
      if (!userAndSession) {
        return null;
      }
      return {
        user: mapUserToAdapterUser(userAndSession.user),
        session: mapSessionToAdapterSession(userAndSession),
      };
    },
    // Sessions
    createSession: async (data) => {
      logger.log(`Creating session with data: ${JSON.stringify(data)}`);
      const user = await prisma.user.findFirstOrThrow({
        where: {
          authId: data.userId,
        },
      });
      const session = await prisma.session.create({
        data: {
          sessionToken: data.sessionToken,
          expires: data.expires,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              authId: true,
            },
          },
        },
      });
      return mapSessionToAdapterSession(session);
    },
    updateSession: async (data) => {
      logger.log(`Updating session with data: ${JSON.stringify(data)}`);
      const session = await prisma.session.update({
        where: {
          sessionToken: data.sessionToken,
        },
        data: {
          ...data,
          userId: undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              authId: true,
            },
          },
        },
      });
      return mapSessionToAdapterSession(session);
    },
    deleteSession: async (sessionToken) => {
      logger.log(`Deleting session with session token: ${sessionToken}`);
      const session = await prisma.session.delete({
        where: { sessionToken },
        include: {
          user: {
            select: {
              id: true,
              authId: true,
            },
          },
        },
      });
      return mapSessionToAdapterSession(session);
    },
    // Verification Tokens
    createVerificationToken: async (data) => {
      logger.log(
        `Creating verification token with data: ${JSON.stringify(data)}`,
      );
      const authToken = await prisma.authToken.create({
        data: {
          identifier: data.identifier,
          token: data.token,
          expiresAt: data.expires,
        },
      });
      return mapAuthTokenToAdapterAuthToken(authToken);
    },
    useVerificationToken: async (identifier_token) => {
      logger.log(
        `Using verification token with identifier token: ${identifier_token}`,
      );
      const authToken = await prisma.authToken.update({
        where: {
          identifier_token: identifier_token,
        },
        data: {
          isArchived: true,
        },
      });
      if (!authToken) {
        return null;
      }
      return mapAuthTokenToAdapterAuthToken(authToken);
    },
  };
}
