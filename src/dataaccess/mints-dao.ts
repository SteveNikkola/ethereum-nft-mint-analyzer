import {processQuery} from "./client";
import {MintHistory} from "../types/types";
import format from 'pg-format';

async function insertMintHistory(mints: Array<MintHistory>) {
    // create a list of values to bulk insert into the mint_history table
    let valuesList: string[] = []
    for (const mint of mints) {
        valuesList.push(`('${mint.wallet_address}', '${mint.contract_address}', '${mint.contract_alias}', ${mint.token_id}, '${mint.txn_hash}')`)
    }

    // create the sql statement
    // the ON CONFLICT statement means if our unique constraint against txh_hash-token_id is broken, those inserts will just be ignored and not throw a fatal exception
    const sql = format(`
                INSERT INTO mint_history(wallet_address, contract_address, contract_alias, token_id, txn_hash)
                VALUES ${valuesList}
                ON CONFLICT (txn_hash, token_id) DO NOTHING
        `
    );

    // send the query
    console.log('Starting insertMintHistory');
    await processQuery(sql);
    console.log('Finished insertMintHistory');
}

export {insertMintHistory}