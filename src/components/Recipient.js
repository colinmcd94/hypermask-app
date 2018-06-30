import React from "react";
import * as util from "../util/util";

function Recipient() {
  let state = app.state;
  // https://ethereum.stackexchange.com/questions/38381/how-can-i-identify-that-transaction-is-erc20-token-creation-contract
  return (
    <a target="_blank" href={util.explore(state.to)}>
      This {state.contractCode === "0x" ? <b>user</b> : <b>app</b>}
    </a>
  );
}

export default Recipient;
