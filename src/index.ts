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

  static wrap(rootType, _module: GraphQLModule | GraphQLModule[]) {
    const modules = Array.isArray(_module) ? _module : [_module];

    let typeDefs = [];
    let resolvers = [];

    modules.forEach(module => {
      if (module.typeDefs) {
        const moduleTypeDefs = Array.isArray(module.typeDefs)
          ? module.typeDefs
          : [module.typeDefs];

        moduleTypeDefs.forEach(moduleTypeDef => {
          typeDefs.push(`type ${rootType} { ${moduleTypeDef} }`);
        });
      }
      if (module.resolvers) {
        const moduleResolvers = Array.isArray(module.resolvers)
          ? module.resolvers
          : [module.resolvers];

        moduleResolvers.forEach(moduleResolver => {
          resolvers.push({
            [rootType]: moduleResolver,
          });
        });
      }
    });

    return {
      typeDefs,
      resolvers,
    };
  }
}

const instance = new Loader();

export default instance;

const load = instance.load.bind(instance);
const getSchema = instance.getSchema.bind(instance);
const wrap = Loader.wrap;

export { load, getSchema, wrap };
