export const votingPassed = (crowdfund, period) => {
  const backers = [];
  let totalWeight = BigInt(0)
  crowdfund.backers.map((backer) => {
    const multiBacker = backers.findIndex(b => b.backer.equals(backer.backer));
    if (multiBacker > -1) {
      backers[multiBacker].amount += BigInt(backer.amount)
    } else {
      backers.push({
        backer: backer.backer,
        amount: BigInt(backer.amount),
      })
    }
    totalWeight += BigInt(backer.amount)
  })
  let cancelVotes = BigInt(0)
    const periodVotes = crowdfund.votes.find(v => v.period === period);
  console.log(periodVotes)
  if (periodVotes) {
    periodVotes.votes.map(v => {
      if (!v.vote) {
        cancelVotes += backers.find(b => b.backer.equals(v.backer)).amount;
      }
    })
  }
  return totalWeight / BigInt(2) >= cancelVotes;
}

export const getBackerRefunds = (crowdfund) => {
  const totalFunded = crowdfund.backers.reduce((sum, backer) => sum + backer.amount, BigInt(0));
  const totalClaimed = crowdfund.claims.reduce((sum, claim) => sum + claim.amount, BigInt(0));
  const totalLeft = totalFunded - totalClaimed;
  const backers = [];
  crowdfund.backers.map((backer) => {
    const multiBacker = backers.findIndex(b => b.backer.equals(backer.backer));
    if (multiBacker > -1) {
      backers[multiBacker].amount += BigInt(backer.amount)
    } else {
      backers.push({
        backer: backer.backer,
        amount: BigInt(backer.amount),
      })
    }
  });
  return  backers.map(backer => {
    if (!crowdfund.refunds.find(b => b.backer.equals(backer.backer))) {
      return {
        backer: backer.backer,
        amount: (totalLeft * ((backer.amount * BigInt(10000000000)) / totalFunded)) / BigInt(10000000000),
      }
    }
  }).filter(b => b)
}

export const getLastClaimedPeriod = (crowdfund) => {
  return crowdfund.claims.length === 0 ? 0 : crowdfund.claims.sort((a, b) => a.period - b.period)[0].period;
}