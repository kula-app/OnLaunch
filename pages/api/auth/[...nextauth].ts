import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../../../util/auth";

const prisma = new PrismaClient();

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
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
});
