import * as methods from "./methods";

export const handlers = {};

export function listen() {
  window.addEventListener(
    "message",
    function(event) {
      if (!event.data) return;
      if (
        event.data.event &&
        event.origin === app.state.paymentFrameOrigin
        // event.origin === paymentFrameOrigin
      ) {
        handlePaymentFrameEvent(event);
      }

      if (event.data.app === "hypermask-call" && app.state.query.origin === event.origin) {
        let data = event.data;
        if (!methods[data.method]) {
          event.source.postMessage(
            {
              app: "hypermask-reply",
              channel: app.state.query.channel,
              id: data.id,
              error: `Error: RPC method ${data.method} not implemented. `
            },
            app.state.query.origin
          );
          return;
        }
        methods[data.method](...data.params)
          .then(result =>
            event.source.postMessage(
              {
                app: "hypermask-reply",
                channel: app.state.query.channel,
                id: data.id,
                result: result
              },
              app.state.query.origin
            )
          )
          .catch(error => {
            // console.error(error)
            event.source.postMessage(
              {
                app: "hypermask-reply",
                channel: app.state.query.channel,
                id: data.id,
                error: (error || "Error") + ""
              },
              app.state.query.origin
            );
          });
      } else if (event.data.app === "hypermask-reply" && app.state.query.origin === event.origin) {
        let data = event.data;
        console.log("Handlers");
        console.log(JSON.stringify(Object.keys(handlers), null, 2));
        if (data.id in handlers) {
          let { resolve, reject, method } = handlers[data.id];
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data.result);
          }
          delete handlers[data.id];
        } else {
          console.warn(data.id, "not in handlers");
        }
      }
    },
    false
  );
}

function handlePaymentFrameEvent(e) {
  if (e.data.event === "modal_closed") {
    if (app.state.fail) {
      app.state.fail("Transaction cancelled from payment frame");
    }
  } else if (e.data.event === "buy_completed") {
    app.state.next();
  } else if (e.data.event === "buy_canceled") {
    if (app.state.fail) {
      app.state.fail("Transaction cancelled from payment frame");
    }
  }
}
