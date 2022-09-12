export interface MintHistory {
    id: number | null,
    wallet_address: string,
    contract_address: string,
    contract_alias: string,
    token_id: number,
    txn_hash: string | null
}