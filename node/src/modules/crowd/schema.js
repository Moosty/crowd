export const CrowdfundStates = {
  PREVIEW: "preview",
  OPEN: "open",
  PENDING: "pending",
  ACTIVE: "active",
  FAILED: "failed",
  ENDED: "ended",
  CANCELED: "canceled",
}

export const CrowdStateStoreSchema = {
  $id: "lisk/crowd/store",
  type: "object",
  required: ["id", "title", "description", "goal", "periods", "site", "image", "category", "start", "owner", "state",],
  properties: {
    id: {
      dataType: "bytes",
      fieldNumber: 1,
    },
    title: {
      dataType: "string",
      fieldNumber: 2,
      minLength: 5,
      maxLength: 50,
    },
    description: {
      dataType: "string",
      fieldNumber: 3,
      minLength: 20,
      maxLength: 9999,
    },
    goal: { // amount of lsk is goal
      dataType: "uint64",
      fieldNumber: 4,
    },
    periods: { // how many payout periods
      dataType: "uint32",
      fieldNumber: 5,
      minimum: 1,
    },
    site: {
      dataType: "string",
      fieldNumber: 6,
      minLength: 0,
      maxLength: 255,
    },
    image: {
      dataType: "uint32",
      fieldNumber: 7,
    },
    category: { // category number
      dataType: "uint32",
      fieldNumber: 8,
    },
    start: {
      dataType: "uint32", // blockheight crowdfund starts
      fieldNumber: 9,
      minimum: 1
    },
    state: {
      dataType: "string",
      fieldNumber: 10,
      enum: ["preview", "open", "pending", "active", "failed", "ended", "canceled"],
    },
    owner: {
      dataType: "bytes",
      fieldNumber: 11,
      minLength: 20,
      maxLength: 20,
    },
    backers: {
      type: "array",
      fieldNumber: 12,
      items: {
        type: "object",
        required: ["backer", "amount"],
        properties: {
          backer: {
            dataType: "bytes",
            fieldNumber: 1,
            minLength: 20,
            maxLength: 20,
          },
          amount: {
            dataType: "uint64",
            fieldNumber: 2,
          },
          message: {
            dataType: "string",
            fieldNumber: 3,
            minLength: 0,
            maxLength: 140,
          },
        }
      }
    },
    votes: {
      type: "array",
      fieldNumber: 13,
      items: {
        type: "object",
        required: ["period", "votes"],
        properties: {
          period: {
            dataType: "uint32",
            fieldNumber: 1,
          },
          votes: {
            type: "array",
            fieldNumber: 2,
            minItems: 0,
            items: {
              type: "object",
              required: ["backer", "vote"],
              properties: {
                backer: {
                  dataType: "bytes",
                  fieldNumber: 1,
                  minLength: 20,
                  maxLength: 20,
                },
                vote: {
                  dataType: "boolean",
                  fieldNumber: 2,
                },
              }
            }
          }
        }
      }
    },
    claims: {
      type: "array",
      fieldNumber: 14,
      items: {
        type: "object",
        required: ["period", "amount", "message"],
        properties: {
          period: {
            dataType: "uint32",
            fieldNumber: 1,
          },
          amount: {
            dataType: "uint64",
            fieldNumber: 2,
          },
          message: {
            dataType: "string",
            fieldNumber: 3,
            minLength: 1,
            maxLength: 200,
          }
        }
      }
    },
    refunds: {
      type: "array",
      fieldNumber: 15,
      items: {
        type: "object",
        required: ["backer", "amount"],
        properties: {
          backer: {
            dataType: "bytes",
            fieldNumber: 1,
            minLength: 20,
            maxLength: 20,
          },
          amount: {
            dataType: "uint64",
            fieldNumber: 2,
          },
        }
      }
    },
    startProject: {
      dataType: "sint32",
      fieldNumber: 16,
    },
    balance: {
      dataType: "uint64",
      fieldNumber: 17,
    }
  }
}
export const CrowdfundsStateStoreSchema = {
  $id: "lisk/crowd/funds",
  type: "object",
  required: ["funds"],
  properties: {
    funds: {
      type: "array",
      fieldNumber: 1,
      items: {
        dataType: "bytes",
      },
    },
  },
}
export const CreateAssetSchema = {
  $id: "lisk/crowd/create",
  type: "object",
  required: ["title", "description", "goal", "periods", "site", "image", "category", "start"],
  properties: {
    title: {
      dataType: "string",
      fieldNumber: 1,
      minLength: 5,
      maxLength: 50,
    },
    description: {
      dataType: "string",
      fieldNumber: 2,
      minLength: 20,
      maxLength: 9999,
    },
    goal: { // amount of lsk is goal
      dataType: "uint64",
      fieldNumber: 3,
    },
    periods: { // how many payout periods
      dataType: "uint32",
      fieldNumber: 4,
      minimum: 1,
    },
    site: {
      dataType: "string",
      fieldNumber: 5,
      minLength: 0,
      maxLength: 255,
    },
    image: {
      dataType: "uint32",
      fieldNumber: 6,
    },
    category: { // category number
      dataType: "uint32",
      fieldNumber: 7
    },
    start: {
      dataType: "uint32", // blockheight crowdfund starts
      fieldNumber: 8,
      minimum: 1
    }
  }
}
export const FundAssetSchema = {
  $id: "lisk/crowd/fund",
  type: "object",
  required: ["crowdfund", "amount",],
  properties: {
    crowdfund: {
      dataType: "bytes",
      fieldNumber: 1,
    },
    amount: {
      dataType: "uint64",
      fieldNumber: 2,
    },
    message: {
      dataType: "string",
      fieldNumber: 3,
      minLength: 0,
      maxLength: 140,
    }
  }
}
export const ClaimAssetSchema = {
  $id: "lisk/crowd/claim",
  type: "object",
  required: ["crowdfund", "message"],
  properties: {
    crowdfund: {
      dataType: "bytes",
      fieldNumber: 1,
    },
    message: {
      dataType: "string",
      fieldNumber: 2,
      minLength: 1,
      maxLength: 200,
    }
  }
}
export const RefundAssetSchema = {
  $id: "lisk/crowd/refund",
  type: "object",
  required: ["crowdfund",],
  properties: {
    crowdfund: {
      dataType: "bytes",
      fieldNumber: 1,
    },
  }
}
export const VoteAssetSchema = {
  $id: "lisk/crowd/vote",
  type: "object",
  required: ["crowdfund", "period", "vote"],
  properties: {
    crowdfund: {
      dataType: "bytes",
      fieldNumber: 1,
    },
    period: {
      dataType: "uint32",
      fieldNumber: 2,
    },
    vote: { // true allowed to go along with the project, false vote for refund
      dataType: "boolean",
      fieldNumber: 3,
    }
  }
}
export const StartProjectAssetSchema = {
  $id: "lisk/crowd/startProject",
  type: "object",
  required: ["crowdfund", "start",],
  properties: {
    crowdfund: {
      dataType: "bytes",
      fieldNumber: 1,
    },
    start: { // block height start project
      dataType: "uint32",
      fieldNumber: 2,
    },
  }
}
export const AccountSchema = {
  $id: "lisk/crowd/account",
  type: "object",
  required: ["funds"],
  properties: {
    funds: {
      type: "array",
      fieldNumber: 1,
      minItems: 0,
      items: {
        dataType: "bytes",
      },
    },
    funded: {
      type: "array",
      fieldNumber: 2,
      minItems: 0,
      items: {
        type: "object",
        required: ["amount", "crowdfund"],
        properties: {
          amount: {
            dataType: "uint64",
            fieldNumber: 1,
          },
          crowdfund: {
            dataType: "bytes",
            fieldNumber: 2,
          }
        }
      }
    },
  },
  default: {
    funds: [],
    funded: [],
  }
}