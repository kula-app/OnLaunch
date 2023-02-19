import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../../../util/auth';

const prisma = new PrismaClient()

export default NextAuth({
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) return null;

                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user) {
                    return;
                } else {
                    const isValid = await verifyPassword(credentials.password.concat(user.salt), user.password);
                    
                    if (!isValid) {
                        throw new Error('Wrong credentials!');
                    }
                    
                    return { email: user.email } as any;
                }
            }
        })
    ],
});