import React from "react";
import { CSSTransitionGroup } from "react-transition-group";

import LeftoverBody from "./LeftoverBody";
import RightArrow from "./RightArrow";
import CheckMark from "./CheckMark";
import IdentityBody from "./IdentityBody";
import StallBody from "./StallBody";
import WaitBody from "./WaitBody";
import SpinnerBody from "./SpinnerBody";
import WidgetHeader from "./WidgetHeader";
import SignBody from "./SignBody";
import TokenBody from "./TokenBody";
import CardBody from "./CardBody";

function Widget(props) {
  document.body.className = "widget";
  let state = app.state;

  let body,
    next,
    abort = "Cancel";

  if (state.screen === "loading") {
    next = <div className="button loading">Loading...</div>;
    body = <SpinnerBody key="loading" />;
  } else if (state.screen === "wait") {
    next = <div />;
    body = <WaitBody key="wait" />;
  } else if (state.screen === "stall") {
    next = <div />;
    body = <StallBody key="stall" />;
  } else if (state.screen === "finish") {
    next = <div />;
    body = <SpinnerBody key="loading" />;
  } else if (state.screen === "token") {
    next = (
      <div className="button continue">
        Continue <RightArrow />
      </div>
    );
    body = <TokenBody />;

    // insufficient token funds to continue.
    if (state.insufficientTokens) {
      next = <div />;
      abort = "Close";
    }
  } else if (state.screen === "identify") {
    abort = "Reject";
    next = (
      <div className="button confirm">
        Allow <CheckMark />
      </div>
    );
    body = <IdentityBody key="identity" />;
  } else if (state.screen === "leftover") {
    next = (
      <div className="button confirm">
        Confirm <CheckMark />
      </div>
    );
    body = <LeftoverBody key="b" />;
  } else if (state.screen === "credit") {
    next = (
      <div className="button continue">
        Continue <RightArrow />
      </div>
    );
    body = <CardBody />;
  } else if (state.screen === "sign") {
    next = (
      <div className="button confirm">
        Sign <CheckMark />
      </div>
    );
    body = <SignBody />;
  } else {
    next = <div />;
    body = (
      <div className="body">
        ERROR: Screen "{state.screen}" not recognized.{" "}
      </div>
    );
  }

  return (
    <div id="app">
      <WidgetHeader />
      <div className="main">
        <CSSTransitionGroup
          transitionName="fade"
          transitionEnter={true}
          transitionEnterTimeout={300}
          transitionLeave={true}
          transitionLeaveTimeout={300}
        >
          {body}
        </CSSTransitionGroup>
      </div>
      {state.screen === "finish" ? null : (
        <div className="footer">
          <div
            className="button cancel"
            style={{ flex: 1 }}
            onClick={e => state.fail("Transaction cancelled by user")}
          >
            {abort}
          </div>

          <div
            style={{ position: "relative", width: 200, flex: 1 }}
            onClick={e => state.next()}
          >
            <CSSTransitionGroup
              transitionName="fade"
              transitionEnter={true}
              transitionEnterTimeout={300}
              transitionLeave={true}
              transitionLeaveTimeout={300}
            >
              {next}
            </CSSTransitionGroup>
          </div>
        </div>
      )}
    </div>
  );
}

export default Widget;
