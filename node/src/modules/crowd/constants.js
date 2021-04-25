export const FUND_PERIOD = 100;
export const PERIOD_BLOCKS = 30; // 100 blocks per period
export const VOTE_BLOCKS = 10; // voting time 20 blocks
export const VOTE_BEFORE_END_PERIOD =  10; // voting ends 10 blocks before end.
// PERIOD_BLOCKS - VOTE_BEFORE_END_PERIOD - VOTE_BLOCKS === START_VOTING
// PERIOD_BLOCKS - VOTE_BEFORE_END_PERIOD === END_VOTING

// start = 10 + (30 - 10 - 10) = 20