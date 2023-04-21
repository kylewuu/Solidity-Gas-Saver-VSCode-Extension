// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GlobalVariablePacking {

    bytes16 var3;
    uint128 var1;
    bool var6;
    uint88 var7;
    uint128 var2;
    address var5;
    uint128 var4;
    


    function setVariables1and2() public {
        var1 = 1;
        var2 = 1;
    }

    function setVariables3and4() public {
        var3 = "0";
        var4 = 1;
    }

    function setVariables5and6and7() public {
        var5 = msg.sender;
        bool opposite = !var6;
        var6 = opposite;
        var7 = 1;
    }




}
