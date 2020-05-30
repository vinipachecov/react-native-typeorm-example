# Setup TypeORM with React-Native

Offline first apps in react-native can be intimidating. One of the options available is to use TypeORM with sqlite.
I've faced a great amount of trouble trying to successfully setup TypeORM with React-Native and this is my attempt to help.
This tutorial will be based on a React-Native version higher than 0.60.
In this tutorial, I'll assume you are using a React-Native project using "react-native init" and with a [minimal typescript setup](https://reactnative.dev/docs/typescript).
I'll use the entity models from [typeorm example](https://github.com/typeorm/react-native-example) to make things simple.

## Install react-native-sqlite-storage

The first step will be to install the [package](https://github.com/andpor/react-native-sqlite-storage):

```
yarn add react-native-sqlite-storage && cd ios && pod install && cd ..
```

Notice I've set the pod installation with the command above so everything should be setup after the command finished.

## TypeORM

Setting typeorm can be frustrating because of the latest updates and few threads about last react-native versions. 
Let's begin by installing the lib and its dependencies:

```
yarn add typeorm
```

```
yarn add -D @types/node @babel/plugin-proposal-decorators babel-plugin-transform-typescript-metadata
```

Both babel plugins are required due to the annotations used by typeorm in the entities files to describe column types.

Add both plugins to your babel.config.js:

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'babel-plugin-transform-typescript-metadata',
    ['@babel/plugin-proposal-decorators', {legacy: true}],
  ],
};
```

Now add/change the following properties in your tsconfig.json file:

```json
{
    "strict": false,
    "allowSyntheticDefaultImports": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "skipLibCheck": true
} 
```

Great now the build setup is ready, let's add some code related to typeorm .
First I'll add the three entities as shown in the [official typeorm example](https://github.com/typeorm/react-native-example), which are: Author, Posts, Category.
In case you want to copy here they are:

```ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm/browser';
import {Post} from './post';

@Entity('author')
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({nullable: true})
  birthdate: string;

  @OneToMany((type: any) => Post, (post) => post.author)
  posts: Post[];
}
```

```ts
import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm/browser';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm/browser';
import {Category} from './category';
import {Author} from './author';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  text: string;

  @ManyToMany((type) => Category, {
    cascade: ['insert'],
  })
  @JoinTable()
  categories: Category[];

  @ManyToOne((type) => Author, (author) => author.posts, {
    cascade: ['insert'],
  })
  author: Author;
}
```

In our main component, I've added two methods to help creating a connection with our sqlite database, and a second one to retrieve all authors from it.

```tsx
import React, { useCallback, useEffect, ReactNode, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { createConnection, getRepository, Connection } from 'typeorm/browser';

import { Author } from './entities/author';
import { Category } from './entities/category';
import { Post } from './entities/post';

const AuthorTile = ({
  name,
  birthdate,
}: {
  name: string;
  birthdate: string;
}) => {
  return (
    <View>
      <Text>{name}</Text>
      <Text>{birthdate}</Text>
    </View>
  );
};

const App: () => ReactNode = () => {
  const [defaultConnection, setconnection] = useState<Connection | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const setupConnection = useCallback(async () => {
    try {
      const connection = await createConnection({
        type: 'react-native',
        database: 'test',
        location: 'default',
        logging: ['error', 'query', 'schema'],
        synchronize: true,
        entities: [Author, Category, Post],
      });
      setconnection(connection);
      getAuthors();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getAuthors = useCallback(async () => {
    const authorRepository = getRepository(Author);
    let result = await authorRepository.find();
    if (result.length === 0) {
      const newAuthor = new Author();
      newAuthor.birthdate = '10-03-1940';
      newAuthor.name = 'Chuck Norris';
      await authorRepository.save(newAuthor);
      result = await authorRepository.find();
    }    
    setAuthors(result);
  }, []);

  useEffect(() => {
    if (!defaultConnection) {
      setupConnection();
    } else {
      getAuthors();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My List of Authors</Text>
      {authors.map((author) => (
        <AuthorTile key={author.id.toString()} {...} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 16, color: 'black' },
});

export default App;

```

Notice that the type of connection needs to be "type: 'react-native'".

- SetupConnection: creates a valid typeorm connection to a database called 'test'. This can be changed.
- Synching is a development property that will drop and create your database every run. My suggestion is to implement your own forceSync method.

The getAuthors callback is where the typeorm repository magic appears. For the sake of the tutorial I've inserted a minimum SQL insert to have something to show:


```ts
 const getAuthors = useCallback(async () => {
    const authorRepository = getRepository(Author);
    let result = await authorRepository.find();
    if (result.length === 0) {
      const newAuthor = new Author();
      newAuthor.birthdate = '10-03-1940';
      newAuthor.name = 'Chuck Norris';
      await authorRepository.save(newAuthor);
      result = await authorRepository.find();
    }    
    setAuthors(result);
  }, []);
  ```

  If everything went well the result should be:

  ![Android](https://github.com/vinipachecov/react-native-typeorm-example/blob/master/tutorial-pics/end-picture.png?raw=true)
  ![IOS](https://github.com/vinipachecov/react-native-typeorm-example/blob/master/tutorial-pics/ios-picture.png?raw=true)
