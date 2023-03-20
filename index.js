const csv = require('csv-parser');
const fs = require('fs');
const { FILE_NAME, TRANSACTION_TYPE } = require('./constants');
const fetchPrices = require('./api');

async function calculatePortfolio(token) {
    try {
        const isValidToken = ['BTC', 'ETH', 'XRP'].includes(token);
        if (!token || !isValidToken) {
            console.log('Please enter valid token!!');
            return;
        }
        const portfolioValue = await new Promise((resolve) => {
            let depositTotal = 0;
            let withdrawalTotal = 0;
            fs.createReadStream(FILE_NAME)
                .pipe(csv())
                .on('data', (row) => {
                    if (row.token === token) {
                        if (row.transaction_type === TRANSACTION_TYPE.DEPOSIT) {
                            depositTotal += parseFloat(row.amount);
                        } else if (row.transaction_type === TRANSACTION_TYPE.WITHDRAWAL) {
                            withdrawalTotal += parseFloat(row.amount);
                        }
                    }
                })
                .on('end', () => {
                    resolve(depositTotal - withdrawalTotal);
                });
        });

        const price = await fetchPrices(token);
        const usdValue = portfolioValue * price;
        console.log(`Portfolio value for ${token}: $${usdValue.toFixed(2)} USD`);
    } catch (e) {
        console.log('Internal error occured: ', e);
    }
}

async function calculateTotalPortfolio() {
    try {
        const portfolioValues = {};
        await new Promise((resolve) => {
            fs.createReadStream(FILE_NAME)
                .pipe(csv())
                .on('data', (row) => {
                    if (!portfolioValues[row.token]) {
                        portfolioValues[row.token] = {
                            depositTotal: 0,
                            withdrawalTotal: 0
                        };
                    }
                    if (row.transaction_type === TRANSACTION_TYPE.DEPOSIT) {
                        portfolioValues[row.token].depositTotal += parseFloat(row.amount);
                    } else if (row.transaction_type === TRANSACTION_TYPE.WITHDRAWAL) {
                        portfolioValues[row.token].withdrawalTotal += parseFloat(row.amount);
                    }
                })
                .on('end', () => {
                    resolve();
                });
        });
        const tokenSymbols = Object.keys(portfolioValues);
        for (const symbol of tokenSymbols) {
            const { depositTotal, withdrawalTotal } = portfolioValues[symbol];
            const price = await fetchPrices(symbol);
            const usdValue = (depositTotal - withdrawalTotal) * price;
            console.log(`Portfolio value for ${symbol}: $${usdValue.toFixed(2)} USD`);
        }
    } catch (e) {
        console.log('Internal error occured: ', e);
    }
}

async function calculatePortfolioByDate(date) {
    try {
        if (!date || isNaN(Date.parse(date))) {
            console.log('Please enter valid date!!');
            return;
        }
        const portfolioValues = {};
        await new Promise((resolve) => {
            fs.createReadStream(FILE_NAME)
                .pipe(csv())
                .on('data', (row) => {
                    const transactionDate = new Date(row.timestamp * 1000);
                    const transactionDateString = transactionDate.toISOString().substr(0, 10);
                    if (transactionDateString === date) {
                        if (!portfolioValues[row.token]) {
                            portfolioValues[row.token] = {
                                depositTotal: 0,
                                withdrawalTotal: 0
                            };
                        }
                        if (row.transaction_type === TRANSACTION_TYPE.DEPOSIT) {
                            portfolioValues[row.token].depositTotal += parseFloat(row.amount);
                        } else if (row.transaction_type === TRANSACTION_TYPE.WITHDRAWAL) {
                            portfolioValues[row.token].withdrawalTotal += parseFloat(row.amount);
                        }
                    }
                })
                .on('end', () => {
                    resolve();
                });
        });
        const tokenSymbols = Object.keys(portfolioValues);
        for (const symbol of tokenSymbols) {
            const { depositTotal, withdrawalTotal } = portfolioValues[symbol];
            const price = await fetchPrices(symbol);
            const usdValue = (depositTotal - withdrawalTotal) * price;
            console.log(`Portfolio value for ${symbol} on ${date}: $${usdValue.toFixed(2)} USD`);
        }
    } catch (e) {
        console.log('Internal error occured: ', e);
    }
}


async function getPortfolioValue(token, date) {
    try {
        if (!date || isNaN(Date.parse(date))) {
            console.log('Please enter valid date!!');
            return;
        }

        const isValidToken = ['BTC', 'ETH', 'XRP'].includes(token);
        if (!token || !isValidToken) {
            console.log('Please enter valid token!!');
            return;
        }

        const price = await fetchPrices(token);
        const tokenTransactions = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(FILE_NAME)
                .pipe(csv())
                .on('data', (row) => {
                    if (row.token === token) {
                        const transactionDate = new Date(parseInt(row.timestamp) * 1000);
                        const transactionDateString = transactionDate.toISOString().substr(0, 10);
                        if (transactionDateString === date) {
                            tokenTransactions.push(row);
                        }
                    }
                })
                .on('end', () => {
                    const depositValue = tokenTransactions
                        .filter((row) => row.transaction_type === TRANSACTION_TYPE.DEPOSIT)
                        .reduce((acc, row) => acc + parseFloat(row.amount), 0);
                    const withdrawalValue = tokenTransactions
                        .filter((row) => row.transaction_type === TRANSACTION_TYPE.WITHDRAWAL)
                        .reduce((acc, row) => acc - parseFloat(row.amount), 0);
                    const portfolioValue = (depositValue + withdrawalValue) * price;
                    console.log(`Portfolio value of ETH on 2019-10-25: $${portfolioValue.toFixed(2)}`)
                    resolve(portfolioValue);
                })
                .on('error', reject)
         

        });
    } catch (e) {
        console.log('Internal error occured: ', e);
    }
}


/* Given no parameters, return the latest portfolio value per token in USD
Ans :- Run this function 'calculateTotalPortfolio();' */

/* Given a token, return the latest portfolio value for that token in USD
Ans :- Run this function and pass token of type string as input 'calculatePortfolio('ETH');' /*

/* Given a date, return the portfolio value per token in USD on that date
Ans :- Run this function and pass date of type string as input 'calculatePortfolioByDate('2019-10-23');' */

/* Given a date and a token, return the portfolio value of that token in USD on that date
Ans :- Run this function and pass token and date, both are of string types 'getPortfolioValue('ETH', '2019-10-25'); */

/* To run any function, just call the function and go to command line and type 'node index.js' and press enter */




