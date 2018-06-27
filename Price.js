import React from "react";
import * as util from "./util";
import * as GLOBALS from "./globals";

function Price(props) {
  let state = app.state;

  let ether = parseFloat(web3.utils.fromWei(props.wei, "ether"));
  if (app.state.ethUSDPrice) {
    // if you have enough money in your account, display the raw price
    // otherwise if you need to get money from coinbase, increase the
    // volatility and round up.
    let value;
    if (util.BN(state.priceEstimate).gt(util.BN(state.currentBalance))) {
      value = Math.max(
        1,
        util.roundUSD(
          ether * state.ethUSDPrice * GLOBALS.PRICE_VOLATILITY_BUFFER
        )
      );
    } else {
      value = util.roundUSD(ether * state.ethUSDPrice);
    }

    console.log("Value: " + value);
    return (
      <span>
        <b>{ether} ETH</b> (${value} USD)
      </span>
    );
  } else {
    return (
      <span>
        <b>{ether} ETH</b>
      </span>
    );
  }
}

export default Price;
