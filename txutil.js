import ethUtil from "ethereumjs-util";

import * as util from "./util";

export async function fix(txParams) {
  await util.parallel(
    async () => {
      if (txParams.gas === undefined)
        txParams.gas = web3.utils.numberToHex(
          await web3.eth.estimateGas(txParams)
        );
      if (txParams.gas !== undefined) txParams.gasLimit = txParams.gas;
    },
    async () => {
      if (txParams.nonce === undefined)
        txParams.nonce = web3.utils.numberToHex(
          await web3.eth.getTransactionCount(txParams.from, "pending")
        );
    },
    async () => {
      if (txParams.gasPrice === undefined)
        txParams.gasPrice = web3.utils.numberToHex(
          await web3.eth.getGasPrice()
        );
    },
    async () => {
      if (txParams.chainId === undefined)
        txParams.chainId = web3.utils.numberToHex(await web3.eth.net.getId());
    }
  );

  txParams.value = txParams.value || "0x00";
  txParams.data = ethUtil.addHexPrefix(txParams.data);

  return txParams;
}
