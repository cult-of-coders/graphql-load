# GraphQL Load

This is a package that is useful to easily aggregate code from your code-base.

```js
import { makeExecutableSchema } from 'graphql-tools';
import { load, getSchema } from 'graphql-load';

// anywhere around your code
load({
  typeDefs: string | string[],
  resolvers: object | object[]
})

// And where you create the server
const schema = makeExecutableSchema(getSchema())
```

Example:

```js
load({
  typeDefs: `
    type User {
      firstname: String
      lastname: String
      fullname: String
    }

    type Query {
      users: [User]
    }
  `
}, {
  User: {
    fullname: _ => `${_.firstname} ${_.lastname}`
  },
  Query: {
    users: () => Users.find().fetch();
  }
})
```

You can run load in multiplace places inside your code, all `typeDefs` and `resolvers` will be merged together so you don't have to worry about that.

After every module has been loaded, you can `getSchema()` and create your GraphQL server. Be careful that you load everything before. If something is missing from your Schema it's most likely that you did not load it.

`load()` also accepts arrays of `typeDefs` and `resolvers`, making it easy to load everything in one place:

```js
import UserType from './entities/User.gql';
import UserResolver from './entities/User.resolver.js';
import CommentType from './entities/Comment.gql';
import CommentResolver from './entities/Comment.resolver.js';

load({
  typeDefs: [UserType, CommentType],
  resolvers: [UserResolver, CommentResolver],
});
```

Or another alternative

```js
// Another way to modularise your GraphQL schemas and resolvers:
// Make sure each module you've got exports a {typeDefs, resolvers} aka GraphQL Module

import UsersModule from './users';
import CommentsModule from './registration';

load([UsersModule, CommentsModule]);

// Where UsersModule & RegistrationModule is in the form of { typeDefs, resolvers }
```

For ease of use in some cases, you can also do this:

```js
import { loadQuery, loadMutation, loadSubscription } from 'graphql-load';

loadQuery(`users(filters: JSON): [User]`, {
  users(_, args, context) {
    return Users.find.fetch();
  },
});

// Same concept applies to loadMutation and loadSubscription
```

You have flexibility to choose how to load your modules:

1.  Load them by typeDefs and resolvers individually or in one place
2.  Load them in a single place by exporting { typeDefs, resolvers }
3.  Make the load in every file individually.

### Peer Dependency

If you want to use it nicely across your ecosystem of apps, specify this package as a peer dependency.
