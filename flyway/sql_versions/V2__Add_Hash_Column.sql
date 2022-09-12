alter table mint_history add column txn_hash text;
alter table mint_history add constraint txn_hash_token_id_unique UNIQUE (txn_hash, token_id);