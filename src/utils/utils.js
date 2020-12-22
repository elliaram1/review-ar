import Arweave from "arweave/web";
import axios from "axios";

const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  timeout: 20000,
  logging: false,
});

const createTransaction = async (data, wallet) => {
  let transaction = await arweave.createTransaction({ data }, wallet);
  return transaction;
};

const signAndDeployTransaction = async (transaction, wallet) => {
  await arweave.transactions.sign(transaction, wallet);
  const response = await arweave.transactions.post(transaction);
  return response;
};

const getAddressAndBalance = async (wallet) => {
  const address = await arweave.wallets.jwkToAddress(wallet);
  const rawBalance = await arweave.wallets.getBalance(address);
  const balance = await arweave.ar.winstonToAr(rawBalance);
  return { address, balance };
};

const getTransaction = async (id) => {
  const transaction = await arweave.transactions.get(id);
  return transaction;
};

const getDataByArql = async (arql) => {
  const txids = await arweave.arql(arql);
  console.log({ txids });
  const data = await Promise.all(
    txids.flatMap(async (id) => {
      const txData = await axios.get(`https://arweave.net/tx/${id}/data`);
      if (txData.data !== "pending") {
        const transaction = await getTransaction(id);
        transaction.data = txData.data;
        const data = transaction.get("data", {
          decode: true,
          string: true,
        });
        return JSON.parse(data);
      } else {
        return [];
      }
    })
  );
  return data;
};

const renderAddress = (
  address = "UUUw1bnLnVH0yqrH1hweCzswduJGsPLFCmCfaOVUAHw"
) => {
  return address ? address.slice(0, 4) + "......" + address.slice(-4) : "";
};

export {
  createTransaction,
  signAndDeployTransaction,
  getAddressAndBalance,
  getTransaction,
  getDataByArql,
  renderAddress,
};
