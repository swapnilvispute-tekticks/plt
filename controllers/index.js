const main = async (req, res) => {
  try {
    if(!req.body || !req.body.sku) throw new Error('Validation for sku failed')
    const sku = req.body.sku;
    const stockData = await getInitialStocks(sku);
    const availableUnits = await calculateAvailableUnits(stockData[0], sku);
    return res.status(200).send({
      status: 200,
      message: "Data fetched successfully",
      data: availableUnits 
    });
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: err.message || "Something went wrong",
      data: {},
    });
  }
};

const getInitialStocks = async (sku) => {
  const fs = require("fs");
  const path = require("path");
  const stocksFilePath = require("./../constants").stocks;
  console.log('stocksFilePath', stocksFilePath);
  if (fs.existsSync(path.normalize(stocksFilePath))) {
    const allStocks = require(stocksFilePath);
    if (allStocks && allStocks.length > 0) {
      const stocks = allStocks.filter((stock) => {
        return stock.sku === sku;
      });
      if(stocks.length == 0) throw new Error('Provided sku does not present in stocks')
      return stocks;
    } else {
      throw new Error("Stock file is not reachable or empty");
    }
  } else {
    throw new Error("Stocks file does not exist");
  }
};

const getStockTransactions = async (sku) => {
  const fs = require("fs");
  const path = require("path");
  const transactionsFilePath = require("./../constants").transactions;
  if (fs.existsSync(path.normalize(transactionsFilePath))) {
    const allTransactions = require("./../transactions.json");
    if (allTransactions && allTransactions.length > 0) {
      const transactions = allTransactions.filter((transaction) => {
        return transaction.sku === sku;
      });
      return transactions;
    } else {
      return [];
    }
  } else {
    throw new Error("Transaction file does not exist");
  }
};

const calculateAvailableUnits = async (stocks,sku) => {
  const transactions = await getStockTransactions(sku);
  let units = 0;
  transactions.map((transaction)=> {
    if(transaction.qty && transaction.type && transaction.type == 'order') {
        units = units + transaction.qty
    }
    if(transaction.qty && transaction.type && transaction.type == 'refund') {
        units = units - transaction.qty
    }
  })
  const availableUnits = stocks.stock - units;
  return {
    intialStockCount:stocks.stock,
    availableUnits: availableUnits
  }
};
module.exports.main = main;
