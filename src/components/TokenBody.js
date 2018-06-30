import React from "react";

import * as util from "../util/util";
import Price from "./Price";

// TODO: we should make an interface to EtherDelta's contract that is really simple and easy and good.
function TokenBody() {
  let state = app.state;

  function d(n) {
    let s = "00000000000000000000" + util.BN(n).toString();
    return (
      (s.slice(0, -state.tokenDecimals).replace(/^0+/, "") || "0") +
      "." +
      s.slice(-state.tokenDecimals)
    );
  }

  return (
    <div className="body">
      <h2>
        Transfer{" "}
        <a target="_blank" href={util.explore(state.to)}>
          <u>{state.tokenName}</u>
        </a>
      </h2>
      <p>
        This app has requested{" "}
        <b>
          {d(state.tokenMethodParams._value)} {state.tokenSymbol}
        </b>. You have{" "}
        <b>
          {d(state.tokenBalance)} {state.tokenSymbol}
        </b>{" "}
        in your account.
      </p>
      {state.insufficientTokens
        ? [
            <p style={{ color: "red" }}>
              <b>You do not have enough {state.tokenName} to complete this transaction.</b>
            </p>,
            <p>
              Transfer{" "}
              <b>
                {" "}
                {d(util.BN(state.tokenMethodParams._value).sub(util.BN(state.tokenBalance)))}{" "}
                {state.tokenSymbol}{" "}
              </b>
              to your{" "}
              <a
                target="_blank"
                href={location.origin + location.pathname + "?chain=" + app.state.chain.slug}
              >
                <b>HyperMask wallet</b>
              </a>{" "}
              and try again. You may be able to purchase through a token exchange such as{" "}
              <a href="https://forkdelta.github.io/" target="_blank">
                <b>ForkDelta</b>
              </a>.
            </p>
          ]
        : [
            <p>
              You have enough <b>{state.tokenName}</b> to complete this transaction with
              <b>
                {" "}
                {d(util.BN(state.tokenBalance).sub(util.BN(state.tokenMethodParams._value)))}{" "}
                {state.tokenSymbol}{" "}
              </b>
              to spare.
            </p>,
            <p>
              You will also need <Price wei={state.priceEstimate} /> cover the transaction fee.
            </p>
          ]}
    </div>
  );
}

export default TokenBody;
