import React, {useEffect, useState} from "react";
import {BrowserRouter as Router, Route, Switch, useHistory, useLocation,} from "react-router-dom";
import * as Views from "./views";
import {NavBarContainer} from "./containers/NavBar";
import {PageTop} from "./containers/PageTop";
import {ModalContainer} from "./containers/Modal";
import {useAuth} from "./hooks/auth";
import {ContentSection, Footer, Hero} from "@moosty/dao-storybook";
import {FooterAuthor, FooterItems} from "@moosty/dao-storybook/dist/fixtures/crowdfund/footerItems";
import {projectImages} from "@moosty/dao-storybook/dist/shared/global.crowdfund";

export const Routes = () => {
  const history = useHistory();
  const [currentOpen, setCurrentOpen] = useState();
  const [filtersFilter, setFilters] = useState();
  const {account, onLogin, onRegister, registerError, loadingSprinkler, onSignOut} = useAuth(setCurrentOpen);

  useEffect(() => {
    console.log(history)
  }, [history])

  const updateFilters = (filter, value, filters) => {
    console.log(filter, filters, value)
    setFilters({
      ...filters,
      [filter]: value,
    })
  }

  return (
    <Router>
      <NavBarContainer
        setModal={setCurrentOpen}
        onSignOut={() => onSignOut()}
        user={account}
        onLoginClick={() => setCurrentOpen("login")}
        onRegisterClick={() => setCurrentOpen("register")}
      />

      <div className="w-full  min-h-screen  flex flex-col">
        <Hero
          title="Lisk Crowd | A Regulated Crowdfund Platform"
          subTitle="Regulate your crowdfund journey with Lisk Crowd!"
          buttonLabel2="Start Crowdfund!"
          onClickButton2={() => history.push("/create-crowdfund")}
          onClickButton1={() => history.push("/explore")}
          buttonLabel1="Explore"
        />
        <div className={"w-full mx-auto md:w-app flex-grow mb-10"}>
          <PageTop updateFilters={updateFilters} filters={filtersFilter}/>
          <Switch>
            <Route path={"/create-dao"}>
              <Views.CreateDao account={account} setModal={setCurrentOpen}/>
            </Route>
            <Route path={"/create-dao-proposal"}>
              <Views.CreateVoting account={account} setModal={setCurrentOpen}/>
            </Route>
            <Route path={"/daos"}>
              <Views.Daos account={account}/>
            </Route>
            <Route path={"/members"}>
              <Views.Members account={account} setModal={setCurrentOpen}/>
            </Route>
            <Route path={"/votings/:args"}>
              <Views.Home filters={filtersFilter} account={account} setModal={setCurrentOpen}/>
            </Route>
            <Route path={"/votings"}>
              <Views.Home filters={filtersFilter} account={account} setModal={setCurrentOpen}/>
            </Route>
            <Route path={"/"}>
              <Views.Home filters={filtersFilter} account={account} setModal={setCurrentOpen}/>
            </Route>
          </Switch>
        </div>
        <ContentSection
          gradient
          title="The New Way Of Crowdfunding"
          subTitle="more transparency, more structure, more success. "
          titleContent="What would you do?"
          content="Dit is een stukje tekst.Dit is een stukje tekst.  Dit is een stukje tekst.  Dit is een stukje tekst. Dit is een stukje tekst.Dit is een stukje tekst.  Dit is een stukje tekst.  Dit is een stukje tekst.Dit is een stukje tekst.Dit is een stukje tekst.  Dit is een stukje tekst.  Dit is een stukje tekst.Dit is een stukje tekst.Dit is een stukje tekst.  Dit is een stukje tekst.  Dit is een stukje tekst.Dit is een stukje tekst.Dit is een stukje tekst.  Dit is een stukje tekst.  Dit is een stukje tekst.  "
          image={projectImages[1]}
          backgroundImage
        />
        <Footer
          author={FooterAuthor}
          items={FooterItems}
        />
      </div>

      {/*{location === "/" && <ModalContainer*/}
      {/*  currentOpen={currentOpen}*/}
      {/*  setCurrentOpen={setCurrentOpen}*/}
      {/*  onLogin={onLogin}*/}
      {/*  onRegister={onRegister}*/}
      {/*  externalError={registerError}*/}
      {/*  ctaLoading={loadingSprinkler}*/}
      {/*/>}*/}
    </Router>
  )
}
