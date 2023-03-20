const { WEBSITE_LINK } = require('./constants');
const axios = require('axios');

const fetchPrices = async (symbol) => {
    try {
        const response = await axios.get(WEBSITE_LINK, {
            params: {
                fsym: symbol,
                tsyms: 'USD',
                api_key: process.env.API_KEY
            }
        });
        return response.data.USD;
    } catch (e) {
        console.log('API error occured: ', e)
    }
}

module.exports = fetchPrices;