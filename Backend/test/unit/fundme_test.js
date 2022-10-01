const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { localChains } = require("../../helper-hardhat-config")

!localChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe, deployer, mockV3Aggregator
          const sendVal = ethers.utils.parseEther("1")
          beforeEach(async function () {
              // To have different accounts(it will pull from accounts from hardhat config file)

              // const accounts = ethers.getSigners()
              // const accountZero = accounts[0]

              // as we will make transaction with fundMe so attach a account with it
              deployer = (await getNamedAccounts()).deployer

              // deploy everything with just one line of code with deployments.fixutre with allows us to run the folder
              // using "tags" as we used in deploy folder

              await deployments.fixture(["all"])

              // as the above line deploys everthing now we just need to get the recent deployments of our contracts
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          // for constructor
          describe("constructor", async function () {
              it("Sets aggregator address correctly", async function () {
                  const res = await fundMe.priceFeed()
                  assert.equal(mockV3Aggregator.address, res)
              })
          })

          // for fund funciton
          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("Updates amountFunded data structure", async function () {
                  await fundMe.fund({ value: sendVal })
                  const res = await fundMe.addressToAmountFunded(deployer)
                  assert.equal(res.toString(), sendVal.toString())
              })

              it("funders array contains deployer", async function () {
                  await fundMe.fund({ value: sendVal })
                  const funder = await fundMe.funders(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendVal })
              })

              it("withdraw ETH from single deployer", async function () {
                  // -> Arrange
                  // See what are the initial balances of FundMe Contract and deployer(owenr)

                  const contractInitialBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const deployerInitialBalance =
                      await fundMe.provider.getBalance(deployer)

                  // -> Act
                  const txRes = await fundMe.withdraw()
                  const txRec = await txRes.wait(1) // it contains gasUsed, effectiveGasPrice

                  const { gasUsed, effectiveGasPrice } = txRec
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const contractEndBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const deployerEndBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Assert
                  // look how we add gas cost to deployerBalance as we know that it has to spend some gas for doing transacion
                  assert.equal(contractEndBalance, 0)
                  assert.equal(
                      contractInitialBalance
                          .add(deployerInitialBalance)
                          .toString(),
                      deployerEndBalance.add(gasCost).toString()
                  )
              })

              it("Fund with multiple accounts and withdraw from the deployer account", async function () {
                  // -> Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )

                      await fundMeConnectedContract.fund({ value: sendVal })
                  }

                  // See what are the initial balances of FundMe Contract and deployer(owenr)

                  const contractInitialBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const deployerInitialBalance =
                      await fundMe.provider.getBalance(deployer)

                  // -> Act
                  const txRes = await fundMe.withdraw()
                  const txRec = await txRes.wait(1) // it contains gasUsed, effectiveGasPrice

                  const { gasUsed, effectiveGasPrice } = txRec
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const contractEndBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const deployerEndBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Assert
                  // look how we add gas cost to deployerBalance as we know that it has to spend some gas for doing transacion
                  assert.equal(contractEndBalance, 0)
                  assert.equal(
                      contractInitialBalance
                          .add(deployerInitialBalance)
                          .toString(),
                      deployerEndBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.funders(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted
              })
          })
      })
