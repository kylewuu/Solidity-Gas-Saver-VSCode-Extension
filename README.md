# Solidty Gas Saver

Welcome! The Solidity Gas Saver is a VSCode extension that was developed to give you some options for refactoring your Solidity code with variable packing. There are many approaches to variable packing, and choosing the best algorithm depends on the context, as they all have their strengths and weaknesses. We have listed them all out and have conducted evaluations with them on various smart contracts. Read through our findings and then decide which one will be best for your situation!

## Strategies
- Bin packing: First fit
- Bin packing: Best fit
- Packing by order of use in functions

## Evaluations

### Bin packing: First fit
TODO

### Bin packing: Best fit
TODO

### Packing by order of use in functions
TODO

## Assumptions
- All state variables will be defined at the beginning of the contract, they should not be scattered in between function definitions

# References:

https://code.visualstudio.com/api/get-started/your-first-extension
https://github.com/ConsenSys/solc-typed-ast
https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects