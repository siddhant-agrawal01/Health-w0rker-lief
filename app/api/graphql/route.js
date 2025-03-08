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

export const GET = startServerAndCreateNextHandler(server);
export const POST = startServerAndCreateNextHandler(server);