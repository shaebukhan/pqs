
const axios = require('axios');
const crypto = require('crypto');
const ChainData = require('./ChainData');

function generateSign(apiKey, params) {
    // Step 1: Remove 'sign' and parameters with null or empty values
    const filteredParams = Object.entries(params).filter(
        ([key, value]) => key !== 'sign' && value !== null && value !== ''
    );

    // Step 2: Sort the remaining parameters lexicographically by their keys
    const sortedParams = filteredParams.sort(([keyA], [keyB]) =>
        keyA.localeCompare(keyB)
    );

    // Step 3: Concatenate the sorted parameters in the format key1value1key2value2...
    const concatenatedString = sortedParams
        .map(([key, value]) => `${key}${value}`)
        .join('');

    // Step 4: Prepend the API Key to the concatenated string
    const stringToHash = apiKey + concatenatedString;

    // Step 5: Compute the MD5 hash of the resulting string and convert to lowercase
    const sign = crypto.createHash('md5').update(stringToHash).digest('hex').toLowerCase();

    return sign;
}

const getWalletTransactions = async () => {
    try {
        const options = {
            method: 'GET',
            url: `https://api.tatum.io/v3/tron/transaction/account/TMgu9qhJbynffgt3TWgcSyDiLsEiVhGx46`,
            headers: {
                accept: 'application/json',
                'x-api-key': "t-679b64a51db825b185ad210b-82a1dd12f0654d3987a90024"
            }
        };

        const response = await axios.request(options);
        console.log(response.data);
        return response.data;

    } catch (error) {
        console.error(`Error fetching  xrp wallet data:`, error);
        throw new Error(`Failed to fetch  xrp wallet data: ${error.message}`);
    }
};

const getChainIdForAsset = (asset) => {
    const assetData = ChainData.find((item) => item.name.toLowerCase().includes(asset.toLowerCase()));
    return assetData ? assetData.chain_id : null;
};
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
module.exports = {

    getWalletTransactions, generateSign, getChainIdForAsset
    , generateRandomString
};