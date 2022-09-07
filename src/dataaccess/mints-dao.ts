import {processQuery} from "./client";
import {MintHistory} from "../types/types";
import format from 'pg-format';

async function insertMintHistory(mints: Array<MintHistory>) {
    // create a list of values to bulk insert into the mint_history table
    let valuesList: string[] = []
    for (const mint of mints) {
        valuesList.push(`('${mint.wallet_address}', '${mint.contract_address}', '${mint.contract_alias}', ${mint.token_id})`)
    }

    // create the sql statement
    const sql = format(`
                INSERT INTO mint_history(wallet_address, contract_address, contract_alias, token_id)
                VALUES ${valuesList}
        `
    );

    // send the query
    console.log('Starting insertMintHistory');
    await processQuery(sql);
    console.log('Finished insertMintHistory');
}

export {insertMintHistory}