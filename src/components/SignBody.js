import React from "react";

function SignBody() {
  return (
    <div className="body">
      <h2>Sign Message</h2>
      <p>
        This app has requested <b>your signature</b> on the following message:
      </p>
      <pre>{app.state.message || <i>(empty message)</i>}</pre>
    </div>
  );
}

export default SignBody;
