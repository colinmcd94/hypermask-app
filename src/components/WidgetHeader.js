import React from "react";

import HypermaskLogo from "./HypermaskLogo";

function WidgetHeader() {
  return (
    <div className={"header" + (app.state.chain.slug === "mainnet" ? " mainnet" : " testnet")}>
      <div className="name">
        <a
          target="_blank"
          href={location.origin + location.pathname + "?chain=" + app.state.chain.slug}
        >
          <h1>
            <span className="thin">Hyper</span>Mask
          </h1>
          <div className="slogan">
            {app.state.chain.slug === "mainnet" ? (
              <span>decentralized apps for everyone</span>
            ) : (
              <span>{app.state.chain.name}</span>
            )}
          </div>
        </a>
      </div>
      <HypermaskLogo />
    </div>
  );
}

export default WidgetHeader;
