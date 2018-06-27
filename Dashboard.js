import React from "react";

import Wallet from "ethereumjs-wallet";
import ethUtil from "ethereumjs-util";
import EthereumTx from "ethereumjs-tx";

import Web3 from "web3";

import HypermaskLogo from "./HypermaskLogo";
import Price from "./Price";
import * as GLOBALS from "./globals";
import * as util from "./util";
import * as txutil from "./txutil";
import * as event from "./event";
import * as walletutil from "./walletutil";
import * as modalutil from "./modalutil";

export async function updateDashboard() {
  app.setState({ page: "dashboard" });
  let ethUSDPrice = await util.getEthereumPrice();
  let wallet = await walletutil.getWallet();
  let myAddress = wallet.getAddressString();

  app.setState({
    ethUSDPrice: ethUSDPrice,
    currentBalance: await web3.eth.getBalance(myAddress, "pending"), // does this pending qualifier do anything?
    // resolvedBalance: await web3.eth.getBalance(myAddress, 'latest'), // does this pending qualifier do anything?
    myAddress: myAddress
  });
}

function Dashboard() {
  let state = app.state;
  document.body.className =
    "dashboard" + (state.chain.slug === "mainnet" ? " mainnet" : " testnet");

  return (
    <div className={"main"}>
      <div className="header">
        <HypermaskLogo width={400} height={300} />
        <div>
          <h1>
            <span className="thin">Hyper</span>Mask
          </h1>
          <h2>Dashboard</h2>
        </div>
      </div>
      <div className="block">
        {!state.currentBalance ? null : (
          <div>
            You have <Price wei={state.currentBalance} />
          </div>
        )}

        {!state.myAddress ? null : (
          <div>
            <b>Address: </b>
            <a target="_blank" href={util.explore(state.myAddress)}>
              {state.myAddress}
            </a>
          </div>
        )}

        <div>
          <b>Chain: </b> {state.chain.name}
        </div>

        <div className="caveat">
          HyperMask maintains a local Ethereum wallet in your browser— its
          private keys never leave your computer. Funds are briefly sent from
          Coinbase to your HyperMask wallet, after which the funds are
          immediately spent on the requested transaction. Value may be left over
          in your HyperMask wallet due to changes in Ethereum's price during the
          purchase process, if a transaction fails and gets refunded by the
          network, or if ETH is sent to your wallet address (for instance from
          contract earnings).
        </div>
        <div className="caveat">
          As your HyperMask wallet is accessible to anyone with physical access
          to your computer, you should not use Hypermask to hold substantial
          amounts of ether. Think of HyperMask's wallet as a jar for storing
          loose change, rather than a bank vault for storing your life savings.
        </div>
      </div>
      <div className="block">
        <div>
          <button
            style={{ background: "#ff00c3" }}
            onClick={async () => {
              event.send("Download Private Key");
              let link = document.createElement("a");
              let wallet = await walletutil.getWallet();
              let blob = new Blob([wallet.getPrivateKeyString(), "\n"], {
                type: "application/octet-stream"
              });
              link.style.position = "absolute";
              link.style.left = "-1000px";
              link.style.top = "-1000px";
              link.href = URL.createObjectURL(blob);
              link.download = "HyperMaskPrivateKeyBackup.dat";
              document.body.appendChild(link);
              link.click();
            }}
          >
            <b>Download</b> Private Key Backup
          </button>

          <button
            style={{
              float: "right",
              background: "rgb(106, 153, 217)"
            }}
            onClick={() => {
              let input = document.createElement("input");
              input.type = "file";
              input.onchange = function() {
                console.log(input.files);
                if (input.files.length === 0) return;
                let file = input.files[0];
                let fr = new FileReader();
                fr.onload = async function() {
                  let restoredPK = Buffer.from(
                    web3.utils.hexToBytes(fr.result.trim())
                  );
                  let restoredWallet = Wallet.fromPrivateKey(restoredPK);
                  let restoredBalance = util.BN(
                    await web3.eth.getBalance(
                      restoredWallet.getAddressString(),
                      "pending"
                    )
                  );

                  let wallet = await walletutil.getWallet();
                  let currentBalance = util.BN(
                    await web3.eth.getBalance(
                      wallet.getAddressString(),
                      "pending"
                    )
                  );

                  if (
                    wallet.getAddressString() ===
                    restoredWallet.getAddressString()
                  ) {
                    event.send("Restore Current Wallet");
                    alert("No need to import your current wallet.");
                  } else if (currentBalance.isZero()) {
                    console.log(
                      "current wallet balance is zero, swapping out private key"
                    );
                    // we can swap out the old private key

                    if (
                      confirm(
                        "Do you want to replace the current empty wallet with this restored wallet?\nPress cancel if you have any ERC20 tokens associated with the empty account."
                      )
                    ) {
                      let state = {
                        masterKey: restoredWallet
                          .getPrivateKey()
                          .toString("hex")
                      };
                      event.send("Replace Empty Wallet", restoredBalance);
                      walletutil.setWallet(state);
                      // alert('Current (empty) wallet replaced with imported wallet.')
                      updateDashboard();
                    } else {
                      event.send(
                        "Replace Empty Wallet (Cancel)",
                        restoredBalance
                      );
                    }
                  } else {
                    // we transfer the balance of the old key into the new key
                    if (restoredBalance.isZero()) {
                      event.send("Import Empty Wallet", restoredBalance);
                      alert(
                        `${restoredWallet.getAddressString()} appears to be an empty wallet.`
                      );
                      return;
                    }

                    let txObj = {
                      from: restoredWallet.getAddressString(),
                      to: wallet.getAddressString(),
                      value: restoredBalance
                    };
                    txObj = await txutil.fix(txObj);

                    let gasValue = util
                      .BN(txObj.gasPrice)
                      .mul(util.BN(txObj.gas));
                    txObj.value = restoredBalance.sub(gasValue);

                    let newBalance = txObj.value.add(currentBalance);

                    if (
                      confirm(
                        `Do you want to transfer ${web3.utils.fromWei(
                          txObj.value,
                          "ether"
                        )} ETH from ${restoredWallet.getAddressString()} into your current wallet (${wallet.getAddressString()})?\n\n${web3.utils.fromWei(
                          gasValue,
                          "ether"
                        )} ETH (${(
                          100 * gasValue.div(restoredBalance).toNumber()
                        ).toFixed(
                          4
                        )}%) of the value in the account will be lost to transaction fees. Your new balance will be ${web3.utils.fromWei(
                          newBalance,
                          "ether"
                        )} ETH (an increase of ${(
                          100 *
                          newBalance.toNumber() /
                          currentBalance.toNumber()
                        ).toFixed(2)}%).`
                      )
                    ) {
                      event.send("Import Wallet", restoredBalance);

                      const tx = new EthereumTx(txObj);
                      tx.sign(restoredWallet.getPrivateKey());
                      const serializedTx = tx.serialize();
                      const signedTx = ethUtil.bufferToHex(serializedTx);

                      web3.eth
                        .sendSignedTransaction(signedTx)
                        .on("transactionHash", () =>
                          setTimeout(updateDashboard, 500)
                        )
                        .on("receipt", () => setTimeout(updateDashboard, 500))
                        .on("confirmation", () =>
                          setTimeout(updateDashboard, 500)
                        )
                        .on("error", error => alert(error));
                    } else {
                      event.send("Import Wallet (Cancel)", restoredBalance);
                    }
                  }
                  // console.log(fr.result.trim())
                };
                fr.readAsText(file);
              };
              input.click();
            }}
          >
            <b>Import</b> Private Key Backup
          </button>
        </div>

        <div className="caveat">
          All wallet funds associated with this browser will be irrevocably lost
          if you clear website data associated with hypermask.io without first
          saving a backup of your private key.
        </div>

        {util.BN(state.currentBalance || "0").isZero() ? null : (
          <div>
            <button
              style={{ background: "#27AE60" }}
              onClick={async () => {
                let wallet = await walletutil.getWallet();
                let currentBalance = util.BN(
                  await web3.eth.getBalance(
                    wallet.getAddressString(),
                    "pending"
                  )
                );

                let txObj = {
                  from: wallet.getAddressString(),
                  to: GLOBALS.HYPERMASK_DEV_ADDRESS,
                  value: currentBalance
                };
                txObj = await txutil.fix(txObj);
                let gasValue = util.BN(txObj.gasPrice).mul(util.BN(txObj.gas));
                txObj.value = currentBalance.sub(gasValue);

                if (
                  confirm(
                    `Do you want to donate ${web3.utils.fromWei(
                      currentBalance,
                      "ether"
                    )} ETH to the HyperMask development team (${wallet.getAddressString()})?\n\n${web3.utils.fromWei(
                      gasValue,
                      "ether"
                    )} ETH (${(
                      gasValue
                        .mul(util.BN(10000))
                        .div(currentBalance)
                        .toNumber() / 100
                    ).toFixed(2)}%) will be lost to transaction fees.`
                  )
                ) {
                  event.send("Donate (Sent)", currentBalance);

                  const tx = new EthereumTx(txObj);
                  tx.sign(wallet.getPrivateKey());
                  const serializedTx = tx.serialize();
                  const signedTx = ethUtil.bufferToHex(serializedTx);

                  web3.eth
                    .sendSignedTransaction(signedTx)
                    .on("transactionHash", () => {
                      setTimeout(updateDashboard, 500);
                      alert("Thank you for your contribution!");
                    })
                    .on("receipt", () => setTimeout(updateDashboard, 500))
                    .on("confirmation", () => setTimeout(updateDashboard, 500))
                    .on("error", error => alert(error));
                } else {
                  event.send("Donate (Cancel)", currentBalance);
                }
              }}
            >
              <b>Donate</b> to HyperMask Developers
            </button>

            {!web3.givenProvider ? null : (
              <button
                style={{
                  background: "#f76c20",
                  float: "right"
                }}
                onClick={async () => {
                  let nativeWeb3 = new Web3(web3.givenProvider);

                  let myAccounts = await nativeWeb3.eth.getAccounts();

                  if (myAccounts.length === 0) {
                    alert(
                      "Unable to determine your MetaMask wallet address. Please unlock your wallet and try again. "
                    );
                    return;
                  }
                  // console.log(nativeWeb3)
                  let wallet = await walletutil.getWallet();
                  let currentBalance = util.BN(
                    await web3.eth.getBalance(
                      wallet.getAddressString(),
                      "pending"
                    )
                  );

                  let txObj = {
                    from: wallet.getAddressString(),
                    to: myAccounts[0],
                    value: currentBalance
                  };
                  txObj = await txutil.fix(txObj);
                  let gasValue = util
                    .BN(txObj.gasPrice)
                    .mul(util.BN(txObj.gas));
                  txObj.value = currentBalance.sub(gasValue);

                  if (
                    confirm(
                      `Do you want to transfer ${web3.utils.fromWei(
                        currentBalance,
                        "ether"
                      )} ETH to your MetaMask wallet (${wallet.getAddressString()})?\n\n${web3.utils.fromWei(
                        gasValue,
                        "ether"
                      )} ETH (${(
                        gasValue
                          .mul(util.BN(10000))
                          .div(currentBalance)
                          .toNumber() / 100
                      ).toFixed(2)}%) will be lost to transaction fees.`
                    )
                  ) {
                    event.send("Transfer MetaMask (Sent)", currentBalance);

                    const tx = new EthereumTx(txObj);
                    tx.sign(wallet.getPrivateKey());
                    const serializedTx = tx.serialize();
                    const signedTx = ethUtil.bufferToHex(serializedTx);

                    web3.eth
                      .sendSignedTransaction(signedTx)
                      .on("transactionHash", () => {
                        setTimeout(updateDashboard, 500);
                        alert("Transfer complete!");
                      })
                      .on("receipt", () => setTimeout(updateDashboard, 500))
                      .on("confirmation", () =>
                        setTimeout(updateDashboard, 500)
                      )
                      .on("error", error => alert(error));
                  } else {
                    event.send("Transfer MetaMask (Cancel)", currentBalance);
                  }
                }}
              >
                <b>Transfer</b> to{" "}
                {/Metamask/.test(web3.givenProvider.constructor.name)
                  ? "MetaMask"
                  : "Native"}{" "}
                Wallet
              </button>
            )}
          </div>
        )}

        <div className="caveat">
          Transferring your account balance does not automatically transfer
          ERC20 tokens and other account-linked crypto assets, if you have any
          of them you must manually export & import the HyperMask private key.
        </div>
      </div>

      <div className="block">
        <div>
          <label>
            <input
              type="checkbox"
              checked={!!localStorage.requireIdentityApproval}
              onChange={e => {
                localStorage.requireIdentityApproval = e.target.checked
                  ? "true"
                  : "";
                app.setState({});
              }}
            />
            Require approval before sharing identity with decentralized apps
          </label>
        </div>
        <div className="caveat">
          By default, the public account address for your HyperMask Ethereum
          wallet is automatically to any decentralized app. This is the same
          behavior of the MetaMask browser extension, but this means that any
          website can read your pseudonymous transaction history and account
          balance. If this box is checked, HyperMask shares no information with
          apps until you explicitly agree to.
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={!!localStorage.disableAnalytics}
              onChange={e => {
                localStorage.disableAnalytics = e.target.checked ? "true" : "";
                app.setState({});
              }}
            />
            Disable Google Analytics
          </label>
        </div>
        <div className="caveat">
          By default, Google Analytics is used to collect anonymous usage
          information about HyperMask. If this box is checked, HyperMask will
          not report any analytics information.
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
