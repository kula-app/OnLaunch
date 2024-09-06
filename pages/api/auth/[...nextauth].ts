import prisma from "@/lib/services/db";
import { verifyPassword } from "@/util/auth";
import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";

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

const providers: Provider[] = [
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
      }
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

      return {
        id: user.id,
        email: user.email,
        name: user.firstName?.concat(" ").concat(user.lastName as string),
      } as any;
    },
  }),
];

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      console.log("session", session);
      if (session.user) {
        session.user.id = Number(token.sub);
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  providers: providers,
};

export default NextAuth(authOptions);
