const cryptoOptions = [
    {
        value: 'BTC',
        label: 'Bitcoin',
        flag: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
        networks: ['Bitcoin']
    },
    {
        value: 'ETH',
        label: 'Ethereum',
        flag: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
        networks: ['Ethereum']
    },
    {
        value: 'USDT',
        label: 'Tether',
        flag: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
        networks: [
            'Ethereum (ERC20)',
            'Binance Smart Chain (BEP20)',
            'Tron (TRC20)',
            'Solana (SPL)',
            'Polygon (MATIC)',
            'Arbitrum',
            'Avalanche (C-Chain)'
        ]
    },
    {
        value: 'BNB',
        label: 'Binance Coin',
        flag: 'https://assets.coingecko.com/coins/images/825/thumb/binance-coin-logo.png',
        networks: ['Binance Chain (BEP2)', 'Binance Smart Chain (BEP20)']
    },
    {
        value: 'USDC',
        label: 'USD Coin',
        flag: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
        networks: [
            'Ethereum (ERC20)',
            'Binance Smart Chain (BEP20)',
            'Polygon (MATIC)',
            'Arbitrum',
            'Avalanche (C-Chain)',
            'Solana (SPL)',
            'Tron (TRC20)',
            'Stellar'
        ]
    },
    {
        value: 'XRP',
        label: 'Ripple',
        flag: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png',
        networks: ['Ripple']
    },
    {
        value: 'ADA',
        label: 'Cardano',
        flag: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png',
        networks: ['Cardano (Mainnet)']
    },
    {
        value: 'SOL',
        label: 'Solana',
        flag: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
        networks: ['Solana (SPL)']
    },
    {
        value: 'DOGE',
        label: 'Dogecoin',
        flag: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png',
        networks: ['Dogecoin']
    },
    {
        value: 'MATIC',
        label: 'Polygon',
        flag: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png',
        networks: [
            'Polygon (MATIC)',
            'Ethereum (ERC20)',
            'Binance Smart Chain (BEP20)',
            'Avalanche (C-Chain)'
        ]
    }
];

export default cryptoOptions;