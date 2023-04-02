# Solidty Gas Saver

Welcome! The Solidity Gas Saver is a VSCode extension that was developed to give you some options for refactoring your Solidity code with variable packing. There are many approaches to variable packing, and choosing the best algorithm depends on the context, as they all have their strengths and weaknesses. We have listed them all out and have conducted evaluations with them on various smart contracts. Read through our findings and then decide which one will be best for your situation!

## Strategies
The commands in bracket is the command to use in VSCode

1. Bin packing: First fit (Pack Variable First Fit)
2. Bin packing: Best fit (Pack Variable Best Fit)
3. Packing by order of use in functions (Pack Variable By Use)
4. Grouped by function call frequency (Pack Variable By Function)
5. Grouped by functions from user input (Pack Variable By User Input Function)

## Strategy Explanations

### 1. Bin packing: First fit
First fit algorithm follows the first-fit bin packing strategy to packing the state variables into bins of 256 bits. For more information, please check out [this wiki](https://en.wikipedia.org/wiki/First-fit_bin_packing#:~:text=First%2Dfit%20(FF)%20is,is%20at%20most%20the%20capacity.) on the algorithm

### 2. Bin packing: Best fit
Best fit algorithm follows the best-fit bin packing strategy where each bin is 256 bits. While still the classic bin packing approach, it will prioritize wasting as little space in each bin as possible. For more information, please read about it [here](https://en.wikipedia.org/wiki/Best-fit_bin_packing#:~:text=Best%2Dfit%20is%20an%20online,is%20at%20most%20the%20capacity.)

### 3. Packing by order of use in functions
The functions defined in the contract can use state variables. This strategy will take the order of the functions as defined in the contracts, and reorder the state variables as how they appear to be used in the functions. For each function group of state variables, it will use best fit bin packing. For example:
```
uint a;
uint b;
uint c;

function foo() {
  uint fooLocalVariable = b;
  // ... do smthn else
}

function baz() {
  a = c;
}

// State variables will get reordered to:
uint b;
uint a;
uint c;
// b was seen first in foo(), a and c were seen afterwards in baz()
```

If state variables are not used in any functions then they will be placed into the end of the list.

### 4. Grouped by function call frequency
Some functions in the contract may call other functions. This can create a tree of dependencies. For example:
```
function A() {}
function B() { A() }
function C() { B() }
```
Every time `C()` is called, `B()` then `A()` is always called. From this intuition, we can give each function a score. If a function has a high degree of dependency, then it will get a higher score. The lower the dependency, the lower the score. In our example, `A` would have the highest score, while `C` would have the lowest score. Afterwards, the state variables used in each function will be ordered and grouped together by their respective function ranks. If a state variable appears in multiple functions, then the higher ranked function will be prioritized. For each function group of variables, they will be packed using best fit strategy.

### 5. Grouped by functions from user input
Sometimes the users will call functions from outside of the contract, or the developer has insight into which function will be most frequently called by users. This strategy allows developers to choose their own order of functions to pack by. Think of this strategy as strategy 4, but instead of automatically calculating the score for each function, the order is given by the user. The function names inputted in the beginning of the list will be prioritized. If a function was not inputted by the user, then it will go after all of the user inputted functions, and will follow strategy 4. Variables for each function group will be packed using best fit.

## How to run the extension
In VScode, open up the window to run a command. For windows, it's `F1` by default. Then enter any of the 5 commands listed above in [Strategies](#strategies). The extension will modify the code but will not save it automatically.

## Assumptions

- All state variables must be defined at the beginning of the contract, they should not be scattered in between function definitions, or between any other types of state variables other than the primitive types. For example, `mapping(address => uint256) private _balances;` will not be counted as a state variable to pack as the size is unknown, and every state variable that is intended to be packed should be all placed before any of these mapping variables. If this does not make sense, please check out the section on [How variables are being detected in the contracts](#how-variables-are-being-detected-in-the-contracts)
- Only one contract per file
- Each contract is independent and will not pull functions or state variables from other files
- Cannot accurately deal with arrays, and will just assume it's 256 bits
- The contract must successfully compile

## How variables are being detected in the contracts
We talked about a lot of assumptions in the code which can be confusing so this section aims to explain why we came up with our restrictions/assumptions. The state variables will be detected in a loop, since the assumption here is that all of the state variables will be in a block together. So let's say we have the following variables:
```
uint256 private a;
mapping(address => uint256) private b;
uint8 private c;
uint32 private d;
```

Here, it will start with `a`, and then once it sees anything that's not a valid state variable, it will stop since it thinks it's at the end of the block. Only `a` will be packed. `a` will be the only variable considered for packing if the `mapping()` variable was replaced with a function too, since it'll stop once it sees *anything* that's not a valid state variable. Now, if we wanted `c` and `d` to both be included in the packing, we will need to ensure they are all in the same block, like so:
```
uint256 private a;
uint8 private c;
uint32 private d;
mapping(address => uint256) private b;
```

Notice now the invalid `mapping` variable is at the bottom, and not splitting up the block of valid state variables. Now since `a`, `c`, and `d` are all in the same block, they will all be packed.

## How variables are being detected in functions
```
a15 = 0;
a11 = a15 + a20;
return a11 + a15;
```

The same cases for function calls
```
a()
return a()
a15 = c()
```

Currently, we are not supporting nested function calls or nested variables. For example, these are not support:
```
return b(a());
a6 = b(a20);
```

# References:
https://code.visualstudio.com/api/get-started/your-first-extension
https://github.com/ConsenSys/solc-typed-ast
https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
https://stackoverflow.com/questions/37982476/how-to-sort-a-map-by-value-in-javascript
https://stackoverflow.com/questions/68088032/im-not-entirely-sure-how-to-use-quickinput-in-vs-code
https://stackoverflow.com/questions/51690146/javascript-finding-highest-value-in-map-vs-object
