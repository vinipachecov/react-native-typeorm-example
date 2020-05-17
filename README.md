# Setup TypeORM with React-Native

Offline first apps in react-native can be intimidating. One of the options available is to use TypeORM with sqlite.
I've faced a great amount of trouble trying to succesfully setup TypeORM with React-Native and this is my attempt to help.
This tutorial will be based on a React-Native version higher than 0.60.
In this tutorial I'll assume you are using a React-Native project using "react-native init" and with a [minimal typescript setup](https://reactnative.dev/docs/typescript).
I'll use the entity models from [typeorm example](https://github.com/typeorm/react-native-example) to make things simple.

## Install react-native-sqlite-storage

First step will be to install the [package](https://github.com/andpor/react-native-sqlite-storage):

```
yarn add react-native-sqlite-storage && cd ios && pod install && cd ..
```

Notice I've set the pod installation with the command above so everything should be setup after the command succeded.
