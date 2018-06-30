import React from "react";

import HypermaskLogo from "./HypermaskLogo";

function SpinnerBody() {
  let state = app.state;

  return (
    <div className={"body spinner  spinner-" + state.screen}>
      <HypermaskLogo width={300} height={200} speed={3} />
    </div>
  );
}

export default SpinnerBody;
