import React from "react";

import * as util from "./util";
import HypermaskLogo from "./HypermaskLogo";

function WaitBody() {
  let state = app.state;

  return (
    <div className={"body spinner wait-" + state.phase}>
      <HypermaskLogo width={300} height={200} clock speed={3} />

      <p className="caveat" style={{ marginTop: -20 }}>
        Waiting for <b>Coinbase</b> to transfer ETH into your{" "}
        <a target="_blank" href={util.explore(state.myAddress)}>
          <b>HyperMask wallet</b>
        </a>. This may take a few minutes.{" "}
        {state.phase == "latest" ? (
          <span>Waiting for blockchain confirmation...</span>
        ) : (
          <span>Searching for inbound transaction...</span>
        )}
      </p>
      <p className="caveat">
        Pressing <b>Cancel</b> will cancel the app's transaction, but your
        purchased ETH will stay in HyperMask for use in future transactions.
      </p>
    </div>
  );
}

export default WaitBody;
