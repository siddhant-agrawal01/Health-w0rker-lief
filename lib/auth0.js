import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();









// import { Auth0Client } from '@auth0/nextjs-auth0/server';
// import prisma from './prisma';

// export const auth0 = new Auth0Client({
//   async afterCallback(req, session) {
//     const { user } = session;
//     const existingUser = await prisma.user.findUnique({
//       where: { email: user.email },
//     });
//     if (!existingUser) {
//       await prisma.user.create({
//         data: {
//           name: user.name || 'Unknown',
//           email: user.email,
//           role: 'CARE_WORKER',
//         },
//       });
//     }
//     return session;
//   },
// });