pragma solidity ^0.4.18;

contract CutdownTokenInterface {
	//ERC20
  	function balanceOf(address who) public view returns (uint256);
  	function transfer(address to, uint256 value) public returns (bool);
}
