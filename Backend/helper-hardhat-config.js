const networkConfig = {
    31337: {
        name: "localhost",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
}
const localChains = ["hardhat", "localhost"]

const DECIMALS = 8
const INITIAL_ANSWER = 130000000000 // because of 8 decimals we have attached 8 0's after 1300 which is current price of eth in usd

module.exports = {
    networkConfig,
    localChains,
    DECIMALS,
    INITIAL_ANSWER,
}
