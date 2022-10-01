// function f() {
//     console.log(4 + 6)
// }

const { network } = require("hardhat")
require("dotenv").config()

// module.exports.default = f

const { networkConfig, localChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress =
    //     networkConfig[chainId]["ethUsdPriceFeedAddress"]

    let ethUsdPriceFeedAddress

    if (localChains.includes(network.name)) {
        // now we are on local chain so we want recent deployment of mock
        // because it is deployed before
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = mockV3Aggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("FundMe is deployed successfully !")
    log("*********************************************")

    if (!localChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        //log(fundMe.address, args)
        await verify(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
