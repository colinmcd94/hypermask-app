import handlers from "./handlers";

const call = async (method, ...params) => {
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

export default call;
