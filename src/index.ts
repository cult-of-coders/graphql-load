import { GraphQLModule, ResolverMap } from './defs';
import { mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

export class Loader {
  protected typeDefs: Array<string> = [];
  protected resolvers: Array<ResolverMap> = [];

  load(modules: GraphQLModule | Array<GraphQLModule>): void {
    modules = Array.isArray(modules) ? modules : [modules];

    modules.forEach(module => {
      if (!module) {
        return;
      }

      const { typeDefs, resolvers } = module;

      if (resolvers) {
        if (Array.isArray(resolvers)) {
          this.resolvers.push(...resolvers);
        } else {
          this.resolvers.push(resolvers);
        }
      }

      if (typeDefs) {
        if (Array.isArray(typeDefs)) {
          this.typeDefs.push(...typeDefs);
        } else {
          this.typeDefs.push(typeDefs);
        }
      }
    });
  }

  loadQuery(typeDefs, resolvers) {
    return this._loadByRootType('Query', typeDefs, resolvers);
  }

  loadMutation(typeDefs, resolvers) {
    return this._loadByRootType('Mutation', typeDefs, resolvers);
  }

  loadSubscription(typeDefs, resolvers) {
    return this._loadByRootType('Subscription', typeDefs, resolvers);
  }

  getSchema(): GraphQLModule {
    return {
      typeDefs: mergeTypes(this.typeDefs, { all: true }),
      resolvers: mergeResolvers(this.resolvers),
    };
  }

  public getTypeDefs() {
    return this.typeDefs;
  }

  public getResolvers() {
    return this.resolvers;
  }

  _loadByRootType(rootType, _typeDefs, _resolvers) {
    const typeDefs = `type ${rootType} { ${_typeDefs} }`;
    const resolvers = { [rootType]: _resolvers };

    this.load({
      typeDefs,
      resolvers,
    });
  }
}

const instance = new Loader();

export default instance;

const load = instance.load.bind(instance);
const getSchema = instance.getSchema.bind(instance);
const loadQuery = instance.loadQuery.bind(instance);
const loadSubscription = instance.loadSubscription.bind(instance);
const loadMutation = instance.loadMutation.bind(instance);

export { load, getSchema, loadQuery, loadSubscription, loadMutation };
