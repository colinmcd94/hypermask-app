import * as GLOBALS from "./globals";
export async function getEthereumPrice() {
  let coinbasePriceResponse = await (await fetch(
    "https://api.coinbase.com/v2/prices/ETH-USD/buy"
  )).json();
  // should we increase price by 1% to cope with volatility?
  // let ethUSDPrice = coinbasePriceResponse.data.amount * GLOBALS.PRICE_VOLATILITY_BUFFER;
  // return ethUSDPrice
  return coinbasePriceResponse.data.amount;
}

export async function untilVisible() {
  while (true) {
    if (!document.hidden) return;
    await delay(1000);
  }
}

export function explore(address) {
  if (
    app.state &&
    app.state.to == address &&
    app.state.isERC20 == true &&
    app.state.chain.token_explore
  ) {
    return (
      app.state.chain.token_explore + address + "?a=" + app.state.myAddress
    );
  }
  return app.state.chain.explore + address;
}

export function findChain(idOrSlug) {
  for (let chain of GLOBALS.CHAINS) {
    if (chain.slug == idOrSlug || chain.id == idOrSlug) {
      return chain;
    }
  }
  return {
    name: `Custom Chain (${idOrSlug})`,
    slug: idOrSlug,
    id: idOrSlug,
    explore: "https://example.com/",
    rpc: ""
  };
}

export function parallel(...fns) {
  return Promise.all(fns.map(k => k()));
}

export function delay(amount) {
  return new Promise(resolve => setTimeout(resolve, amount));
}

export function roundUSD(usdAmount) {
  let amt = usdAmount > 100 ? Math.ceil(usdAmount) : usdAmount.toFixed(2);
  console.log("USD amount: " + amt);
  return amt;
}

export function BN(x) {
  let bigNum = web3.utils.toBN(x || "0");
  return bigNum;
}
