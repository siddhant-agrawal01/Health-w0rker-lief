// // /api/graphql/route.js
// import { ApolloServer } from '@apollo/server';
// import { startServerAndCreateNextHandler } from '@as-integrations/next';
// import { readFileSync } from 'fs';
// import { join } from 'path';
// import resolvers from '../../../lib/resolvers';
// import { PrismaClient } from '@prisma/client';

// // Initialize Prisma client
// const prisma = new PrismaClient();
// const typeDefs = readFileSync(join(process.cwd(), 'lib', 'schema.graphql'), 'utf-8');

// // Create Apollo Server instance
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   formatError: (error) => {
//     console.error('GraphQL Error:', error.message, error.extensions);
//     return {
//       message: error.message,
//       code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
//       path: error.path,
//     };
//   },
// });

// // Start server once during module load
// await server.start();
// console.log('Apollo Server initialized');

// // Create handler
// const handler = startServerAndCreateNextHandler(server, {
//   context: async (req) => ({
//     req,
//     prisma,
//   }),
// });

// // Export handlers for GET and POST requests
// export { handler as GET, handler as POST };



// app/api/graphql/route.js
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { readFileSync } from 'fs';
import { join } from 'path';
import resolvers from '../../../lib/resolvers';
import { PrismaClient } from '@prisma/client';
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

// Initialize Prisma client
const prisma = new PrismaClient();
const typeDefs = readFileSync(join(process.cwd(), 'lib', 'schema.graphql'), 'utf-8');

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error.message, error.extensions);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      path: error.path,
    };
  },
});

// Memoized handler promise
let apolloHandlerPromise;

// Function to start the server and create the handler (runs once)
const getHandler = async () => {
  if (!apolloHandlerPromise) {
    apolloHandlerPromise = server.start().then(() => {
      console.log('Apollo Server initialized');
      return startServerAndCreateNextHandler(server, {
        context: async (req) => ({ req, prisma }),
      });
    });
  }
  return apolloHandlerPromise;
};

// Define the route handler
const routeHandler = async (req, context) => {
  const handler = await getHandler();
  return handler(req, context);
};

// Export handlers for GET and POST requests
export const GET = routeHandler;
export const POST = routeHandler;