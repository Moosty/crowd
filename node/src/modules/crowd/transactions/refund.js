import {BaseAsset} from "lisk-sdk";
import {CrowdfundStates, RefundAssetSchema} from "../schema";
import {findCrowdfundById, updateCrowdfund} from "../crowdAsset";
import {getBackerRefunds} from "../utils";

export class Refund extends BaseAsset {
  name = "refund";
  id = 5;
  schema = RefundAssetSchema;

  apply = async ({asset, stateStore, transaction, reducerHandler}) => {
    const refundAccount = await stateStore.account.get(transaction.senderAddress)
    const foundCrowdfund = await findCrowdfundById(stateStore, asset.crowdfund);
    if (refundAccount.crowd.funds.findIndex(owned => owned.equals(asset.crowdfund)) === -1 &&
      refundAccount.crowd.funded.findIndex(funded => funded.crowdfund.equals(asset.crowdfund)) === -1) {
      throw new Error(
        `You're not a backer nor owner of crowdfund with id: ${asset.crowdfund.toString('hex')}`
      )
    }
    if (refundAccount.crowd.funds.findIndex(owned => owned.equals(asset.crowdfund)) === -1 && foundCrowdfund.state !== CrowdfundStates.CANCELED) {
      throw new Error(
        `Crowdfund is not canceled with id: ${asset.crowdfund.toString('hex')}`
      )
    }

    const backerRefundsLeft = getBackerRefunds(foundCrowdfund)
    if (refundAccount.crowd.funds.findIndex(owned => owned.equals(asset.crowdfund)) > -1) {
      await Promise.all(backerRefundsLeft.map(async backer => {
        await reducerHandler.invoke("token:credit", {
          address: backer.backer,
          amount: backer.amount,
        })
      }));
      foundCrowdfund.balance = BigInt(0);
      foundCrowdfund.refunds = [
        ...foundCrowdfund.refunds,
        ...backerRefundsLeft,
      ]
      if (foundCrowdfund.state !== CrowdfundStates.CANCELED) {
        foundCrowdfund.state = CrowdfundStates.FAILED;
      }
    } else {
      if (foundCrowdfund.refunds.find(refund => refund.backer.equals(transaction.senderAddress))) {
        throw new Error(
          `You already claimed a refund`
        )
      }
      const backerRefund = backerRefundsLeft.find(br => br.backer.equals(transaction.senderAddress));
      if (!backerRefund) {
        throw new Error(
          `You can't claim a refund`
        )
      }
      foundCrowdfund.balance -= backerRefund.amount;
      foundCrowdfund.refunds = [
        ...foundCrowdfund.refunds,
        {
          backer: transaction.senderAddress,
          amount: backerRefund.amount,
        }
      ]
      await reducerHandler.invoke("token:credit", {
        address: transaction.senderAddress,
        amount: backerRefund.amount,
      })
    }

    await updateCrowdfund(stateStore, foundCrowdfund)
  }
}