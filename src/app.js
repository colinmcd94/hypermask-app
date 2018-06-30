import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import Web3 from "web3";
import queryString from "query-string";

import Dashboard, { updateDashboard } from "./components/Dashboard";
import Widget from "./components/Widget";

import * as mutexutil from "./util/mutexutil";
import * as rpc from "./rpc/index";
import * as util from "./util/util";

import "./style.scss";

class App extends React.Component {
  constructor() {
    super();

    console.log("App constructor");

    const query = queryString.parse(location.search);
    var chain = util.findChain(query.chain || "mainnet");
    let provider = query.channel ? rpc.relayProvider : new Web3.providers.HttpProvider(chain.rpc);
    global.web3 = new Web3(provider);

    console.log("AppQuery");
    console.log(JSON.stringify(query, null, 2));

    let mutex = mutexutil.create();

    this.state = global.app ? global.app.state : { query, chain, mutex };
    global.app = this;
  }

  componentDidMount() {
    rpc.listen();
    if (window.parent === window) {
      updateDashboard();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log("App.state updating...");
    return true;
  }

  render() {
    let state = this.state;
    if (state.page === "widget") {
      return <Widget />;
    } else if (state.page === "dashboard") {
      return <Dashboard />;
    } else {
      return null;
    }
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
