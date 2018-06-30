import React from "react";

function IdentityBody() {
  return (
    <div className="body" key="identify">
      <h2>Reveal Identity</h2>
      <p>
        This app has requested information about your HyperMask Ethereum
        account.
      </p>
      <p className="caveat">
        If you allow this request, this app will be able to see your current
        account balance and transaction history.
      </p>
      <p className="caveat">
        Rejecting this request may limit your ability to use this application.
        It will not be able to request funds or signatures.
      </p>
    </div>
  );
}

export default IdentityBody;
