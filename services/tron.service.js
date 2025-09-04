const TronWeb = require('tronweb');

function getTron(privateKey = null) {
  return new TronWeb(
    process.env.TRON_FULL_NODE,
    process.env.TRON_SOLIDITY_NODE,
    process.env.TRON_EVENT_SERVER,
    privateKey || undefined
  );
}

const createWallet = async () => {
  const acc = TronWeb.utils.accounts.generateAccount();
  return {
    address: acc.address.base58,  // public Tron address
    publicKey: acc.publicKey,     // hex public key
    privateKey: acc.privateKey    // private key (encrypt before saving)
  };
}

async function importFromPrivateKey(pk) {
  const tronWeb = getTron();
  const addressBase58 = tronWeb.address.fromPrivateKey(pk);
  return { privateKey: pk, addressBase58 };
}

const tokenDecimals = async (contractAddress) => {
  const tronWeb = getTron();
  const c = await tronWeb.contract().at(contractAddress);
  const d = await c.decimals().call();
  return Number(d);
}

const balanceOf = async (contractAddress, addressBase58) => {
  const tronWeb = getTron();
  const c = await tronWeb.contract().at(contractAddress);
  const bal = await c.balanceOf(addressBase58).call();
  let decimals = 18;
  try { decimals = Number(await c.decimals().call()); } catch (_) {}
  // bal is BN-like; convert to string
  const raw = (bal?.toString && bal.toString()) || String(bal);
  return { raw, decimals };
}

const sendToken = async (privateKey, contractAddress, toAddress, amountDecimal) => {
  const tronWeb = getTron(privateKey);
  const c = await tronWeb.contract().at(contractAddress);

  // decimals (fallback 18)
  let decimals = 18;
  try { decimals = Number(await c.decimals().call()); } catch (_) {}

  const factor = tronWeb.toBigNumber(10).pow(decimals);
  const amount = tronWeb.toBigNumber(amountDecimal).times(factor).toString(10);

  const tx = await tronWeb.transactionBuilder.triggerSmartContract(
    contractAddress,
    'transfer(address,uint256)',
    {},
    [
      { type: 'address', value: toAddress },
      { type: 'uint256', value: amount }
    ],
    tronWeb.address.toHex(tronWeb.defaultAddress.base58)
  );

  if (!tx.result || !tx.result.result) {
    throw new Error('triggerSmartContract failed: ' + JSON.stringify(tx));
  }

  const signed = await tronWeb.trx.sign(tx.transaction);
  const sent = await tronWeb.trx.sendRawTransaction(signed);
  // sent = { result: true, txid: '...' }
  return { txHash: sent.txid || signed.txID, raw: sent };
}

module.exports = {
  getTron,
  createWallet,
  importFromPrivateKey,
  tokenDecimals,
  balanceOf,
  sendToken
};
