import { listen } from "./listen";

export { listen };

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
    handlers[msg.id] = { resolve, reject, method, params };
  });
};

export const relayProvider = {
  send(payload, callback) {
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
