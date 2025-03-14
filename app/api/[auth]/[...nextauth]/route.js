// // app/api/auth/[...nextauth]/route.js
// import NextAuth from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         username: { label: 'Username', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         // For testing only; replace with proper auth in production
//         if (credentials.username === 'user' && credentials.password === 'pass') {
//           const user = await prisma.user.upsert({
//             where: { email: `${credentials.username}@example.com` },
//             update: { name: credentials.username },
//             create: {
//               email: `${credentials.username}@example.com`,
//               name: credentials.username,
//               role: 'MANAGER',
//             },
//           });
//           console.log('Credentials user authorized:', user);
//           return { id: user.id, name: user.name, email: user.email, role: user.role };
//         }
//         return null;
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account, profile }) {
//       console.log('Sign-in attempt:', { user, account, profile });
//       if (account.provider === 'google') {
//         try {
//           const email = user.email.toLowerCase();
//           let dbUser = await prisma.user.findUnique({ where: { email } });

//           if (!dbUser) {
//             const newId = require('crypto').randomUUID();
//             dbUser = await prisma.user.create({
//               data: {
//                 id: newId,
//                 name: user.name,
//                 email,
//                 role: 'CARE_WORKER',
//               },
//             });
//             console.log(`Created user: ${dbUser.email} with ID: ${dbUser.id}`);

//             // Verify creation
//             const verifiedUser = await prisma.user.findUnique({ where: { id: newId } });
//             if (!verifiedUser) {
//               console.error('User creation failed:', newId);
//               return false;
//             }
//           } else {
//             console.log(`Existing user: ${dbUser.email} with ID: ${dbUser.id}`);
//           }

//           user.id = dbUser.id;
//           user.role = dbUser.role;
//           return true;
//         } catch (error) {
//           console.error('Sign-in error:', error.message, error.stack);
//           return false;
//         }
//       }
//       return true; // Credentials provider handled in authorize
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.name = user.name;
//         token.email = user.email;
//         token.role = user.role;
//         console.log('JWT token set:', token);
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user = {
//           id: token.id,
//           name: token.name,
//           email: token.email,
//           role: token.role,
//         };
//         console.log('Session updated:', session);
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: '/auth/signin',
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hardcoded Manager details
const MANAGER_EMAIL = 'manager@ashishhospital.com';
const MANAGER_PASSWORD = 'managerpass123';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' }, // Changed back to username to match frontend
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Authorize attempt with credentials:', credentials);
        const { username, password } = credentials;
        const userEmail = username.toLowerCase(); // Treat username as email

        // Find user in the database
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
        });

        console.log('User found in database:', user);

        if (!user) {
          console.log('No user found with email:', userEmail);
          throw new Error('No user found with this email.');
        }

        // Verify password (plaintext for testing; use hashing in production)
        console.log('Comparing passwords:', { dbPassword: user.password, inputPassword: password });
        if (user.password !== password) {
          console.log('Password mismatch for user:', userEmail);
          throw new Error('Invalid username or password. Please try again.');
        }

        // Assign role based on email
        const role = userEmail === MANAGER_EMAIL ? 'MANAGER' : 'CARE_WORKER';
        console.log('User authorized:', { email: user.email, role });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign-in attempt:', { user, account, profile });
      if (account.provider === 'google') {
        try {
          const email = user.email.toLowerCase();
          let dbUser = await prisma.user.findUnique({ where: { email } });

          if (!dbUser) {
            const newId = require('crypto').randomUUID();
            dbUser = await prisma.user.create({
              data: {
                id: newId,
                name: user.name,
                email,
                role: email === MANAGER_EMAIL ? 'MANAGER' : 'CARE_WORKER',
              },
            });
            console.log(`Created user: ${dbUser.email} with ID: ${dbUser.id} and role: ${dbUser.role}`);
          } else {
            console.log(`Existing user: ${dbUser.email} with ID: ${dbUser.id} and role: ${dbUser.role}`);
          }

          user.id = dbUser.id;
          user.role = dbUser.email === MANAGER_EMAIL ? 'MANAGER' : 'CARE_WORKER';
          return true;
        } catch (error) {
          console.error('Sign-in error:', error.message, error.stack);
          return false;
        }
      }
      return true; // Credentials provider handled in authorize
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        console.log('JWT token set:', token);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
        };
        console.log('Session updated:', session);
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