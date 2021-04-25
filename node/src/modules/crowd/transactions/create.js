import {BaseAsset} from "lisk-sdk";
import {CreateAssetSchema} from "../schema";
import {addCrowdfund, createCrowdfund, findCrowdfundById, getCrowdId} from "../crowdAsset";

export class Create extends BaseAsset {
  name = "create";
  id = 0;
  schema = CreateAssetSchema;

  apply = async ({asset, stateStore, transaction}) => {
    const ownerAccount = await stateStore.account.get(transaction.senderAddress);
    const crowdfundId = getCrowdId(asset.title, transaction.senderAddress);
    const crowdfundExist = await findCrowdfundById(stateStore, crowdfundId);
    if (crowdfundExist) {
      throw new Error(`You already created a crowdfund with id: ${crowdfundId.toString("hex")}`)
    }

    if (asset.start < stateStore.chain.lastBlockHeaders[0].height) {
      throw new Error(`Your crowdfund needs to start in the future you choose block height: '${asset.start}', last block height was: ${stateStore.chain.lastBlockHeaders[0].height}`)
    }

    const crowdfund = createCrowdfund(asset, transaction.senderAddress);
    ownerAccount.crowd.funds.push(crowdfundId);
    await stateStore.account.set(transaction.senderAddress, ownerAccount);
    await addCrowdfund(stateStore, crowdfund)
  }
}