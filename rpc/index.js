import { handlers, listen } from "./listen";
import * as methods from "./methods";

export { listen, methods };

export const call = async (method, ...params) => {
  let msg = {
    app: "hypermask-call",
    channel: app.state.query.channel,
    id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
    method: method,
    params: params
  };
  window.parent.postMessage(msg, app.state.query.origin);
  return await new Promise((resolve, reject) => {
    handlers[msg.id] = [resolve, reject];
  });
};

export const relayProvider = {
  send(payload, callback) {
    console.log("calling relayProvider");
    console.log(JSON.stringify(payload, null, 2));
    call("relayProvider", payload.method, ...payload.params)
      .then(result => {
        console.log(`${payload.method}: ${JSON.stringify(result, null, 2)}`);
        callback(null, {
          jsonrpc: "2.0",
          id: payload.id,
          result: result
        });
      })
      .catch(error => callback(error, null));
  }
};
