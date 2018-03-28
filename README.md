# GraphQL Load

This package is useful for stitching your type definitions and resolvers together, from various places,
also helps you to modularize your GraphQL API

First you `load()` all the typeDefs and resolvers, then, at the end where you create your server, you `getSchema()` which is represents everything you loaded.

```bash
npm install --save graphql-load
```

## Example

```js
import { makeExecutableSchema } from 'graphql-tools';
import { load, getSchema } from 'graphql-load';

// anywhere around your code
load({
  typeDefs: `
    type Query {
      sayHello: String
    }
  `,
  resolvers: {
    Query: {
      sayHello: () => 'Hello!',
    },
  },
});

// after everything got loaded, create the GraphQLSchema
const schema = makeExecutableSchema(getSchema());
```

`getSchema()` returns an object of this form: `{typeDefs, resolvers}`

Be careful that you load everything before you do `getSchema()`. If something is missing from your Schema it's most likely that you did not load it before.

## Merging

Both type definitions and resolvers get merged meaning you can do something like:

```js
load({
  typeDefs: `type Query { sayHello: String }`,
  resolvers: {
    Query: { sayHello: () => 'Hello' },
  },
});

load({
  typeDefs: `type Query { sayGoodbye: String }`,
  resolvers: {
    Query: { sayGoodbye: () => 'Goodbye' },
  },
});
```

## Type Extension

If you have a certain type that represents an entity, a `User` for example, you can extend it's definitions too:

```js
load({
  typeDefs: `
    type User {
      firstname: String
      lastname: String
    }
  `,
});

load({
  typeDefs: `
    type User {
      fullname: String
    }
  `,
  resolvers: {
    User: { fullname: _ => `${_.firstname} ${_.lastname}` },
  },
});
```

It does not matter the order you load them, they are all merged in one go.

## GraphQL Module

When we're dealing with large scale we tend to separate concerns, for our story here, separating concerns means separating `typeDefs` and `resolvers` in their "concerned" module.

We need to introduce a new term `GraphQLModule` which is simply an object containing `{typeDefs, resolvers}`

The interface looks something like this:

```ts
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
```

It's your choice whether you do `load()` in many places, or just in one place in your code. Because you're a careful developer and you like abstracting things, you're most likely going to use it in one place that aggregates all your `GraphQL Modules` something like this:

```js
// Each module here returns {typeDefs, resolvers}
import UserModule from './modules/users/graphql';
import InvoicesModule from './modules/invoices/graphql';
import PaymentsModule from './modules/payments/graphql';

// Note: You can load a single module or an array of modules
load([UserModule, InvoicesModule, PaymentsModule]);
```

How a module can look like:

```js
// This is just an example to illustrate how you can use it
// It's flexible enough and ultimately it's up to you how you choose to structure it

// ./modules/users/graphql
import UserType from './types/User';
import UserProfileType from './types/UserProfile';
import UserResolver from './User.resolver';

// Note, typeDefs can also be an array, resolvers as well
const typeDefs = [UserType, UserProfileType];
const resolvers = [UserResolver];

export default { typeDefs, resolvers };
```

## Structure

This is an opinionated way of structuring your schema, it may work for some, it may not work for others, but this pattern is what we found to be the most useful:

### Entities

Because Query is a `type` and Mutation is a `type` mixing them with actual entities (objects in your database for example) can get confusing, so let's create clear distinction between these.

```js
// graphql/entities/index.js
// If you have, let's say 100 entities, it's ok to separate them in their own folders ofcourse
import UserType from './entities/User.gql';
import UserResolver from './entities/User.resolver.js';
import CommentType from './entities/Comment.gql';
import CommentResolver from './entities/Comment.resolver.js';

export default {
  typeDefs: [UserType, CommentType],
  resolvers: [UserResolver, CommentResolver],
};
```

You could store fragments inside the type itself.

### Query & Mutation & Subscription

In a folder called `modules` you will create separate folders containing queries, mutations, subscriptions, for each concern we've got:

We believe that it's ok to store your subscriptions in your `Query` definition file, as they may be very related.

```js
// graphql/modules/user/query.js
const typeDefs = `
  type Query {
    getUsers(
      active: Boolean
    ): [User]
  }
`

const resolvers = {
  Query: {
    getUsers(_) => { ... }
  }
}

export default { typeDefs, resolvers }
```

Maybe you find the `type Query` and other stuff repetitive, for this we created a `wrap()` function:

```ts
wrap('Query', module: GraphQLModule | GraphQLModule[])
```

```js
import { wrap } from 'graphql-load';

// Note that wrap doesn't load anything, it just wraps stuff for you.
export default wrap('Query', {
  typeDefs: `
    getUsers: [User]
  `,
  resolvers: {
    getUsers() { ... }
  }
})
```

Now to aggregate at module level:

```js
// graphql/modules/user/index.js
import QueryModule from './query.js';
import MutationModule from './mutation.js';

// return an array always
export default [QueryModule, MutationModule];
```

Now to aggregate all modules:

```js
// graphql/modules/index.js
import UserModules from './user';
import InvoiceModules from './invoice';

export default [...UserModules, ...InvoiceModules];
```

Now stich everything up:

```js
// graphql/index.js
import { load } from 'graphql-load';
import EntitiesModule from './entities';
import APIModules from './modules';

load([EntitiesModule, ...APIModules]);

// maybe here? export default getSchema();
```

### Independent Modules & Extensions

There may be scenarios where you want to develop stand-alone modules, for example a chat application,
we recommend that you do not depend on this package for this, and don't automatically inject schema via `load()`, rather give the future developers the ability to choose, and make your module only export a `GraphQL Module` and load it where you need it.

## The Loader

You can have independent loaders and independent schemas.

```js
import { Loader } from 'graphql-load';

const loader = new Loader();

loader.load(...);
loader.getSchema();
```

### Peer Dependency

If you want to use it nicely across your ecosystem of npm modules, specify this package as a peer dependency. And you can inject your loaded types by default and independently.

## Premium Support

Looking to start or develop your new project with **GraphQL**? Reach out to us now, we can help you along every step: contact@cultofcoders.com. We specialise in building high availability GraphQL APIs and with the help with our awesome frontend developers we can easily consume any GraphQL API.
