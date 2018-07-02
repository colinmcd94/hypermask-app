import call from "./call";
const relayProvider = {
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

export default relayProvider;
