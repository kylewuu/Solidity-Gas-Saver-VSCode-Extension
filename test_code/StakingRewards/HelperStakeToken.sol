pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract StakeToken is ERC20{
    constructor() ERC20("Gold", "GLD") public {
        _mint(msg.sender, 100e8);
    }
}