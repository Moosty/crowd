/* global BigInt */
import React, {useContext, useEffect, useState} from "react";
import {Container, VotingContainer,ContentSection} from "@moosty/dao-storybook";
import {AppContext} from "../appContext";
import {useBlocks} from "../hooks/blocks";
import {useMembers} from "../hooks/members";
import {useDaos} from "../hooks/daos";
import {Buffer} from "@liskhq/lisk-client";
import {createTransaction} from "../utils/transactions";
import {transactionStates} from "@moosty/dao-storybook/dist/stories/modals/templates/resultTransaction";
import {useHistory} from "react-router-dom";
import {projectImages} from "@moosty/dao-storybook/dist/shared/global.crowdfund";

export const Home = ({account, setModal, filters}) => {
  const history = useHistory()
  const {getClient} = useContext(AppContext)
  const {members} = useMembers();
  const {daos} = useDaos();
  const [votings, setVotings] = useState([]);
  const {height,} = useBlocks();
  const [parsedVotings, setParsedVotings] = useState([]);
  const [filteredVotings, setFilteredVotings] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10000);

  useEffect(() => {
    const getVotings = async () => {
      const client = await getClient;
      setVotings((await client.invoke("dao:getAllProposals", {offset, limit})).data)
    }
    getVotings()
  }, [getClient, height])

  const homeFilter = (voting) => {
    if (!filters) {
      return true;
    }
    if (filters && !filters?.dao && !filters?.creator && !filters.state) {
      return true;
    }
    if (filters?.dao?.id !== 0 && filters?.dao?.id !== voting.daoId) {
      return false;
    }
    if (filters?.creator?.id !== 0 && filters?.creator?.address !== voting.user.address) {
      return false;
    }
    if (filters?.state?.id && filters?.state?.id !== 0 && filters?.state?.id !== 1) {
      return false;
    }
    return true
  }

  const allowedToVote = (proposal) => {
    if (!account) {
      return false;
    }
    const dao = daos?.find(d => d.id === proposal.dao)
    if (!dao) {
      return false;
    }
    return !!dao?.members.find(m => m.id === account.address)
  }

  const getUserVote = (proposal) => {
    if (proposal?.votes?.length === 0) {
      return null;
    }
    const userVote = proposal?.votes.find(v => v.member === account.address)?.options[0]?.id;
    return userVote ? userVote === "8a798890fe93817163b10b5f7bd2ca4d25d84c52739a645a889c173eee7d9d3d" ? "yes" : "no" : null
  }

  const onVote = async (proposal, vote) => {
    const client = await getClient;
    const fee = await createTransaction({
      moduleId: 3500,
      assetId: 2,
      assets: {
        dao: Buffer.from(proposal.dao, 'hex'),
        proposal: Buffer.from(proposal.id, 'hex'),
        options: [
          {
            option: Buffer.from(vote, 'hex'),
            value: BigInt(1),
          }
        ]
      },
      account,
      client,
      getFee: true,
    })
    setModal({
      type: "transactionConfirm",
      address: account.address,
      name: account.username,
      transactionType: "dao:voteProposal",
      fee: `${fee} LSK`,
      ctaButton: {
        label: "Confirm",
        onClick: () => onSubmit(proposal, vote)
      }
    })
  }

  const onSubmit = async (proposal, vote) => {
    setModal({
      type: "transactionResult",
      text: `Submitting transaction, this can take a few seconds.`,
      state: transactionStates.pending,
    })
    const client = await getClient;
    const result = await createTransaction({
      moduleId: 3500,
      assetId: 2,
      assets: {
        dao: Buffer.from(proposal.dao, 'hex'),
        proposal: Buffer.from(proposal.id, 'hex'),
        options: [
          {
            option: Buffer.from(vote, 'hex'),
            value: BigInt(1),
          }
        ]
      },
      account,
      client,
    })
    if (result.status) {
      const findTransaction = async () => {
        try {
          await client.transaction.get(Buffer.from(result.message.transactionId, 'hex'))
          setModal({
            type: "transactionResult",
            text: `Your vote is casted successfully`,
            state: transactionStates.confirmed
          })
          history.push('/')
        } catch (e) {
          setTimeout(async () => await findTransaction(), 1000)
        }
      }
      await findTransaction()

    } else {
      setModal({type: "transactionResult", text: result.message, state: transactionStates.error})
    }
  }

  useEffect(() => {
    const getDaos = async () => {
      const client = await getClient;
      const daoIds = Array.from(new Set(votings?.map(v => v.dao)))
      const daos = await Promise.all(daoIds?.map(async dao => {
        return await client.invoke("dao:getDao", {id: dao})
      }))
      setParsedVotings(votings?.sort((a, b) => b.start - a.start).map(v => {
        const allowVoting = allowedToVote(v);
        const dao = daos?.find(d => d.id === v.dao)
        return {
          daoId: dao.id,
          id: v.id,
          dao: dao.name,
          eligibleVotes: dao.members.filter(m => m.nonce <= v.nonce).length,
          end: v.end,
          start: v.start,
          height: height || 99999999999999,
          minToWin: v.rules.minToWin,
          quorum: v.rules.quorum,
          yes: v.votes.filter(vote =>
            vote.options[0].id === "8a798890fe93817163b10b5f7bd2ca4d25d84c52739a645a889c173eee7d9d3d").length,
          no: v.votes.filter(vote =>
            vote.options[0].id === "9390298f3fb0c5b160498935d79cb139aef28e1c47358b4bbba61862b9c26e59").length,
          title: v.description,
          user: {
            address: v.creator,
            name: members?.find(m => m.address === v.creator)?.name,
          },
          notAllowed: !allowVoting,
          userVote: allowVoting && getUserVote(v),
          onClickThumbDown: () => onVote(v, "9390298f3fb0c5b160498935d79cb139aef28e1c47358b4bbba61862b9c26e59"),
          onClickThumbUp: () => onVote(v, "8a798890fe93817163b10b5f7bd2ca4d25d84c52739a645a889c173eee7d9d3d"),
        }
      }))
    }
    getDaos();
  }, [votings, account,])

  useEffect(() => {
    setFilteredVotings(parsedVotings.filter(homeFilter))
  }, [parsedVotings, filters])

  return <div>
    <Container>
      <div className="flex flex-row flex-wrap content-start justify-center space-x-5 space-y-8 mx-auto">
        {filteredVotings?.map((card, i) => <VotingContainer key={card.id} className={i === 0 && "ml-5 mt-8"} {...card}
                                                            height={height}/>)}
      </div>
    </Container>
  </div>
}