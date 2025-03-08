// import { ApolloServer } from '@apollo/server';
// import { startServerAndCreateNextHandler } from '@as-integrations/next';
// import { readFileSync } from 'fs';
// import { join } from 'path';
// import resolvers from '@/lib/resolvers';

// const typeDefs = readFileSync(join(process.cwd(), 'lib', 'schema.graphql'), 'utf-8');

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// export const GET = startServerAndCreateNextHandler(server);
// export const POST = startServerAndCreateNextHandler(server);
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { readFileSync } from 'fs';
import { join } from 'path';
import resolvers from '@/lib/resolvers';

const typeDefs = readFileSync(join(process.cwd(), 'lib', 'schema.graphql'), 'utf-8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Initialize the server and handler once
let handlerPromise = (async () => {
  await server.start();
  return startServerAndCreateNextHandler(server);
})();

export async function GET(req) {
  const handler = await handlerPromise;
  return handler(req);
}

export async function POST(req) {
  const handler = await handlerPromise;
  return handler(req);
}