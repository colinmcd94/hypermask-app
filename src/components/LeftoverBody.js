import React from "react";

import Recipient from "./Recipient";
import Price from "./Price";
import * as util from "../util/util";

function LeftoverBody() {
  let state = app.state;

  return (
    <div className="body">
      <h2>Pay with Leftover Funds</h2>

      <p>
        <Recipient /> has requested <Price wei={state.priceEstimate} /> to continue.
      </p>
      <p>
        You have <Price wei={state.currentBalance} /> available in leftover funds— enough to
        complete this transaction with{" "}
        <Price wei={util.BN(state.currentBalance).sub(state.priceEstimate)} /> to spare.
      </p>
    </div>
  );
}

export default LeftoverBody;
