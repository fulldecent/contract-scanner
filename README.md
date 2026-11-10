# Contract scanner

A tool to find all ERC-721 NFT contracts on an EVM blockchain.

Scanning is performed by finding `Transfer` events.

## Setup

Use Node version 24. The version is in [`.node-version`](.node-version). `nvm use` reads `.nvmrc`, not that file. With nvm, run:

```sh
nvm use "$(cat .node-version)"
```

Then install package dependencies. With `yarn` that is:

```sh
yarn install
```

## Run

Run the script with:

```sh
yarn node index.mjs
```

Now your results are in database.db. You can browse this with:

```sh
sqlite3 database.db 'SELECT * FROM contracts LIMIT 10'
```

## References

1. This project is built based on [best practices documented in node.js-template](https://github.com/fulldecent/node.js-template), release v1.2.2. [build-test.yml](.github/workflows/build-test.yml) packs `contract-scanner.tgz` instead of the template's `simple-rpn-calculator.tgz`. The release workflow is omitted. This repository is not published to npm. `better-sqlite3` is `^12.6.2` because 7.6.2 does not compile on Node 24. Run the scanner with `yarn node` because Yarn Plug'n'Play has no `node_modules` directory. Attestation runs only when the head repository is this repository, so a fork pull request can still upload the packed tarball.
