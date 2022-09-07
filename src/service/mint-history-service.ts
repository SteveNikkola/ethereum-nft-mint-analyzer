import {Alchemy, AssetTransfersCategory, Network} from "alchemy-sdk";
import {AssetTransfersParams, AssetTransfersResponse} from "alchemy-sdk/dist/src/types/types";
import {BigNumber, ethers} from 'ethers';
import {MintHistory} from "../types/types";
import {insertMintHistory} from '../dataaccess/mints-dao'

// setup our alchemy client settings
const alchemyConnectionSettings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(alchemyConnectionSettings);

async function populateContractMintHistory(contractAddress: string, contractAlias: string | null = null) {
    // create params to limit the results of the alchemy.core.getAssetTransfers api
    // NFTs are always transfered from the zero address when first minted
    // We only want ERC721 and ERC1155 transfers
    let assetTransfersParams: AssetTransfersParams = {
        fromAddress: ethers.constants.AddressZero,
        contractAddresses: [contractAddress],
        category: [AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
    }

    // create an array to store our results in that we can later use to bulk insert into our database
    let mints: MintHistory[] = [];

    // get the first page of results, and add them to our array
    let results = await getContractMintHistoryResults(assetTransfersParams);
    gatherMintHistory(results, mints, contractAddress, contractAlias);

    // while our results have a pageKey property, that means there are more results to get from the API
    // iterate through the pages until we've gathered the entire mint history
    while (results.pageKey) {
        assetTransfersParams.pageKey = results.pageKey;
        results = await getContractMintHistoryResults(assetTransfersParams)
        gatherMintHistory(results, mints, contractAddress, contractAlias);
    }

    // insert the results into our database
    await insertMintHistory(mints);
}

async function getContractMintHistoryResults(assetTransfersParams: AssetTransfersParams): Promise<AssetTransfersResponse> {
    console.log(`calling alchemy.core.getAssetTransfers with params ${JSON.stringify(assetTransfersParams)}`)
    return await alchemy.core.getAssetTransfers(assetTransfersParams);
}

function gatherMintHistory(results: AssetTransfersResponse, mints: Array<MintHistory>, contractAddress: string, contractAlias: string | null) {
    results.transfers.forEach((transfer) => {
        mints.push(
            {
                id: null,
                wallet_address: transfer.to,
                contract_address: contractAddress,
                contract_alias: contractAlias,
                token_id: BigNumber.from(transfer.tokenId).toNumber()
            }
        )
    })
}

export {populateContractMintHistory}