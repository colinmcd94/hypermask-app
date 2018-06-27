import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import Web3 from "web3";
import queryString from "query-string";

import Dashboard, { updateDashboard } from "./Dashboard";
import Widget from "./Widget";

import * as rpc from "./rpc/index";
import * as util from "./util";
import * as modalutil from "./modalutil";

import "./style.scss";

class App extends React.Component {
  constructor() {
    super();
    console.log("App constructor");
    const query = queryString.parse(location.search);
    console.log("AppQuery");
    console.log(JSON.stringify(query, null, 2));

    // var origin = query.origin;
    var chain = util.findChain(query.chain || "mainnet");
    // global.chain = util.findChain(query.chain || "mainnet");

    let provider = query.channel
      ? rpc.relayProvider
      : new Web3.providers.HttpProvider(chain.rpc);
    // let web3 = new Web3(provider);
    global.web3 = new Web3(provider);

    this.state = global.app
      ? global.app.state
      : {
          query,
          chain,
          provider,
          web3
        };

    global.app = this;
    rpc.listen();
  }

  componentDidMount() {
    if (window.parent === window) {
      updateDashboard();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log("App.state updating...");
    // Object.keys(nextState).map(key => {
    //   console.log(`${key}: ${nextState[key]}`);
    // });
    return true;
  }

  render() {
    let state = this.state;
    if (state.page === "widget") {
      return <Widget />;
    } else if (state.page === "dashboard") {
      return <Dashboard />;
    } else {
      return <div />;
    }
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
