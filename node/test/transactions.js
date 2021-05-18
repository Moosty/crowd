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
  console.log("Sprinkler tx Corbifex", await tb
    .setModuleAssetId(6666, 100)
    .setAssets({username: accounts[0].username})
    .send("corbifex")
  )
  console.log("Sprinkler tx johndoe", await tb
    .setModuleAssetId(6666, 100)
    .setAssets({username: accounts[1].username})
    .send("johndoe")
  )
  console.log("Sprinkler tx janedoe", await tb
    .setModuleAssetId(6666, 100)
    .setAssets({username: accounts[2].username})
    .send("janedoe")
  )
  await tb.wait(1)
  console.log("Create working crowdfund",
    await tb
      .setModuleAssetId(3510, 0)
      .setAssets({
        title: "My First Crowdfund",
        description: "Give me LSK to save a dog",
        goal: BigInt(100000000000), // 1k lsk
        periods: 12,
        site: "https://saveadoge.com",
        image: 3,
        category: 1,
        start: 5,
      })
      .send('corbifex')
  )
  console.log("Create working crowdfund 2",
    await tb
      .setModuleAssetId(3510, 0)
      .setAssets({
        title: "My First Crowdfund",
        description: "Give me LSK to save a dog",
        goal: BigInt(100000000000), // 1k lsk
        periods: 12,
        site: "https://saveadoge.com",
        image: 1,
        category: 1,
        start: 5,
      })
      .send('johndoe')
  )
  await tb.waitUntil(5)
  console.log("Fund crowdfund",
    await tb
      .setModuleAssetId(3510, 1)
      .setAssets({
        crowdfund: new Buffer.from('ae464901d5665085fb5d32675cd8f91814ede6f419ee4fea308f89c46cd4e7b6', 'hex'),
        amount: BigInt(99005709000), // 100 lsk
        message: "Great project!"
      })
      .send('johndoe')
  )
  console.log("Fund crowdfund",
    await tb
      .setModuleAssetId(3510, 1)
      .setAssets({
        crowdfund: new Buffer.from('ae464901d5665085fb5d32675cd8f91814ede6f419ee4fea308f89c46cd4e7b6', 'hex'),
        amount: BigInt(99005709000), // 100 lsk
        message: "Great project !"
      })
      .send('janedoe')
  )
  await tb.wait(0)

  console.log("Fund crowdfund",
    await tb
      .setModuleAssetId(3510, 1)
      .setAssets({
        crowdfund: new Buffer.from('227cd5757c98790affd894d17ac627e8fc4ab4d18fe1a08c24ad41ec73aa94e3', 'hex'),
        amount: BigInt(99005701000), // 100 lsk
        message: "Great projec!"
      })
      .send('janedoe')
  )

  console.log("Fund crowdfund",
    await tb
      .setModuleAssetId(3510, 1)
      .setAssets({
        crowdfund: new Buffer.from('227cd5757c98790affd894d17ac627e8fc4ab4d18fe1a08c24ad41ec73aa94e3', 'hex'),
        amount: BigInt(99005701000), // 100 lsk
        message: "Great project"
      })
      .send('corbifex')
  )

  await tb.wait(1)
  console.log("Start project",
    await tb
      .setModuleAssetId(3510, 2)
      .setAssets({
        crowdfund: new Buffer.from('ae464901d5665085fb5d32675cd8f91814ede6f419ee4fea308f89c46cd4e7b6', 'hex'),
        start: 10
      })
      .send('corbifex')
  )
  console.log("Start project",
    await tb
      .setModuleAssetId(3510, 2)
      .setAssets({
        crowdfund: new Buffer.from('227cd5757c98790affd894d17ac627e8fc4ab4d18fe1a08c24ad41ec73aa94e3', 'hex'),
        start: 10
      })
      .send('johndoe')
  )

  // up next votes
  await tb.waitUntil(11)
  console.log("Vote Early",
    await tb
      .setModuleAssetId(3510, 3)
      .setAssets({
        crowdfund: new Buffer.from('ae464901d5665085fb5d32675cd8f91814ede6f419ee4fea308f89c46cd4e7b6', 'hex'),
        period: 1,
        vote: false,
      })
      .send('johndoe')
  )

  await tb.waitUntil(21)
  console.log("Vote out",
    await tb
      .setModuleAssetId(3510, 3)
      .setAssets({
        crowdfund: new Buffer.from('ae464901d5665085fb5d32675cd8f91814ede6f419ee4fea308f89c46cd4e7b6', 'hex'),
        period: 1,
        vote: false,
      })
      .send('johndoe')
  )
  console.log("vote out",
    await tb
      .setModuleAssetId(3510, 3)
      .setAssets({
        crowdfund: new Buffer.from('ae464901d5665085fb5d32675cd8f91814ede6f419ee4fea308f89c46cd4e7b6', 'hex'),
        period: 1,
        vote: false,
      })
      .send('janedoe')
  )
  await tb.wait(1)

  console.log("Vote in",
    await tb
      .setModuleAssetId(3510, 3)
      .setAssets({
        crowdfund: new Buffer.from('227cd5757c98790affd894d17ac627e8fc4ab4d18fe1a08c24ad41ec73aa94e3', 'hex'),
        period: 1,
        vote: true,
      })
      .send('corbifex')
  )
  console.log("vote in",
    await tb
      .setModuleAssetId(3510, 3)
      .setAssets({
        crowdfund: new Buffer.from('227cd5757c98790affd894d17ac627e8fc4ab4d18fe1a08c24ad41ec73aa94e3', 'hex'),
        period: 1,
        vote: true,
      })
      .send('janedoe')
  )

  await tb.wait(1)

  console.log("refund john",
    await tb
      .setModuleAssetId(3510, 5)
      .setAssets({
        crowdfund: new Buffer.from('ae464901d5665085fb5d32675cd8f91814ede6f419ee4fea308f89c46cd4e7b6', 'hex'),
      })
      .send('johndoe')
  )
  await tb.wait(1)

  console.log("claim john",
    await tb
      .setModuleAssetId(3510, 4)
      .setAssets({
        crowdfund: new Buffer.from('227cd5757c98790affd894d17ac627e8fc4ab4d18fe1a08c24ad41ec73aa94e3', 'hex'),
        message: "See my progress"
      })
      .send('johndoe')
  )
  await tb.wait(1)
  console.log("all funds", JSON.stringify(await tb.callAction("crowd:getAllCrowdfunds"), null, 2))

  await tb.wait(2)
  console.log("refund by owner",
    await tb
      .setModuleAssetId(3510, 5)
      .setAssets({
        crowdfund: new Buffer.from('ae464901d5665085fb5d32675cd8f91814ede6f419ee4fea308f89c46cd4e7b6', 'hex'),
      })
      .send('corbifex')
  )
  await tb.wait(10)
  console.log("claim john",
    await tb
      .setModuleAssetId(3510, 4)
      .setAssets({
        crowdfund: new Buffer.from('227cd5757c98790affd894d17ac627e8fc4ab4d18fe1a08c24ad41ec73aa94e3', 'hex'),
        message: "See my progress"
      })
      .send('johndoe')
  )
  // up next refund

  /*
  Todo:
  - create crowdfund with errors,
  - create crowdfund correct
  - fund crowdfund
  - startProject
  - vote
  - claim
  - refund (owner, user)
   */
}

run()