const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')


require('chai')
	.use(require('chai-as-promised'))
	.should()

//function that converts Ether to Wei
function tokens(n){
	return web3.utils.toWei(n,'ether')
}


contract('TokenFarm', ([owner, investor]) => {

	let daiToken, dappToken, tokenFarm

	//before statement that runs first
	before(async () => {
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

	//transfer all dappToken to the token farm
	await dappToken.transfer(tokenFarm.address, tokens('1000000'))

	//transfer token to the investor
	await daiToken.transfer(investor, tokens('100'), {from:owner})
})

	//for the Mock Dai token deployment
	describe('Mock DAI deployment', async () => {
		it('has a name', async() => {
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('Dapp Token deployment', async() =>{
		it('has a name', async()=> {
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})

	describe("Token Farm deployment", async() =>{
		it('has a name', async()=>{
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp Token Farm')
		})

		it('contract has tokens', async ()=> {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe('Farming tokens', async()=> {
		it('rewards investors for staking mDai tokens', async () => {
			let result

			//check investor balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'),"investor mock DAI wallet balance incorrect before staking")

			//stake mock DAI tokens
			//spender argument is the token farm address
			await daiToken.approve(tokenFarm.address, tokens('100'), {from:investor})
			await tokenFarm.stakeTokens(tokens('100'), {from :investor})

			//result after staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor MockDAI wallet balance is incorrect after staking')

			//check that balance for the token Farm is correct
			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Token Farm MockDAI balance is incorrect after staking')

			//check that investor staking balance is correct
			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investor staking balance is correct after staking')

			//test that investor is currently staking
			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'Investor staking status is true after staking')

			//test for issuing tokens

			//issue tokens
			await tokenFarm.issueTokens({from: owner})
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'),'investor Dapp token balance incorrect after issuance')
			//ensure only owner can issue tokens

			await tokenFarm.issueTokens({ from :investor}).should.be.rejected;

			//unstake tokens
			await tokenFarm.unstakeTokens({ from : investor})

			//unstake the tokens
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), "Token Farm Mock DAI balance correct after staking")

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

			//investor is no longer staking
			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
		})
	})


})