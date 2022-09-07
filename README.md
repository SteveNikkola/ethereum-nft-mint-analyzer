# ethereum-nft-mint-analyzer

A simple application to gather the mint history of any `ERC721` or `ERC1155` token on the ethereum blockchain, and store in a `Postgres` database to be queried.

## Requirements

* `Node.js`
  * Install from a package manager: [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)
  * Install from source or installer: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
  * Alternatively, and recommended, install via NVM for more flexibility in switching Node Versions: [https://github.com/nvm-sh/nvm#installing-and-updating](https://github.com/nvm-sh/nvm#installing-and-updating)
* `TypeScript`
  * This is installed via npm, but more info on `TypeScript` can be found here: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
* `PostgreSQL` and `Flyway`, via `docker compose`
  * Docker/Compose install: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
  * PostgreSQL info: [https://www.postgresql.org/](https://www.postgresql.org/)
  * Flyway info: [https://flywaydb.org/](https://flywaydb.org/)
* `alchemy`
  * You will need to create an account on alchemy and setup an app on `Mainnet`. This will give you an api key to use in the app. Get started here: [https://www.alchemy.com/](https://www.alchemy.com/)
* A Postgres `DB client`. A couple suggestions:
  * psql (this can be installed via Homebrew or other package managers), is a terminal based client: [https://www.postgresql.org/docs/current/app-psql.html](https://www.postgresql.org/docs/current/app-psql.html)
  * dbeaver, a more user friendly GUI based client: [https://dbeaver.io/](https://dbeaver.io/)

## Setup

### dependencies
As dependencies are managed by [npm](https://www.npmjs.com/) (node package manager), simply clone this repo and then run the following to install dependencies:

```bash
npm install
```

You will see output similar to the following:

```bash
added 161 packages, and audited 162 packages in 3s

34 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### config
This app uses the [npm dotenv package](https://www.npmjs.com/package/dotenv) to handle configuration.

Open the [.env](./.env) file, and update the secrets that are blank here:

```env
ALCHEMY_API_KEY=
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_HOST=0.0.0.0
POSTGRES_DB=nft_mint_history
POSTGRES_PORT=5432
```

## Running

1. Update the `contractAddress` and `contractAlias` fields in the [gather-mint-history.ts](./src/gather-mint-history.ts) file for the contract you are interested in.
2. Start the docker containers to create the `postgres` database, and on first startup, `flyway` will perform db migrations to setup the `mint_history` table
  ```bash
  docker compose up
  ```
  *note:* alternatively, use `docker compose up -d` to start the containers in the background, and then `docker compose logs -f` to view logs, if desired

3. From the root of the project (In a separate terminal, if you did not use the `-d` command with `docker compse`), compile the TypeScript files, and run the app to populate mint history
  ```bash
  npx tsc && node build/gather-mint-history.js
  ```

## Querying Data

Now that you have mint history for an NFT, you can perform queries against the data. A couple examples:

### Example 1
*Find all minters for a specific NFT, sorted by who minted the most*
  ```sql
  select mh.wallet_address, count(*)
  from mint_history mh 
  where mh.contract_alias = 'BAYC'
  group by mh.wallet_address
  order by count desc;
  ```
(psql output)
  ```bash
                 wallet_address               | count
  --------------------------------------------+-------
   0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459 |  1250
   0x721931508df2764fd4f70c53da646cb8aed16ace |   480
   0x442dccee68425828c106a3662014b4f131e3bd9b |   420
   0xdcae87821fa6caea05dbc2811126f4bc7ff73bd1 |   150
   0x5b20783f4baabd33bb53dd77c9b0459f5701e36a |   135
   0x69bab6810fa99475854bca0a3dd72ae6a0728ece |   134
   0x020ca66c30bec2c4fe3861a94e4db4a498a35872 |   120
   0x29b1b2d083456fd07b19649f8b85f9927a29b1ab |   120
   0xb30452beca9c462bc6773582c9e0d70cc60e7321 |   105
   0x60fd35191ffa774e40934efb8ed34b2ec42da320 |   100
   0xb53349160e38739b37e4bbfcf950ed26e26fcb41 |   100
   0xfeae9fe11170fc19b6f40796fd1debfa360daacc |   100
   0x6bf97f2534be2242ddb3a29bfb24d498212dcded |   100
   0xcc47fcbfdd6e558fb39cf5ef4d92e59890476b86 |   100
   0x29b3340f6c8e292a65ab5067632fe7e65fcb7b12 |   100
   0x7405fe24003a50e4f4117d35e9b5a9f5e512fede |   100
   0x1b523dc90a79cf5ee5d095825e586e33780f7188 |    80
   0x720a4fab08cb746fc90e88d1924a98104c0822cf |    80
   0xddb92a96054132801cae3943b2f966fc2c308ac8 |    76
   0x7193b82899461a6ac45b528d48d74355f54e7f56 |    70
   0x35f0686c63f50707ea3b5bace186938e4e19f03a |    65
   0xeee5eb24e7a0ea53b75a1b9ad72e7d20562f4283 |    62
  ```

### Example 2
*find wallets that minted 2 popular NFTs early*

  ```sql
  SELECT mh1.wallet_address, mh1.contract_alias, mh1.token_id, mh2.contract_alias, mh2.token_id
  FROM mint_history mh1
  INNER JOIN mint_history mh2 ON (mh1.wallet_address = mh2.wallet_address)
  WHERE mh1.contract_alias  = 'goblintown'
  and mh1.token_id < 3000
  AND mh2.contract_alias  = 'DigiDaigaku'
  and mh2.token_id < 500
  order by mh1.token_id asc;
  ```
(psql output)
  ```bash
                 wallet_address               | contract_alias | token_id | contract_alias | token_id
  --------------------------------------------+----------------+----------+----------------+----------
   0xd4c4a4b11f80dc75ee534c0da478cfe388b5baad | goblintown     |     1101 | DigiDaigaku    |      418
   0x76da715b266323f4eb9c9ade2127e0611f9f6c30 | goblintown     |     1141 | DigiDaigaku    |      263
   0x8f447610571da2c6b25cb48b8f86cd333fc9ad0b | goblintown     |     1894 | DigiDaigaku    |      445
   0x34d2c39996db222a2499fc00a355830ef28178af | goblintown     |     1897 | DigiDaigaku    |      224
   0x6e75971ed03d09659f46f1d7000ab36addbe02c0 | goblintown     |     1898 | DigiDaigaku    |      380
   0xfcdaa268c4d2933df7d37e8c8726884228ca1566 | goblintown     |     2195 | DigiDaigaku    |      255
   0xacbc3094fbb1b5a51ad82f02fbb1f6206b897d20 | goblintown     |     2750 | DigiDaigaku    |      461
   0xc69c449be66e2e0c74606d11ab11a3b791dc87f7 | goblintown     |     2841 | DigiDaigaku    |      452
   0x0b01f1310e7224dafed24c3b62d53cec37d9faf8 | goblintown     |     2842 | DigiDaigaku    |      419
   0x39fec995c2b9776b2aa22a49f61d45af3f1a2570 | goblintown     |     2870 | DigiDaigaku    |      382
   0xb41738fdf7efeaa0b70cf322916c6491746b785b | goblintown     |     2968 | DigiDaigaku    |      119
   ```


