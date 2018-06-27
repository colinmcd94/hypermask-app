import queryString from "query-string";

import * as util from "./util";
import * as makeutil from "./makeutil";
import * as walletutil from "./walletutil";
import * as event from "./event";
import mutex from "./mutex";
import * as rpc from "./rpc";

export async function show() {
  await rpc.call(
    "insertStylesheet",
    `
        @keyframes hypermask-entrance-animation {
            from {
                transform: scale(0.7) translateY(-600px);
            }
            to {
                transform: scale(1) translateY(0px);
            }
        }
        @keyframes hypermask-exit-animation {
            from {
                transform: scale(1) translateY(0px);
            }
            to {
                transform: scale(0.7) translateY(-700px);
            }
        }
        .hypermask_modal > iframe {
            height: 483px;
            width: 350px;
            background: white;
            border: 0;
        }
    `
  );
  await rpc.call(
    "setStyle",
    `
        position: fixed;
        display: block;
        z-index: 9999999999;
        top: 20px;
        right: 20px;
        border: 1px solid #d8d8d8;
        border-radius: 20px;
        overflow: hidden;
        
        animation-name: hypermask-entrance-animation;
        animation-duration: 0.4s;
        animation-fill-mode:forwards; 

        box-shadow: 0px 3px 14px #21212136;`
  );

  let parent = document.getElementById("payment_frame_parent");
  parent.innerHTML = "";
  parent.className = "";
  parent.style.display = "none";
}

export function interactive(fn, eventName) {
  return makeutil.flow(
    async function(...args) {
      await mutex.free();

      if (app.state.fail) {
        if (eventName) event.send(eventName + " cancelled by newer request");
        app.state.fail("Transaction cancelled by newer transaction request");
      }

      let ctx = this;
      Object.assign(this, {
        setState(obj) {
          ctx.check();
          if (app.state.fail !== ctx.fail) ctx.fail("Flow has already failed");
          app.setState(obj);
        },
        _next: makeutil.awaitableQueue(),
        next() {
          return ctx._next.pop();
        },
        resetNext() {
          this._next = makeutil.awaitableQueue();
        }
      });
      app.setState({
        fail: this.fail,
        next: () => ctx._next.push(true)
      });

      await show();

      let hasError;
      if (eventName) event.send(eventName);
      try {
        let result = await fn.apply(this, args);
        await util.delay(100);
        return result;
      } catch (err) {
        if (eventName) event.send(eventName + " aborted (" + err.message + ")");
        hasError = err;
      } finally {
        if (!hasError)
          (async () => {
            await util.delay(500);
            if (app.state.fail === ctx.fail) {
              await closeModal();
            }
          })();
      }
    },

    async function() {
      // if a new modal is created immediately, dont close the old one
      await util.delay(100);
      if (app.state.fail === this.fail) {
        await closeModal();
      }
    }
  );
}

export async function requestSignature(message) {
  this.setState({
    page: "widget",
    screen: "sign",
    message: message
  });
  await this.next();
  this.setState({ page: "widget", screen: "finish" });
}

export async function closeModal() {
  let unlock = mutex.lock();
  await rpc.call("closeModal");
  app.setState({ page: "blank" });
  unlock();
}

// let paymentFrameOrigin = "";
export async function runPaymentFlow(amount, address) {
  let parent = document.getElementById("payment_frame_parent");
  parent.style.display = "";
  parent.className = "";

  let url;
  let embedFrame = false;
  if (app.state.chain.slug === "mainnet") {
    url =
      "https://buy.coinbase.com/?" +
      queryString.stringify({
        address: address,
        amount: amount, // minimum purchase of $1
        code: "93cc359c-bf50-5ecc-b780-db05d4fbe263",
        currency: "USD",
        prefill_name: undefined,
        prefill_phone: undefined,
        prefill_email: undefined,
        crypto_currency: "ETH",
        state: undefined
      });
  } else {
    url =
      "https://hypermask.io/foinbase.html?" +
      queryString.stringify({
        address: address,
        amount: amount,
        chain: app.state.chain.slug,
        currency: "USD"
      });
    embedFrame = true;
  }
  if (app.state.query.embed !== undefined) {
    embedFrame = app.state.query.embed != "false";
  }

  console.log("Embedding frame? " + embedFrame);
  if (embedFrame) {
    let link = document.createElement("a");
    link.href = url;
    // paymentFrameOrigin = link.origin;
    app.setState({ paymentFrameOrigin: link.origin });

    parent.innerHTML = "";
    let frame = document.createElement("iframe");
    frame.id = "payment_modal_iframe";
    frame.name = "payment_modal_iframe";
    frame.scrolling = "no";
    frame.allowtransparency = "true";
    frame.frameborder = "0";
    frame.src = url;
    parent.appendChild(frame);

    await new Promise((resolve, reject) => {
      frame.onload = resolve;
      frame.onerror = reject;
    });

    parent.className = "enter";

    this.resetNext();
    await this.next();
  } else {
    let frame = window.open(url);

    this.setState({ page: "widget", screen: "stall" });

    while (true) {
      if (frame.closed) break;
      await util.delay(500);
    }
  }
}

export async function updateDashboard() {
  app.setState({ page: "dashboard" });
  let ethUSDPrice = await util.getEthereumPrice();
  let wallet = await walletutil.getWallet();
  let myAddress = wallet.getAddressString();

  app.setState({
    ethUSDPrice: ethUSDPrice,
    currentBalance: await web3.eth.getBalance(myAddress, "pending"), // does this pending qualifier do anything?
    // resolvedBalance: await web3.eth.getBalance(myAddress, 'latest'), // does this pending qualifier do anything?
    myAddress: myAddress
  });
}
