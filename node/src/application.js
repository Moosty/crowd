import { Application, configDevnet, genesisBlockDevnet, HTTPAPIPlugin, utils, } from 'lisk-sdk';
import {DPoSModule, KeysModule, SequenceModule, TokenModule} from 'lisk-framework';
import {SprinklerModule} from "@moosty/lisk-sprinkler";
import {CrowdModule} from "./modules";

genesisBlockDevnet.header.asset.accounts = genesisBlockDevnet.header.asset.accounts
  .map(account => utils.objects.mergeDeep({}, account, {
    sprinkler: {
      username: ""
    },
    crowd: {
      funds: [],
      funded: [],
    },
  }));
genesisBlockDevnet.header.timestamp = 1619166460;

const customConfig = {
  label: "crowd",
  genesisConfig: {
    communityIdentifier: "CROWD",
    blockTime: 5,
  },
  logger: {
    consoleLogLevel: "debug",
  },
  rpc: {
    enable: true,
    port: 3511,
    mode: "ws",
  },
  network: {
    port: 3510,
  },
  plugins: {
    httpApi: {
      whiteList: ["127.0.0.1"],
      port: 3512,
    },
  },
}

const appConfig = utils.objects.mergeDeep({}, configDevnet, customConfig);
const app = new Application(genesisBlockDevnet, appConfig);
app._registerModule(SprinklerModule, false);
app._registerModule(TokenModule, false);
app._registerModule(SequenceModule, false);
app._registerModule(KeysModule, false);
app._registerModule(DPoSModule, false);
app._registerModule(CrowdModule, false);

app.registerPlugin(HTTPAPIPlugin);

export {
  customConfig as AppConfig,
  app as App,
}