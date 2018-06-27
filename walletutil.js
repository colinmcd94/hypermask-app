import passworder from "browser-passworder";
import crypto from "crypto";
import Wallet from "ethereumjs-wallet";

import * as GLOBALS from "./globals";

// This wallet password doesn't really provide any security except against
// malicious extensions or desktop viruses that scan through memory for
// strings of bytes resembling private keys. Any sufficiently advanced
// agent can use this fixed string to decrypt the private key.

export const getWallet = async () => {
  let state;
  if (localStorage.encryptedHypermaskVault) {
    state = await passworder.decrypt(
      GLOBALS.WALLET_PASSWORD,
      localStorage.encryptedHypermaskVault
    );
  } else {
    state = {
      masterKey: crypto.randomBytes(32).toString("hex")
    };
    await setWallet(state);
  }
  let wallet = Wallet.fromPrivateKey(Buffer.from(state.masterKey, "hex"));
  return wallet;
};

export const setWallet = async state => {
  localStorage.encryptedHypermaskVault = await passworder.encrypt(
    GLOBALS.WALLET_PASSWORD,
    state
  );
};

export const getPrivateKey = async address => {
  const wallet = await getWallet();
  console.assert(wallet.getAddressString() === address.toLowerCase());
  return wallet.getPrivateKey();
};
