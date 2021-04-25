import {BaseAsset} from "lisk-sdk";
import {CrowdfundStates, StartProjectAssetSchema} from "../schema";
import {findCrowdfundById, updateCrowdfund} from "../crowdAsset";

export class StartProject extends BaseAsset {
  name = "startProject";
  id = 2;
  schema = StartProjectAssetSchema;

  apply = async ({asset, stateStore, transaction}) => {
    const ownerAccount = await stateStore.account.get(transaction.senderAddress);
    if (!ownerAccount) {
      throw new Error(
        `Account does not exist for senderAddress: ${transaction.senderAddress.toString('hex')}`,
      );
    }
    const crowdfund = await findCrowdfundById(stateStore, asset.crowdfund);
    if (!crowdfund) {
      throw new Error(
        `Crowdfund does not exist for id: ${asset.crowdfund.toString('hex')}`,
      );
    }

    if (crowdfund.state !== CrowdfundStates.PENDING) {
      throw new Error(
        `Crowdfund is not in pending state, the current state is: ${crowdfund.state}`,
      );
    }

    if (!crowdfund.owner.equals(transaction.senderAddress)) {
      throw new Error(
        `You're not the owner of this crowdfund, please do this transaction from: ${crowdfund.owner.toString("hex")}`,
      );
    }

    if (asset.start <= stateStore.chain.lastBlockHeaders[0].height) {
      throw new Error(
        `The project should start in the future, you picked height: ${asset.start} the current height is: ${stateStore.chain.lastBlockHeaders[0].height}`,
      );
    }

    crowdfund.startProject = asset.start;
    crowdfund.state = CrowdfundStates.ACTIVE;
    await updateCrowdfund(stateStore, crowdfund);
  }
}