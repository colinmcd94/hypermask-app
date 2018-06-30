export const PRICE_VOLATILITY_BUFFER = 1.01;

export const HYPERMASK_DEV_ADDRESS =
  "0x658AC8Dab114EE16Fba37f3c18Ad734a3542bF63";

export const WALLET_PASSWORD =
  "Security through obscurity is my favorite type of insecurity.";

export const CHAINS = [
  {
    name: "Ethereum Main Network",
    slug: "mainnet",
    id: "1",
    explore: "https://etherscan.io/address/",
    token_explore: "https://etherscan.io/token/",
    rpc: "https://mainnet.infura.io/Dpsk5u62HN582LMDXeFr"
  },
  {
    name: "Ropsten Test Network",
    slug: "ropsten",
    id: "3",
    explore: "https://ropsten.etherscan.io/address/",
    token_explore: "https://ropsten.etherscan.io/token/",
    rpc: "https://ropsten.infura.io/Dpsk5u62HN582LMDXeFr"
  },
  {
    name: "Rinkeby Test Network",
    slug: "rinkeby",
    id: "4",
    explore: "https://rinkeby.etherscan.io/address/",
    token_explore: "https://rinkeby.etherscan.io/token/",
    rpc: "https://rinkeby.infura.io/Dpsk5u62HN582LMDXeFr"
  },
  {
    name: "Kovan Test Network",
    slug: "kovan",
    id: "42",
    explore: "https://kovan.etherscan.io/address/",
    token_explore: "https://kovan.etherscan.io/token/",
    rpc: "https://kovan.infura.io/Dpsk5u62HN582LMDXeFr"
  },
  {
    name: "INFURAnet Test Network",
    slug: "infuranet",
    id: "5810",
    explore: "https://explorer.infuranet.io/account/",
    rpc: "https://infuranet.infura.io/Dpsk5u62HN582LMDXeFr"
  }
];

export const ERC20ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "success", type: "bool" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transferFrom",
    outputs: [{ name: "success", type: "bool" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "version",
    outputs: [{ name: "", type: "string" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "success", type: "bool" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
      { name: "_extraData", type: "bytes" }
    ],
    name: "approveAndCall",
    outputs: [{ name: "success", type: "bool" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    type: "function"
  },
  {
    inputs: [
      { name: "_initialAmount", type: "uint256" },
      { name: "_tokenName", type: "string" },
      { name: "_decimalUnits", type: "uint8" },
      { name: "_tokenSymbol", type: "string" }
    ],
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_from", type: "address" },
      { indexed: true, name: "_to", type: "address" },
      { indexed: false, name: "_value", type: "uint256" }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_owner", type: "address" },
      { indexed: true, name: "_spender", type: "address" },
      { indexed: false, name: "_value", type: "uint256" }
    ],
    name: "Approval",
    type: "event"
  }
];
