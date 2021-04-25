import { TransactionBuilder } from "./utils";

const accounts = [
  {
    "passphrase": "sock uphold raise relief sword soldier praise ocean punch remove burden detail",
    "privateKey": "28c80f7b211cffe4eac4ef47d2515b2fbbd902f214fd4dccf6597af649fbd3269b177f6484be68bd41199e258de946a48b8b97302f42db9b24e713754d812bdf",
    "publicKey": "9b177f6484be68bd41199e258de946a48b8b97302f42db9b24e713754d812bdf",
    "binaryAddress": "97483993fc7fb8b24987667b151aa24034fc3d30",
    "address": "lskrhpctpgj8fj5pronoahy6bqv3zd8284ug8ahyk",
    "username": "corbifex",
  },
  {
    "passphrase": "area expand garbage olive exit result dry hammer meadow join stomach spawn",
    "privateKey": "66ccb67577de1aed7d59259fe8b6571d5eb2690d7c82f5c4b2a0460d5d54a8202c41e9485f1b59cd0eee1cd526ed873cb6ca4e4f10da13f94a31860f17d96bdb",
    "publicKey": "2c41e9485f1b59cd0eee1cd526ed873cb6ca4e4f10da13f94a31860f17d96bdb",
    "binaryAddress": "2576bedb09cbcc66b695f027fa7a34baffba1a52",
    "address": "lskpqs5he24a8bb99kqfztgkfykw5gskbrruj2aw6",
    "username": "johndoe",
  },
  {
    "passphrase": "search witness spy diagram dice debris borrow response album armed disagree total",
    "privateKey": "e55fc796874717c76d07201743c43f2b1d170a2797f20c04a30fd92fe421412ffbe954cf157db266a366599081f01d1f4c0f6793f6ccfffea356be9ba45d28ff",
    "publicKey": "fbe954cf157db266a366599081f01d1f4c0f6793f6ccfffea356be9ba45d28ff",
    "binaryAddress": "f517af3e2aa1394969c0bd7763d29ec660271d96",
    "address": "lskfk5df8y6kpjkrd7zwqsenkkf2auv7noefocfwk",
    "username": "janedoe",
  }
]

const tb = new TransactionBuilder("http://localhost:3512/api/", "ws://localhost:3511/ws", accounts)

const run = async () => {
  await tb.connect();
  console.log(await tb.wsClientCache.account.get(new Buffer.from(accounts[0].binaryAddress, 'hex')))
  console.log("all funds", JSON.stringify(await tb.callAction("sprinkler:getAllUsernames"), null, 2))
  console.log("all funds", JSON.stringify(await tb.callAction("crowd:getAllCrowdfunds"), null, 2))
}
run()