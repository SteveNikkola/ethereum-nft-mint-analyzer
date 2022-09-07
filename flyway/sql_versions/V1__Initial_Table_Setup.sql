create table mint_history
(
    id               serial primary key,
    wallet_address   text not null,
    contract_address text not null,
    contract_alias   text not null,
    token_id         int  not null
);