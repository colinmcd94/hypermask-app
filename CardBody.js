import React from "react";

import Recipient from "./Recipient";
import Price from "./Price";
import * as util from "./util";

function CardBody() {
  let state = app.state;

  return (
    <div className="body">
      <h2>Pay with Debit Card</h2>
      {util.BN(state.currentBalance).isZero() ? (
        <p>
          <Recipient /> has requested <Price wei={state.priceEstimate} buffer />{" "}
          to continue.
        </p>
      ) : (
        <p>
          <Recipient /> has requested <Price wei={state.priceEstimate} />, but
          due to leftover funds, only{" "}
          <Price
            buffer
            wei={state.priceEstimate.sub(util.BN(state.currentBalance))}
          />{" "}
          is needed to continue.
        </p>
      )}

      <p>
        <a target="_blank" href="https://hypermask.io/">
          <b>HyperMask</b>
        </a>{" "}
        lets you securely transfer ETH to decentralized apps with your{" "}
        <b>Debit Card</b> via{" "}
        <a target="_blank" href="https://coinbase.com/">
          <b>Coinbase</b>
        </a>.{" "}
      </p>
      <p className="caveat">
        If you regularly use decentralized apps like this one, consider
        installing a browser extension such as{" "}
        <a target="_blank" href="https://metamask.io/">
          <b>MetaMask</b>
        </a>{" "}
        as it may be cheaper in the long run.
      </p>
    </div>
  );
}

export default CardBody;
