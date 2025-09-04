const { ethers } = require('ethers');
const erc20Abi = require('../utils/abis/erc20.json');

function provider() {
  return new ethers.providers.JsonRpcProvider(process.env.BSC_RPC);
}

const createWallet = async () => {
  const w = ethers.Wallet.createRandom();
  return { address: w.address, privateKey: w.privateKey, mnemonic: w.mnemonic?.phrase || null };
}

async function importFromMnemonic(mnemonic, path = "m/44'/60'/0'/0/0") {
  const w = ethers.Wallet.fromMnemonic(mnemonic, path);
  return { address: w.address, privateKey: w.privateKey, mnemonic };
}

async function importFromPrivateKey(privateKey) {
  // Ensure private key starts with "0x"
  const normalizedKey = privateKey.startsWith('0x')
    ? privateKey
    : '0x' + privateKey;

  const wallet = new ethers.Wallet(normalizedKey);

  console.log("Importing PrivateKey:", privateKey);
console.log("Derived Address:", wallet.address);

  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

const erc20Decimals = async (token) => {
  const p = provider();
  const c = new ethers.Contract(token, erc20Abi, p);
  return await c.decimals();
}

const balanceOf = async (token, address) => {
  const p = provider();
  const c = new ethers.Contract(token, erc20Abi, p);
  const bal = await c.balanceOf(address);
  const decimals = await c.decimals();
  return { raw: bal.toString(), decimals, formatted: ethers.utils.formatUnits(bal, decimals) };
}

const sendToken = async (privateKey, tokenAddress, to, amountDecimal) => {
  const p = provider();
  const w = new ethers.Wallet(privateKey, p);
  const c = new ethers.Contract(tokenAddress, erc20Abi, w);
  const decimals = await c.decimals();
  const amount = ethers.utils.parseUnits(amountDecimal.toString(), decimals);
  const tx = await c.transfer(to, amount);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash, receipt };
}

module.exports = {
  provider,
  createWallet,
  importFromMnemonic,
  importFromPrivateKey,
  erc20Decimals,
  balanceOf,
  sendToken
};
