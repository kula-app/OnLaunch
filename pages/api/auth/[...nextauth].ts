import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../../../util/auth";

const prisma: PrismaClient = new PrismaClient();

// augment next-auth session that's used throughout
// the application to include an 'id' field
declare module 'next-auth' {
  interface Session {
      user: {
          id: number
          email: string
      }
  }
}

export const authOptions: NextAuthOptions ={
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.sub);
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

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
        } else {
          const isValid = await verifyPassword(
            credentials.password,
            user.salt as string,
            user.password as string
          );

          if (!isValid) {
            throw new Error("Wrong credentials!");
          }

          if (!user.isVerified) {
            throw new Error("Verify account!");
          }

          return { id: user.id, email: user.email } as any;
        }
      },
    }),
  ],
};

export default NextAuth(authOptions)