# Solidty Gas Saver

Welcome! The Solidity Gas Saver is a VSCode extension that was developed to give you some options for refactoring your Solidity code with variable packing. There are many approaches to variable packing, and choosing the best algorithm depends on the context, as they all have their strengths and weaknesses. We have listed them all out and have conducted evaluations with them on various smart contracts. Read through our findings and then decide which one will be best for your situation!

## Strategies

1. Bin packing: First fit
2. Bin packing: Best fit
3. Packing by order of use in functions
4. Grouped by function call frequency

## Strategy Explanations

### 1. Bin packing: First fit
First fit algorithm follows the first-fit bin packing strategy to packing the state variables into bins of 256 bits. For more information, please check out [this wiki](https://en.wikipedia.org/wiki/First-fit_bin_packing#:~:text=First%2Dfit%20(FF)%20is,is%20at%20most%20the%20capacity.) on the algorithm

### 2. Bin packing: Best fit
Best fit algorithm follows the best-fit bin packing strategy where each bin is 256 bits. While still the classic bin packing approach, it will prioritize wasting as little space in each bin as possible. For more information, please read about it [here](https://en.wikipedia.org/wiki/Best-fit_bin_packing#:~:text=Best%2Dfit%20is%20an%20online,is%20at%20most%20the%20capacity.)

### 3. Packing by order of use in functions
The functions defined in the contract can use state variables. This strategy will take the order of the functions as defined in the contracts, and reorder the state variables as how they appear to be used in the functions. For example:
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
Every time `C()` is called, `B()` then `A()` is always called. From this intuition, we can give each function a score. If a function has a high degree of dependency, then it will get a higher score. The lower the dependency, the lower the score. In our example, `A` would have the highest score, while `C` would have the lowest score. Afterwards, the state variables used in each function will be ordered and grouped together by their respective function ranks. If a state variable appears in multiple functions, then the higher ranked function will be prioritized.

## Assumptions

- All state variables will be defined at the beginning of the contract, they should not be scattered in between function definitions
- Only one contract per file
- Each contract is independent and will not pull functions or state variables from other files

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
