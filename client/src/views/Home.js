/* global BigInt */
import React, {useContext, useEffect} from "react";
import {Buffer, transactions} from "@liskhq/lisk-client"
import {AccountProjectList, AccountProjectSingleItem, Container, CrowdCardContainer} from "@moosty/dao-storybook";
import {useBlocks} from "../hooks/blocks";
import {useHistory} from "react-router-dom";
import {crowdFundStates} from "@moosty/dao-storybook/dist/shared/global.crowdfund";
import {useProjects} from "../hooks/projects";
import {createTransaction} from "../utils/transactions";
import {AppContext} from "../appContext";
import {transactionStates} from "@moosty/dao-storybook/dist/stories/modals/templates/resultTransaction";

export const Home = ({account, setModal, filters, visible}) => {
  const history = useHistory()
  const {getClient} = useContext(AppContext);
  const {projects} = useProjects();
  const {height,} = useBlocks();

  useEffect(() => {
    console.log(projects)
  }, [projects])

  const onBack = async (amount, project) => {
    const client = await getClient
    const fee = await createTransaction({
      moduleId: 3510,
      assetId: 1,
      assets: {
        crowdfund: Buffer.from(project.id, 'hex'),
        amount: BigInt(transactions.convertLSKToBeddows(amount)),
        message: "",
      },
      account,
      client,
      getFee: true,
    })
    setModal({
      type: "transactionConfirm",
      address: account.address,
      name: account?.chain?.sprinkler?.username,
      transactionType: "crowd:back",
      fee: `${fee} LSK`,
      ctaButton: {
        label: "Confirm",
        onClick: () => onSubmit(amount, project)
      }
    })
  }

  const onSubmit = async (amount, project) => {
    setModal({
      type: "transactionResult",
      text: `Submitting transaction, this can take a few seconds.`,
      state: transactionStates.pending,
    })
    const client = await getClient;
    const result = await createTransaction({
      moduleId: 3510,
      assetId: 1,
      assets: {
        crowdfund: Buffer.from(project.id, 'hex'),
        amount: BigInt(transactions.convertLSKToBeddows(amount)),
        message: "",
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
            text: `You backed this crowdfund successfully`,
            state: transactionStates.confirmed
          })
          history.push('/my-projects')
        } catch (e) {
          setTimeout(async () => await findTransaction(), 1000)
        }
      }
      await findTransaction()

    } else {
      setModal({type: "transactionResult", text: result.message, state: transactionStates.error})
    }
  }

  return <div>
    {!visible &&
    <Container className={["space-x-4", "space-y-4", "flex", "flex-wrap", "flex-row", "my-20"].join(" ")}>
      {projects && projects.filter(project => project.state === crowdFundStates.PREVIEW || project.state === crowdFundStates.OPEN).map((project, i) => {
        const time = project.start > height ? <span>soon&trade;</span> : "until funded"
        return <div key={project.id} className={i === 0 && "ml-5 mt-4"}>
          <CrowdCardContainer
            {...project}
            time={time}
            backOnClick={() => account ? setModal({
                type: "back",
                project: {
                  ...project,
                  onClickBack: (amount) => onBack(amount.target.value, project)
                },
              }) :
              setModal('login')}
            height={height}/>
        </div>
      })}
    </Container>}
    {visible && <Container className={["my-20"].join(" ")}>
      <AccountProjectList>
        {projects && projects.filter(project => project.state === crowdFundStates.PREVIEW || project.state === crowdFundStates.OPEN).map((project) =>
          <AccountProjectSingleItem {...project}/>
        )}
      </AccountProjectList>
    </Container>}
  </div>
}