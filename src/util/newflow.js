import queryString from "query-string";

import * as util from "./util";
import * as queueutil from "./queueutil";
import * as gautil from "./gautil";
import * as modalutil from "./modalutil";

class Flow {
  constructor(eventName, controller) {
    console.log("New flow: " + eventName);
    this.controller = controller;
    this.eventName = eventName;
    this.failed = false;
    this.queue = queueutil.awaitable();
  }

  async close(delay) {
    await util.delay(delay);
    if (app.state.flow === this) {
      await modalutil.closeModal();
    }
  }

  async fail(reason) {
    if (this.failed) return;

    this.failed = reason || true;
    await this.close(100);

    this._reject(reason);
  }

  check(value) {
    if (this.failed) throw new Error(this.failed);
    return value;
  }

  wait() {
    return this.queue.pop();
  }

  proceed(value = true) {
    this.queue.push(value);
  }

  setState(obj) {
    this.check();
    if (app.state.flow !== this) {
      console.log("Failing previous flow.");
      this.fail("Flow has already failed");
      return;
    }
    app.setState(obj);
  }

  resetNext() {
    this.queue = queueutil.awaitable();
  }

  // async catcher() {
  //   // if a new modal is created immediately, dont close the old one
  //   await util.delay(100);
  //   if (app.state.flow === this) {
  //     await modalutil.closeModal();
  //   }
  // }

  async run(...args) {
    console.log("Running flow: " + this.eventName);

    await app.state.mutex.free();
    console.log("Mutex if freed.");

    // if a different flow is currently active,
    // fail it before starting a new one
    console.log("Checking for existing flow.");
    if (app.state.flow) {
      console.log("Found existing flow...failing.");
      gautil.send((this.eventName || "Unknown event") + " cancelled by newer request");
      app.state.flow.fail("Transaction cancelled by newer transaction request");
    }

    console.log("Setting current flow");
    app.setState({
      flow: this
    });

    console.log("Showing modal");
    await modalutil.show();
    console.log("Modal is shown.");

    if (this.eventName) gautil.send(this.eventName);
    await util.delay(100);

    // let errThrown = false;
    // try {
    //   let result = await fn.apply(this, args);
    //   this.close(500) // async function called without await...non-blocking
    //   return result;
    // } catch (err) {
    //   errThrown = true
    //   gautil.send((this.eventName || "Unknown event") + " aborted (" + err.message + ")");
    //   this.fail(e);
    // }

    console.log("Executing controller...");
    let runPromise = new Promise((resolve, reject) => {
      console.log("Setting reject...");
      this._reject = reject;
      console.log("Calling controller...");
      return this.controller
        .apply(this, args)
        .then(result => {
          console.log("Successful flow!");
          resolve(result);
        })
        .catch(error => {
          console.log("Failed flow!");
          console.log(error);
          console.log(error.stack);
          this.fail(error);
        });
    })
      .then(result => {
        console.log("Got result!");
        console.log(result);
        this.close(500);
        return result;
      })
      .catch(err => {
        console.log("Flow failed...");
        console.log(err);
        gautil.send((this.eventName || "Unknown event") + " aborted (" + err.message + ")");
        this.fail(err);
      });
    return runPromise;
  }
}

export default Flow;
