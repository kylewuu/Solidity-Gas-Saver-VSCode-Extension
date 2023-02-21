// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GlobalVariablePacking {
    // Each storage slot is of size 32 bytes = 256 bits
    // If the next variable cannot fit into the last slot, the variable is stored in a new slot
    // In the example below, variable `b` cannot be packed into the same slot as `a`, and therefore must be stored in a new storage slot.
    // Three storage slots are used for the three variables
    uint128 public a;
    uint256 public b;
    uint128 public c;

    // Optimized version. This layout only utilizes two storage slots, since 16 byte `a` and 16 byte `c` are packed in the same 32 byte slot.
    // uint128 public a;
    // uint128 public c;
    // uint128 public functionAVariable;
    // uint256 public b;

    // Function to change the three variable values
    // Changing the values of the optimized version uses less gas
    function changeVariableValues(
        uint128 _a,
        uint256 _b,
        uint128 _c
    ) public {
        a = _a;
        b = _b;
        c = _c;
    }
}

// // won't get switched cause it's just one
// uint128 public a;

// // won't get switched cause it has weird stuff in front
// function foo(uint128 a);
// function bar(uint128 b);

// // won't get switched around since the lines don't follow each other
// function something() {
//     uint128 public c;
//     if () {
//     }
//     uint256 public b;
// }

// // would get switched around since it's multiple instances of variables in succession
// function test() {
//     uint128 public a;
//     uint128 public c;
//     uint256 public b;
// }

// var types = ["uint128", "uint256"];
// var scopes = ["public", "private"];
// string a = "uint128 public a";
// var aArray = a.split(" ");
// var lines = [];

// if (types.includes(aArray[0]) && scopes.includes(aArray[1])) {
//     // line a is indeed a variable declaration
//     lines.push(a);
// }
