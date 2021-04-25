import {BaseAsset} from "lisk-sdk";
import {CrowdfundStates, FundAssetSchema} from "../schema";
import {findCrowdfundById, updateCrowdfund} from "../crowdAsset";

export class Fund extends BaseAsset {
  name = "fund";
  id = 1;
  schema = FundAssetSchema;

  /*
    debit lsk from sender
    credit lsk to crowdfund
    add backer to crowdfund
   */
  apply = async ({asset, stateStore, transaction, reducerHandler}) => {
    const backerAccount = await stateStore.account.get(transaction.senderAddress);
    if (!backerAccount) {
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

    if (crowdfund.state === CrowdfundStates.PREVIEW && crowdfund.start > stateStore.chain.lastBlockHeaders[0].height) {
      throw new Error(
        `Crowdfund not accepting donations yet`,
      );
    }

    if (crowdfund.state !== CrowdfundStates.PREVIEW && crowdfund.state !== CrowdfundStates.OPEN) {
      throw new Error(
        `Crowdfund is not open for donating`,
      );
    }

    if (crowdfund.state === CrowdfundStates.PREVIEW) {
      crowdfund.state = CrowdfundStates.OPEN;
    }

    const backingAmount = crowdfund.goal - crowdfund.balance >= asset.amount ? asset.amount : crowdfund.goal - crowdfund.balance
    await reducerHandler.invoke(`token:debit`, {address: transaction.senderAddress, amount: backingAmount})
    backerAccount.crowd.funded.push({
      amount: backingAmount,
      crowdfund: crowdfund.id,
    })
    await stateStore.account.set(transaction.senderAddress, backerAccount)
    console.log(crowdfund, transaction.senderAddress.toString('hex'))
    crowdfund.balance += backingAmount;
    crowdfund.backers.push({
      backer: transaction.senderAddress,
      amount: backingAmount,
      message: asset.message
    })
    console.log(crowdfund, transaction.senderAddress.toString('hex'))
    if (crowdfund.balance === crowdfund.goal) {
      crowdfund.state = CrowdfundStates.PENDING;
    }
    await updateCrowdfund(stateStore, crowdfund)
  }
}