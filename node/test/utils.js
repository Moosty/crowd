/* global BigInt */
import {apiClient, codec, cryptography, transactions, utils} from "lisk-sdk";
import fetch from 'node-fetch'
import {validator} from "@liskhq/lisk-validator";

export const fetchApi = async (api, endpoint, filters) => {
  const response = await fetch(`${api}${endpoint}`);
  const data = await response.json();
  return data.data;
}

export const getFullAssetSchema = assetSchema =>
  utils.objects.mergeDeep({}, baseAssetSchema, {
    properties: {
      asset: assetSchema
    },
  });

export class TransactionBuilder {
  constructor(api, ws, accounts) {
    this.ws = ws;
    this.api = api;
    this.accounts = accounts;
    this.height = 0
  }

  connect = async () => {
    try {
      await this.getClient()
      await this.getNodeInfo()
    } catch (e) {

    }
  }

  getClient = async () => {
    this.wsClientCache = await apiClient.createWSClient(this.ws);
  }

  getNodeInfo = async () => {
    const nodeInfo = await fetchApi(this.api, 'node/info');
    this.networkIdentifier = Buffer.from(nodeInfo.networkIdentifier, "hex")
    this.genesisConfig = nodeInfo.genesisConfig;
    this.registeredModules = nodeInfo.registeredModules;
  }

  callAction = async (action, params) => {
    return await this.wsClientCache.invoke(action, params)
  }

  setPassphrase(phrase) {
    this.passphrase = phrase;
    this.keys = cryptography.getPrivateAndPublicKeyFromPassphrase(
      this.passphrase
    );

    this.address = cryptography.getAddressFromPassphrase(this.passphrase).toString('hex');
    return this;
  }

  setModuleAssetId(moduleId, assetId) {
    this.moduleId = moduleId;
    this.assetId = assetId;
    const assetSchema = this.wsClientCache.schemas.transactionsAssets
      .find(s => s.moduleID === moduleId && s.assetID === assetId)
    this.schema = assetSchema.schema;
    return this;
  }

  setAssets(assets) {
    this.assets = assets;
    return this;
  }

  getNonce = async () => {
    const account = await fetchApi(this.api, `accounts/${this.address}`)
    if (account) {
      return account.sequence.nonce;
    }
    return 0;
  }

  validateSchema = async () => {
    return validator.validate(this.schema, this.assets)
  }

  sign = async () => {
    const nonce = await this.getNonce()
    const transactionObject = {
      moduleID: this.moduleId,
      assetID: this.assetId,
      nonce: BigInt(nonce),
      fee: BigInt(transactions.convertLSKToBeddows('0.01')),
      senderPublicKey: this.keys.publicKey,
      asset: {
        ...this.assets
      }
    }
    const fee = transactions.computeMinFee(this.schema, transactionObject)
    const signedTransaction = transactions.signTransaction(
      this.schema,
      {...transactionObject, fee},
      this.networkIdentifier,
      this.passphrase
    )
    const {id, ...rest} = signedTransaction;
    this.signedTransaction = codec.fromJSON(getFullAssetSchema(this.schema), rest)
    return this;
  }

  wait = async (blocks) => {
    const startHeight = (await this.wsClientCache.node.getNodeInfo()).height
    console.log(`Waiting for height: ${startHeight + blocks}`)
    return {
      then: (resolve) => {
        this.wsClientCache.subscribe('app:block:new', (data) => {
          const block = this.wsClientCache.block.decode(new Buffer.from(data.block, 'hex'))
          if (blocks + startHeight < block.header.height) {
            resolve(true)
          }
        })
      }
    }
  }

  waitUntil = async (height) => {
    console.log(`Waiting for height: ${height}`)
    return {
      then: (resolve) => {
        this.wsClientCache.subscribe('app:block:new', (data) => {
          const block = this.wsClientCache.block.decode(new Buffer.from(data.block, 'hex'))
          if (height <= block.header.height) {
            resolve(true)
          }
        })
      }
    }
  }


  broadcast = async () => {
    try {
      await this.sign();
      return await this.wsClientCache.transaction.send(this.signedTransaction)
    } catch (e) {
      return e.message
    }
  }

  send = (username) => {
    this.setPassphrase(this.accounts.find(a => a.username === username).passphrase)
    return this.broadcast()
  }


}

export const baseAssetSchema = {
  $id: 'lisk/base-transaction',
  type: 'object',
  required: ['moduleID', 'assetID', 'nonce', 'fee', 'senderPublicKey', 'asset'],
  properties: {
    moduleID: {
      dataType: 'uint32',
      fieldNumber: 1,
    },
    assetID: {
      dataType: 'uint32',
      fieldNumber: 2,
    },
    nonce: {
      dataType: 'uint64',
      fieldNumber: 3,
    },
    fee: {
      dataType: 'uint64',
      fieldNumber: 4,
    },
    senderPublicKey: {
      dataType: 'bytes',
      fieldNumber: 5,
    },
    asset: {
      dataType: 'bytes',
      fieldNumber: 6,
    },
    signatures: {
      type: 'array',
      items: {
        dataType: 'bytes',
      },
      fieldNumber: 7,
    },
  },
};
