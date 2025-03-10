// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials.username === 'user' && credentials.password === 'pass') {
          const user = await prisma.user.upsert({
            where: { email: credentials.username },
            update: { name: credentials.username },
            create: {
              email: credentials.username,
              name: credentials.username,
              role: 'CARE_WORKER',
            },
          });
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        const existingUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
          },
          create: {
            email: user.email,
            name: user.name,
            role: 'CARE_WORKER',
          },
        });
        user.id = existingUser.id;
        user.role = existingUser.role;
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };