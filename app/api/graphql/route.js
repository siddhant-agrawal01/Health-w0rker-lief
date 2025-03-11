import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { readFileSync } from 'fs';
import { join } from 'path';
import resolvers from '../../../lib/resolvers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const typeDefs = readFileSync(join(process.cwd(), 'lib', 'schema.graphql'), 'utf-8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error.message, error.extensions);
    return error;
  },
});

let handler;

const initializeHandler = async () => {
  if (!handler) {
    await server.start();
    handler = startServerAndCreateNextHandler(server, {
      context: async (req, res) => ({ req, res, prisma }),
    });
  }
  return handler;
};

export async function GET(req) {
  const graphqlHandler = await initializeHandler();
  return graphqlHandler(req);
}

export async function POST(req) {
  const graphqlHandler = await initializeHandler();
  return graphqlHandler(req);
}