import {BaseAsset} from "lisk-sdk";
import {ClaimAssetSchema, CrowdfundStates} from "../schema";
import {findCrowdfundById, updateCrowdfund} from "../crowdAsset";
import {PERIOD_BLOCKS, VOTE_BEFORE_END_PERIOD, VOTE_BLOCKS} from "../constants";
import {getLastClaimedPeriod} from "../utils";

export class Claim extends BaseAsset {
  name = "claim";
  id = 4;
  schema = ClaimAssetSchema;

  apply = async ({asset, transaction, stateStore, reducerHandler}) => {
    const ownerAccount = await stateStore.account.get(transaction.senderAddress);
    const foundCrowdfund = await findCrowdfundById(stateStore, asset.crowdfund);
    const lastHeight = stateStore.chain.lastBlockHeaders[0].height;
    if (!ownerAccount.crowd.funds.findIndex(f => f.equals(asset.crowdfund)) === -1) {
      throw new Error(
        `Crowdfund is not owned by you`
      )
    }
    if (!foundCrowdfund) {
      throw new Error(
        `Crowdfund not found with id: ${asset.crowdfund}`
      )
    }

    if (foundCrowdfund.state !== CrowdfundStates.ACTIVE) {
      throw new Error(
        `Crowdfund is not active, crowdfunds current state is: ${foundCrowdfund.state}`
      )
    }
    if (foundCrowdfund.startProject === -1 || foundCrowdfund.startProject > lastHeight) {
      throw new Error(
        `Crowdfund project not yet started`
      )
    }

    const lastClaimedPeriod = getLastClaimedPeriod(foundCrowdfund);
    const blocksSinceStartProject = lastHeight - foundCrowdfund.startProject;
    const currentPeriod = Math.floor(blocksSinceStartProject / PERIOD_BLOCKS);
    if (currentPeriod === 0) {
      throw new Error(
        `You can't claim before voting.`
      )
    }
    if (lastClaimedPeriod >= currentPeriod) {
      throw new Error(
        `You've already claimed for this period`
      )
    }
    const heightAllowedClaim = foundCrowdfund.startProject + (currentPeriod * PERIOD_BLOCKS);
    if (heightAllowedClaim >= lastHeight) {
      throw new Error(
        `You can't claim before period ended.`
      )
    }
    const allowedAmountPerPeriod = ((foundCrowdfund.goal * BigInt(100)) / BigInt(foundCrowdfund.periods)) / BigInt(100);
    await reducerHandler.invoke("token:credit", {
      address: transaction.senderAddress,
      amount: allowedAmountPerPeriod,
    })
    foundCrowdfund.claims.push({
      period: foundCrowdfund.claims.length + 1,
      amount: allowedAmountPerPeriod,
    })
    foundCrowdfund.balance -= allowedAmountPerPeriod;
    if (foundCrowdfund.claims.length === foundCrowdfund.periods) {
      foundCrowdfund.state = CrowdfundStates.ENDED;
    }
    await updateCrowdfund(stateStore, foundCrowdfund)
  }
}