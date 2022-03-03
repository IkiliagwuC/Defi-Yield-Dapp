const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")

module.exports = async function(deployer, network, accounts) {
  //deploy Mock DAI token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  //deploy Dapp Token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  //deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  //transfer all Dapp tokens to TokenFarm(1 million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  //transfer 100 Mock DAI to the investor
  await daiToken.transfer(accounts[1], '10000000000000000000000')

}





