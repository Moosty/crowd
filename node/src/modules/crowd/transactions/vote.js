import {BaseAsset} from "lisk-sdk";
import {CrowdfundStates, VoteAssetSchema} from "../schema";
import {findCrowdfundById, updateCrowdfund} from "../crowdAsset";
import {PERIOD_BLOCKS, VOTE_BEFORE_END_PERIOD, VOTE_BLOCKS} from "../constants";
import {votingPassed} from "../utils";

export class Vote extends BaseAsset {
  name = "vote";
  id = 3;
  schema = VoteAssetSchema;

  apply = async ({asset, transaction, stateStore}) => {
    const backerAccount = await stateStore.account.get(transaction.senderAddress);
    const foundCrowdfund = await findCrowdfundById(stateStore, asset.crowdfund);
    const lastHeight = stateStore.chain.lastBlockHeaders[0].height;
    if (!foundCrowdfund) {
      throw new Error(
        `Crowdfund not found with id: ${asset.crowdfund.toString('hex')}`
      )
    }
    if (backerAccount.crowd.funded.findIndex(funded => funded.crowdfund.equals(asset.crowdfund)) === -1) {
      throw new Error(
        `You're not a backer of crowdfund with id: ${asset.crowdfund.toString('hex')}`
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
    const blocksSinceStartProject = lastHeight - foundCrowdfund.startProject;
    const currentPeriod = Math.floor(blocksSinceStartProject / PERIOD_BLOCKS);
    const startVoting = foundCrowdfund.startProject + (currentPeriod * PERIOD_BLOCKS) + (PERIOD_BLOCKS - VOTE_BEFORE_END_PERIOD - VOTE_BLOCKS)
    const endVoting = startVoting + VOTE_BLOCKS;
    if (currentPeriod >= foundCrowdfund.periods) {
      throw new Error(
        `Crowdfund project ended`
      )
    }
    if (lastHeight < startVoting) {
      throw new Error(
        `Voting didn't start yet, next voting from block height: ${startVoting}, current height: ${lastHeight}`
      )
    }
    if (lastHeight > endVoting) {
      throw new Error(
        `Voting just ended at height: ${endVoting}, current height: ${lastHeight}`
      )
    }
    const currentVoting = foundCrowdfund.votes.find(v => v.period === currentPeriod);
    if (currentVoting && currentVoting.votes.find(vote => vote.backer.equals(transaction.senderAddress))) {
      throw new Error(
        `You already voted this period`
      )
    }

    const updatedVoting = currentVoting ? {
        ...currentVoting, votes: currentVoting.votes.push({
          backer: transaction.senderAddress,
          vote: asset.vote,
        })
      } :
      {
        period: currentPeriod,
        votes: [{
          backer: transaction.senderAddress,
          vote: asset.vote,
        }]
      }
    foundCrowdfund.votes = [
      ...foundCrowdfund.votes.filter(v => v.period !== currentPeriod),
      updatedVoting,
    ]
    const voteToCancelPassed = !votingPassed(foundCrowdfund, currentPeriod)
    if (voteToCancelPassed) {
      foundCrowdfund.state = CrowdfundStates.CANCELED;
    }
    await updateCrowdfund(stateStore, foundCrowdfund)
  }
}