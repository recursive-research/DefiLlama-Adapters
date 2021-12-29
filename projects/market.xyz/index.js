const sdk = require("@defillama/sdk");
const abi = require("./abi");
const { getBlock } = require("../helper/getBlock.js");
const {
  transformPolygonAddress,
  transformFantomAddress,
} = require("../helper/portedTokens");

const fusePoolLensAddress = {
  polygon: "0x0e76288Ac7fD4643290Bc857E26A4E7BfBd5aADF",
  fantom: "0x5aB6215AB8344C28B899efdE93BEe47B124200Fb",
};

const WETH_CHAIN = {
  polygon: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  fantom: "0x74b23882a30290451a17c44f4f05243b6b58c76d",
};

async function getFusePools(
  timestamp,
  block,
  balances,
  borrowed,
  chain,
  transform = (a) => a
) {
  const data = (
    await sdk.api.abi.call({
      target: fusePoolLensAddress[chain],
      block,
      abi: abi,
      chain,
    })
  ).output;

  const length = data["0"].length;

  let totalSupplyInETH = 0;
  let totalBorrowInETH = 0;

  for (let i = 0; i < length; i++) {
    totalSupplyInETH += parseInt(data["2"][i]);
    totalBorrowInETH += parseInt(data["3"][i]);
  }

  if (borrowed) {
    balances[WETH_CHAIN[chain]] = totalSupplyInETH;
  } else {
    balances[WETH_CHAIN[chain]] = totalBorrowInETH;
  }
}

async function polygonTvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();
  block = getBlock(timestamp, "polygon", chainBlocks);
  await getFusePools(timestamp, block, balances, false, "polygon", transform);
  return balances;
}
async function polygonBorrowed(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();
  block = getBlock(timestamp, "polygon", chainBlocks);
  await getFusePools(timestamp, block, balances, true, "polygon", transform);
  return balances;
}
async function fantomTvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformFantomAddress();
  block = getBlock(timestamp, "fantom", chainBlocks);
  await getFusePools(timestamp, block, balances, false, "fantom", transform);
  return balances;
}
async function fantomBorrowed(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformFantomAddress();
  block = getBlock(timestamp, "fantom", chainBlocks);
  await getFusePools(timestamp, block, balances, true, "fantom", transform);
  return balances;
}
module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  polygon: {
    tvl: polygonTvl,
    borrowed: polygonBorrowed,
  },
  fantom: {
    tvl: fantomTvl,
    borrowed: fantomBorrowed,
  },
};
