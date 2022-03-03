pragma solidity ^0.5.0;


import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
	//all code goes here

	string public name = "Dapp Token Farm";
	DappToken public dappToken;
	DaiToken public daiToken;
	address public owner;

	mapping(address => uint )public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;
	address[] public stakers;
	
	constructor(DappToken _dappToken, DaiToken _daiToken) public{
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender;

	}

	//stake tokens ; deposit DAI to receive rewards
	function stakeTokens(uint _amount) public{

		//require amount greater than 0;
		require(_amount > 0, "amount cannot be 0");

		//transfer mock dai token to the contract for staking
		daiToken.transferFrom(msg.sender, address(this), _amount);

		//update staking balance
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		//add users to stakers array if they haven't staked already
		if(!hasStaked[msg.sender]){
			stakers.push(msg.sender);
		}

		//update staking status by address
		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;


	}

	//Unstaking tokens (withdrawal)

	function unstakeTokens() public{
		//fetch token balance
		uint balance = stakingBalance[msg.sender];

		//require amount greater than 0
		require(balance > 0, "staking balance cannot be 0");

		//transfer Mock Dai tokens to this contract for staking
		daiToken.transfer(msg.sender, balance);

		//reset the staking balance after withdrawal
		stakingBalance[msg.sender] = 0;

		//reset staking status
		isStaking[msg.sender] = false;
	}



	//2.Issuing tokens; recieve rewards/earn interest
	function issueTokens() public{
		//only owner can call issuer function
		require(msg.sender == owner, "issuer of tokens must be the owner");

		//issue tokens
		for(uint i = 0 ; i <stakers.length ; i++){
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];
			//only reward user if they are currently staking
			if(balance > 0){
				//for x Dai you get x Dapp token rewards
				dappToken.transfer(recipient, balance);
			}
			
		}
	}

	

}