export function send(action, amount) {
  if (!localStorage.disableAnalytics && window.ga) {
    ga("send", {
      hitType: "event",
      eventCategory: app.state.chain.name,
      eventAction: action,
      eventValue:
        amount === undefined
          ? undefined
          : web3.utils.fromWei(amount, "microether")
    });
  }
}
