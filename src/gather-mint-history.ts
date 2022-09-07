import * as dotenv from 'dotenv'
dotenv.config()
import {populateContractMintHistory} from './service/mint-history-service'

const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
const contractAlias = 'BAYC'

async function run() {
    await populateContractMintHistory(contractAddress, contractAlias);
}

run();