import {cryptography, codec} from "lisk-sdk";
import {CrowdfundsStateStoreSchema, CrowdStateStoreSchema} from "./schema";

const CHAIN_STATE_CROWDFUNDS = "crowd:funds";
const CHAIN_STATE_CROWDFUND = "crowd:fund";

export const getCrowdId = (title, ownerAddress) => {
  const seed = Buffer.concat([
    new Buffer.from(title),
    ownerAddress,
  ]);
  return cryptography.hash(seed);
}

export const createCrowdfund = (assets, ownerAddress) => ({
  id: getCrowdId(assets.title, ownerAddress),
  ...assets,
  start: assets.start,
  state: "preview",
  owner: ownerAddress,
  backers: [],
  votes: [],
  claims: [],
  refunds: [],
  startProject: -1,
  balance: BigInt(0),
})

export const getAllCrowdfunds = async (stateStore, dataAccess = null) => {
  const crowdfundsBuffer = dataAccess ?
    await dataAccess.getChainState(CHAIN_STATE_CROWDFUNDS) :
    await stateStore.chain.get(CHAIN_STATE_CROWDFUNDS)
  if (!crowdfundsBuffer) {
    return [];
  }

  return codec.decode(
    CrowdfundsStateStoreSchema,
    crowdfundsBuffer,
  )
}

export const findCrowdfundById = async (stateStore, id) => {
  const crowdfundBuffer = await stateStore.chain.get(
    `${CHAIN_STATE_CROWDFUND}:${id.toString('hex')}`
  )

  if (!crowdfundBuffer) {
    return false;
  }

  return codec.decode(
    CrowdStateStoreSchema,
    crowdfundBuffer,
  )
}

export const getCrowdfundById = async (dataAccess, id) => {
  const crowdfundBuffer = await dataAccess.getChainState(`${CHAIN_STATE_CROWDFUND}:${id.toString('hex')}`)
  if (!crowdfundBuffer) {
    return {}
  }

  return codec.toJSON(CrowdStateStoreSchema, codec.decode(CrowdStateStoreSchema, crowdfundBuffer))
}

export const getAllCrowdfundsAsJSON = async (dataAccess, {offset = 0, limit = 10,}) => {
  const allFunds = await getAllCrowdfunds(null, dataAccess);
  const allFundsFull = allFunds && allFunds.funds && await Promise.all(allFunds.funds.map(async fund => await getCrowdfundById(dataAccess, fund)))
  return {
    meta: {
      count: allFunds.funds && allFunds.funds.length || 0,
      limit: limit,
      offset: offset,
    },
    data: allFundsFull || [],
  }
}

/*
todo:
- update votes
- update backers
- update claims
- update refunds
 */

export const updateCrowdfund = async (stateStore, crowdfund) => {
  const foundCrowdfund = await findCrowdfundById(stateStore, crowdfund.id);
  if (!foundCrowdfund) {
    throw new Error(`Not found crowdfund with id: ${crowdfund.id.toString('hex')}`)
  }
  await stateStore.chain.set(
    `${CHAIN_STATE_CROWDFUND}:${crowdfund.id.toString('hex')}`,
    codec.encode(CrowdStateStoreSchema, crowdfund)
  )
}

export const addCrowdfund = async (stateStore, crowdfund) => {
  const foundCrowdfund = await findCrowdfundById(stateStore, crowdfund.id);
  if (foundCrowdfund) {
    throw new Error(`Crowdfund with id: ${crowdfund.id.toString('hex')} already exists`)
  }

  const allCrowdfunds = await getAllCrowdfunds(stateStore)
  allCrowdfunds.funds = allCrowdfunds.funds ? [...allCrowdfunds.funds, crowdfund.id] : [crowdfund.id]
  await stateStore.chain.set(
    CHAIN_STATE_CROWDFUNDS,
    codec.encode(CrowdfundsStateStoreSchema, allCrowdfunds)
  )

  await stateStore.chain.set(
    `${CHAIN_STATE_CROWDFUND}:${crowdfund.id.toString('hex')}`,
    codec.encode(CrowdStateStoreSchema, crowdfund)
  )
}