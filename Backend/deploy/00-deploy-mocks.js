const { network } = require("hardhat")
const {
    localChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(deployer)
    //const chainId = network.config.chainId

    if (localChains.includes(network.name)) {
        log("You are on local network named => ", network.name)
        log("Deploying mocks ...")

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        // log(deployer)
        // log(mockV3Aggregator.address)

        log("MockV3Aggregator is deployed successfully !")
        log("*********************************************")
    }
}

module.exports.tags = ["all", "mocks"]
