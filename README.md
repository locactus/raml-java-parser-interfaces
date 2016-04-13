# RAML Definition System

> This repository contains a set of interfaces that represents a declarative description of the RAML specification.

**IMPORTANT: This is still in development and should be considered alpha.**

## Installation

### From NPM

```
npm install java-raml-parser-interfaces --save
```

### From Sources

```
typings install
npm install
tsc
```

## Generate

Make sure you executed all necessary installation steps before you try to generate anything.
The result files can be found inside the `./java` subfolder ending with `.json`.

```
node dist/generateSpecInterfaces.js
```

You may also specify the `-dstPath` parameter in order to override default `./java` destination path.


## RAML version support

Currently, the definition system provides interfaces for RAML 0.8 and 1.0 RC1 version.

## License

Apache License 2.0
