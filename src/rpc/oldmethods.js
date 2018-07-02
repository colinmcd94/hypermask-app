import ethUtil from "ethereumjs-util";
import EthereumTx from "ethereumjs-tx";
import sigUtil from "eth-sig-util";
import abiDecoder from "abi-decoder";

import * as GLOBALS from "../globals";

import * as util from "../util/util";
import * as txutil from "../util/txutil";
import * as walletutil from "../util/walletutil";
import * as gautil from "../util/gautil";
import * as flowutil from "../util/flowutil";

abiDecoder.addABI(GLOBALS.ERC20ABI);
var sessionDeanonymized = !localStorage.requireIdentityApproval;

export async function eth_accounts() {
  if (!sessionDeanonymized) {
    try {
      await flowutil.interactive(async function() {
        this.setState({ page: "widget", screen: "identify" });
        await this.wait();
        this.setState({ page: "widget", screen: "finish" });
      })();
      sessionDeanonymized = true;
    } catch (err) {
      gautil.send("Request Account ID (Denied)");
      return [];
    }
    gautil.send("Request Account ID (Approved)");
  } else {
    gautil.send("Request Account ID");
  }
  return [(await walletutil.getWallet()).getAddressString()];
}

export const personal_sign = flowutil.interactive(async function(message, from) {
  await flowutil.requestSignature.call(this, web3.utils.hexToAscii(message));
  if (ethUtil.isValidAddress(message) && !ethUtil.isValidAddress(from)) {
    console.warn("The eth_personalSign method arguments were flipped.");
    [message, from] = [from, message];
  }

  console.log("From: " + from);
  const serialized = sigUtil.personalSign(await walletutil.getPrivateKey(from), {
    from: from,
    data: message
  });
  return serialized;
}, "personal_sign");

export const eth_sign = flowutil.interactive(async function(from, message) {
  await flowutil.requestSignature.call(this, web3.utils.hexToAscii(message));
  const serialized = sigUtil.personalSign(await walletutil.getPrivateKey(from), {
    from: from,
    data: message
  });
  return serialized;
}, "eth_sign");

export const eth_signTypedData = flowutil.interactive(async function(message, from, extraParams) {
  await flowutil.requestSignature.call(
    this,
    message.map(k => k.name + ": " + JSON.stringify(k.value, null, "  ")).join("\n")
  );
  // JSON.stringify(message, null, '  '))
  const serialized = sigUtil.signTypedData(await walletutil.getPrivateKey(from), {
    ...extraParams,
    from: from,
    data: message
  });
  return serialized;
}, "signTypedData");

export const eth_sendTransaction = flowutil.interactive(async function(txParams) {
  this.setState({ page: "widget", screen: "loading" });

  console.assert(
    (await walletutil.getWallet()).getAddressString() === txParams.from.toLowerCase(),
    "'from' field for transaction must be current address."
  );

  let _currentBalance = web3.eth.getBalance(txParams.from, "pending");
  let _ethUSDPrice = util.getEthereumPrice();

  txParams = await txutil.fix(txParams);
  let priceEstimate = util
    .BN(txParams.value)
    .add(util.BN(txParams.gasPrice).mul(util.BN(txParams.gas)));
  let ethAmount = web3.utils.fromWei(priceEstimate, "ether");
  let currentBalance = await _currentBalance;
  let sufficientLeftovers = priceEstimate.lt(util.BN(currentBalance));

  let ethUSDPrice = await _ethUSDPrice;
  this.setState({ ethUSDPrice: ethUSDPrice });

  let contractCode = await web3.eth.getCode(txParams.to);

  // 18160ddd -> totalSupply()
  // 70a08231 -> balanceOf(address)
  // dd62ed3e -> allowance(address,address)
  // a9059cbb -> transfer(address,uint256)
  // 095ea7b3 -> approve(address,uint256)
  // 23b872dd -> transferFrom(address,address,uint256)

  let isERC20 = /70a08231/.test(contractCode) && /a9059cbb/.test(contractCode); // balanceOf(address) // transfer(address,uint256)

  this.setState({
    to: txParams.to,
    myAddress: txParams.from,
    priceEstimate: priceEstimate,
    currentBalance: currentBalance,
    contractCode: contractCode,
    isERC20: isERC20
  });

  if (isERC20) {
    try {
      const ERC20 = new web3.eth.Contract(GLOBALS.ERC20ABI, txParams.to, {});
      var tokenName = await ERC20.methods.name().call(),
        tokenSymbol = await ERC20.methods.symbol().call(),
        tokenDecimals = await ERC20.methods.decimals().call(),
        tokenBalance = await ERC20.methods.balanceOf(txParams.from).call(),
        txData = abiDecoder.decodeMethod(txParams.data);
    } catch (err) {
      gautil.send("ERC20 Error", 0);
    }
    if (tokenName) {
      // console.log(tokenName, tokenDecimals, tokenBalance, txParams, txData)
      gautil.send("ERC20", tokenBalance);
      let tokenMethodParams = _.fromPairs(txData.params.map(k => [k.name, k.value]));

      this.setState({
        page: "widget",
        screen: "token",

        insufficientTokens: util.BN(tokenMethodParams._value).gt(util.BN(tokenBalance)),
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        tokenDecimals: tokenDecimals,
        tokenBalance: tokenBalance,
        tokenMethodName: txData.name,
        tokenMethodParams: tokenMethodParams
      });
      await this.wait();
      this.setState({ page: "widget", screen: "loading" });
      await util.delay(400);
    }
  }

  if (sufficientLeftovers) {
    gautil.send("Sufficient Leftover Funds", currentBalance);
    // we have enough money to pay with it using leftovers
    this.setState({
      page: "widget",
      screen: "leftover"
    });

    await this.wait();
    this.setState({ page: "widget", screen: "loading" });
  } else {
    gautil.send("Request Funds", priceEstimate);
    this.setState({
      page: "widget",
      screen: "credit"
    });

    let blockNumber = await web3.eth.getBlockNumber();

    await this.wait();
    this.setState({ page: "widget", screen: "loading" });
    let neededWei = priceEstimate.sub(util.BN(currentBalance));
    let ether = parseFloat(web3.utils.fromWei(neededWei, "ether"));

    let usdAmount = Math.max(
      1,
      util.roundUSD(ether * ethUSDPrice * GLOBALS.PRICE_VOLATILITY_BUFFER)
    );

    await flowutil.runPaymentFlow.call(this, usdAmount, txParams.from);

    this.setState({ page: "widget", screen: "wait", phase: "pending" });

    let parent = document.getElementById("payment_frame_parent");
    parent.className = "exit";
    await util.delay(1000);
    parent.innerHTML = "";
    parent.style.display = "none";

    // poll until we've the new transaction (this should be quick)
    for (let i = 0; true; i++) {
      await util.untilVisible();
      let newBalance = await web3.eth.getBalance(txParams.from, "pending");
      console.log("new balance (pending)", newBalance);
      if (util.BN(newBalance).gt(priceEstimate)) break;
      await util.delay(1000 + 100 * i);
      this.check();
    }

    gautil.send("Found Transaction");

    this.setState({ page: "widget", screen: "wait", phase: "latest" });
    for (let i = 0; true; i++) {
      await util.untilVisible();
      let newBalance = await web3.eth.getBalance(txParams.from, "latest");
      console.log("new balance (latest)", newBalance);
      if (util.BN(newBalance).gt(priceEstimate)) break;
      await util.delay(5000 + 100 * i);
      this.check();
    }
  }
  gautil.send("Sending Transaction", priceEstimate);
  this.check();
  this.setState({ page: "widget", screen: "finish" });
  const tx = new EthereumTx(txParams);
  tx.sign(await walletutil.getPrivateKey(txParams.from));
  const serializedTx = tx.serialize();
  const signedTx = ethUtil.bufferToHex(serializedTx);
  // console.log('sending things', signedTx)

  return await new Promise((resolve, reject) =>
    web3.eth
      .sendSignedTransaction(signedTx)
      .on("transactionHash", resolve)
      .on("error", reject)
  );
}, "eth_sendTransaction");
