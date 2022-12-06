# Contract scanner

A tool to find all ERC-721 NFT contracts on an EVM blockchain.

Scanning is performed by finding `Transfer` events.

## Setup

Use Node version 16 or later. If using `nvm`, try:

```sh
nvm use 16
```

Then install package dependencies. With `yarn` that is:

```sh
yarn install
```

## Run

Run the script with:

```
node index.mjs
```

Now your results are in database.db. You can browse this with:

```sh
sqlite3 database.db 'SELECT * FROM contracts LIMIT 10'
```