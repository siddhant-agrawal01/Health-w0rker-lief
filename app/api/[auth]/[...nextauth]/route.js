import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
              role: 'MANAGER',
            },
          });
          console.log('Authorized user:', user); // Add debug logging
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign-in attempt:', { user, account, profile });
      if (account.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
          });
    
          if (!existingUser) {
            const newId = require('crypto').randomUUID();
            const newUser = await prisma.user.create({
              data: {
                id: newId,
                name: user.name,
                email: user.email.toLowerCase(),
                role: 'MANAGER',
              },
            });
            console.log(`Created new user: ${newUser.email} with ID: ${newUser.id}, Role: ${newUser.role}`);
            user.id = newId;
            user.role = newUser.role; // Ensure role is set in user object
          } else {
            console.log(`User ${existingUser.email} already exists with ID: ${existingUser.id}, Role: ${existingUser.role}`);
            user.id = existingUser.id;
            user.role = existingUser.role; // Ensure role is set in user object
          }
          return true;
        } catch (error) {
          console.error('Error syncing user with Prisma:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = dbUser?.role || user.role;
        console.log('JWT token:', token);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        console.log('Session:', session);
      }
      return session;
    },
   
    
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };