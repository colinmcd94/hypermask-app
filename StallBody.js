import React from "react";

function StallBody() {
  return (
    <div key="stall" className="body">
      <h2>Buy from Coinbase</h2>
      <p className="caveat">
        We've opened a new page where you can purchase ETH via <b>Coinbase</b>.
        Buy the requested amount of ETH with your <b>Debit Card</b> or{" "}
        <b>Bank Account</b>.
      </p>
      <p className="caveat">
        Once you've finished purchasing the ETH, <b>close that tab</b> and the
        transaction will continue from here.
      </p>
    </div>
  );
}

export default StallBody;
