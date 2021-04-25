import { BaseModule } from "lisk-sdk";
import { Claim, Create, Fund, Refund, StartProject, Vote} from './transactions';
import {AccountSchema} from "./schema";
import {getAllCrowdfundsAsJSON} from "./crowdAsset";

export class CrowdModule extends BaseModule {
  name = "crowd";
  id = 3510;
  transactionAssets = [
    new Create(),
    new Fund(),
    new StartProject(),
    new Vote(),
    new Claim(),
    new Refund(),
  ];

  accountSchema = AccountSchema;

  actions = {
    getAllCrowdfunds: async (params) => getAllCrowdfundsAsJSON(this._dataAccess, params),
    // getVotesByCrowdfund: async (params) => getVotesByCrowdfundJSON(this._dataAccess, params),
    // getClaimsByCrowdfund: async (params) => getClaimsByCrowdfundAsJSON(this._dataAccess, params),
    // getRefundsByCrowdfund: async (params) => getRefundsByCrowdfundAsJSON(this._dataAccess, params),
    // getBackersByCrowdfund: async (params) => getBackersByCrowdfundAsJSON(this._dataAccess, params),
  }

  reducers = {
    // credit: async (params, stateStore) => creditFund(params, stateStore),
    // debit: async (params, stateStore) => debitFund(params, stateStore),
  }
}

/*
 Todo:
 Transactions: (6)
 - create
 - fund
 - claim
 - refund
 - vote
 - startProject

 Reducers:
 - addFund (crowdfundId, amount, sender)
 - removeFund (crowdfundId, amount, recipient)

 Actions:
 - getAllCrowdFunds (offset, limit, state = [all, preview, open, pending, active, failed, ended, canceled)
 - getVotesByCrowdfund (crowdfundId)
 - getClaimsByCrowdfund (crowdfundId)
 - getRefundsByCrowdfund (crowdfundId)
 - getBackersByCrowdfund (crowdfundId)
 */
