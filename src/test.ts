import { CompileFailedError, CompileResult, compileSol, PathOptions } from "solc-typed-ast";

// Reference: https://github.com/ConsenSys/solc-typed-ast
export async function test() {
    let result: CompileResult;
    
    try {
        result = await compileSol("c:/englishDesktop/School/CMPT479/project/soliditygassaver/test_code/GlobalVariablePackingTest.sol", "auto");
    } catch (e: unknown) {
        if (e instanceof CompileFailedError) {
            var eCasted: CompileFailedError = e;
            console.error("Compile errors encountered:");
    
            for (const failure of eCasted.failures) {
                console.error(`Solc ${failure.compilerVersion}:`);
    
                for (const error of failure.errors) {
                    console.error(error);
                }
            }
        } else {
            console.error(e);
        }
    }
    
    console.log(result.data.sources);
} 

