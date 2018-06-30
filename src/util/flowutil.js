import queryString from "query-string";

import * as util from "./util";
import * as queueutil from "./queueutil";
import * as gautil from "./gautil";

function flow(controller, catcher) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      let ctx = {
        fail(reason) {
          if (ctx.failed) return;
          ctx.failed = reason || true;
          try {
            if (catcher) catcher.call(ctx);
          } finally {
            reject(reason);
          }
        },
        check(value) {
          if (ctx.failed) throw new Error(ctx.failed);
          return value;
        }
      };
      controller
        .apply(ctx, args)
        .then(result => resolve(result))
        .catch(error => ctx.fail(error));
    });
  };
}

export function interactive(fn, eventName) {
  return flow(
    async function(...args) {
      await app.state.mutex.free();

      if (app.state.fail) {
        if (eventName) gautil.send(eventName + " cancelled by newer request");
        app.state.fail("Transaction cancelled by newer transaction request");
      }

      let ctx = this;
      Object.assign(this, {
        setState(obj) {
          ctx.check();
          if (app.state.fail !== ctx.fail) ctx.fail("Flow has already failed");
          app.setState(obj);
        },
        _next: queueutil.awaitable(),
        next() {
          return ctx._next.pop();
        },
        resetNext() {
          this._next = queueutil.awaitable();
        }
      });
      app.setState({
        fail: this.fail,
        next: () => ctx._next.push(true)
      });

      await show();

      let hasError;
      if (eventName) gautil.send(eventName);
      try {
        let result = await fn.apply(this, args);
        await util.delay(100);
        return result;
      } catch (err) {
        if (eventName) gautil.send(eventName + " aborted (" + err.message + ")");
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

// let paymentFrameOrigin = "";
export async function runPaymentFlow(amount, address) {
  let parent = document.getElementById("payment_frame_parent");
  parent.style.display = "";
  parent.className = "";

  let url;
  let embedFrame;
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
    embedFrame = false;
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

  let embedOverride = app.state.query.embed;
  if (embedOverride == "true") {
    embedFrame == true;
  }

  // if (app.state.query.embed !== undefined) {
  //   embedFrame = app.state.query.embed != "false";
  // }

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
