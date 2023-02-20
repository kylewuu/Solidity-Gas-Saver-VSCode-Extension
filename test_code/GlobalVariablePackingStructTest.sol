// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

contract GlobalVariablePackingStruct{

    // Each storage slot is of size 32 bytes = 256 bits
    // If the next variable cannot fit into the last slot, the variable is stored in a new slot


    // Unoptimized struct. Variable `b_unop` cannot be packed into the same slot as `a_unop`, and therefore must be stored in a new storage slot.
    // Three storage slots are used for the three variables
    struct UnoptimizedStruct{
        uint128 a_unop;
        uint256 b_unop;
        uint128 c_unop;
    }


    // Optimized struct. This layout only uses two storage slots, since 16 byte `a_op` and 16 byte `c_op` are packed in the same 32 byte slot.
    struct OptimizedStruct{
        uint128 a_op;
        uint128 c_op;
        uint256 b_op;
    }

    // Create an unoptimized struct
    UnoptimizedStruct unoptimized;
    // Create an optimized struct
    OptimizedStruct optimized;

    // Function to change values in the unoptimized struct, using more gas
    function changeUnoptimiztedStruct(uint128 _a, uint256 _b, uint128 _c) public {
        UnoptimizedStruct memory tempStruct = UnoptimizedStruct(_a, _b, _c);
        unoptimized = tempStruct;
    }

    // Function to change values in the optimized struct, using less gas
    function changeOptimiztedStruct(uint128 _a, uint256 _b, uint128 _c) public {
        OptimizedStruct memory tempStruct = OptimizedStruct(_a, _c, _b);
        optimized = tempStruct;
    }
}
