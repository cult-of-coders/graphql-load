export interface FunctionMap {
  [key: string]: Function;
}

export interface ResolverMap {
  Query?: FunctionMap;
  Mutation?: FunctionMap;
  Subscription?: FunctionMap;
}

export interface GraphQLModule {
  typeDefs?: string | string[];
  resolvers?: ResolverMap | ResolverMap[];
}
