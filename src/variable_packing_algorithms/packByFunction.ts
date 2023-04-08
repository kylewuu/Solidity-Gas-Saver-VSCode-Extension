import { off } from 'process';
import * as vscode from 'vscode';
import {TextLineCustom} from '../variablePacking'
import * as packByUse from "./packByUse"
import * as binPacking from "./binPacking"

export function pack(lines: TextLineCustom[], nodes: any[], args ? : string) {
    var functionDependencies : Map<string, string[]> = new Map<string, string[]>();
    var functionScores: Map<string, number> = new Map<string, number>();
    var functionVariables : Map<string, string[]> = new Map<string, string[]>();

    var stateVariables = lines.map(line => line.varName);
    
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType === "FunctionDefinition" && nodes[i].kind != "constructor" && nodes[i].name) {
            console.log(nodes[i].name);
            functionDependencies.set(nodes[i].name, []);
        }
    }

    functionDependencies.forEach((value: string[], key: string) => {
        functionDependencies.set(key, getFunctionsCalledByFunction(nodes, key));
        functionScores.set(key, 0);
        functionVariables.set(key, []);
    })

    calculateFunctionScores(functionDependencies, functionScores);

    getFunctionVariables(nodes, functionVariables, stateVariables, lines);

    if (args != undefined) {
        changeScoresBasedOnUserInput(functionScores, args);
    }
    
    var variablesInOrder = getFinalOrderOfVariables(functionVariables, functionScores);

    packByUse.reorderLinesBasedOnVariableOrder(lines, variablesInOrder);
}

function getFunctionsCalledByFunction(nodes : any[], functionName: string) {
    var functionsCalled: string[] = [];
    var node: any = nodes.find(node => node.kind == 'function' && node.name == functionName);

    // detecting for calls without assignments `a()`
    var statements = node.body.statements;
    statements.forEach((s : any) => {
        var functions: string[] = [];
        var typeOfStatement = getTypeOfStatement(s);
        switch(typeOfStatement) {
            case "assign_existing_variable":
                var rightHandSide = s.expression.rightHandSide;
                traverseExpressionFunction(rightHandSide, functions);
                break;
            case "assign_new_variable":
                traverseExpressionFunction(s.initialValue, functions);
                break;
            case "return_statement":
                traverseExpressionFunction(s.expression, functions);
                break;
            case "function_call":
                functionsCalled.push(s.expression.expression.name);
                break;
        }
        functionsCalled.push(...functions);
    });

    return functionsCalled;
}

function traverseExpressionFunction(exp: any, functions: string[]) {
    if (exp == null) {
        return
    }

    if (exp.leftExpression == undefined) {
        if (exp.kind == "functionCall") {
            functions.push(exp.expression.name);
        }
    } else {
        traverseExpressionFunction(exp.leftExpression, functions);
        traverseExpressionFunction(exp.rightExpression, functions);
    }
}

function calculateFunctionScores(functionDependencies: Map<string, string[]>, functionScores: Map<string, number>) {
    var queue: string[] = [];
    functionDependencies.forEach((value: string[], key: string) => {
        var score = 0;
        queue.push(key);
        while (queue.length > 0) {
            var tempKey = queue.shift();
            functionDependencies.forEach((value: string[], key: string) => {
                if (tempKey != undefined && value.includes(tempKey)) {
                    queue.push(key);
                    score++;
                }
            })
        }

        functionScores.set(key, score);
    })
}

function getFunctionVariables(nodes: any[], functionVariables: Map<string, string[]>, stateVariables: string[], lines: any[]) {
    functionVariables.forEach((value: string[], key: string) => {
        var node: any = nodes.find(node => node.body && node.name == key);
        var statements = node.body.statements;
        var variables: string[] = [];
        statements.forEach((s : any) => {
            var typeOfStatement = getTypeOfStatement(s);
            switch(typeOfStatement) {
                case "assign_existing_variable":
                    var leftHandSide = s.expression.leftHandSide;
                    var rightHandSide = s.expression.rightHandSide;
                    checkVariableAndAdd(leftHandSide.name, stateVariables, variables);
                    traverseExpressionForVariables(rightHandSide, stateVariables, variables);
                    break;
                case "assign_new_variable":
                    var rightHandSide = s.initialValue;
                    traverseExpressionForVariables(rightHandSide, stateVariables, variables);
                    break;
                case "return_statement":
                    traverseExpressionForVariables(s.expression, stateVariables, variables);
                    break;
                case "function_call":
                    break;
            }
        });

        functionVariables.set(key, packStateVariables(variables, lines));
    })
}

export function packStateVariables(variables: string[], lines: any[]) {
    var functionLines = lines.filter(lines => variables.includes(lines.varName));
    binPacking.binPackingBestFit(functionLines);
    return functionLines.map(line => line.varName);
}

export function traverseExpressionForVariables(exp: any, stateVariables: string[], functionVariables: string[]) {
    if (exp == null) {
        return
    }
    
    if (exp.leftExpression == undefined) {
        checkVariableAndAdd(exp.name, stateVariables, functionVariables);
    } else {
        traverseExpressionForVariables(exp.leftExpression, stateVariables, functionVariables);
        traverseExpressionForVariables(exp.rightExpression, stateVariables, functionVariables);
    }
}

export function checkVariableAndAdd(name: string, stateVariables: string[], functionVariables: string[]) {
    if (stateVariables.includes(name) && !functionVariables.includes(name)) {
        functionVariables.push(name);
    }
}

// There are many types of statements that need to be accounted for, check the readme for all possible variations
export function getTypeOfStatement(s: any) {
    if (s.expression && s.nodeType != "Return" && s.expression.kind != "functionCall" && !s.assignments) {
        return "assign_existing_variable"
    } else if (s.assignments) {
        return "assign_new_variable"
    } else if (s.nodeType == "Return") {
        return "return_statement"
    } else if (s.expression && s.expression.kind == "functionCall") {
        return "function_call"
    }
}

function getFinalOrderOfVariables(functionVariables: Map<string, string[]>, functionScores: Map<string, number>) {
    var functionScoresSorted = new Map([...functionScores.entries()].sort((a, b) => b[1] - a[1]));
    var variablesInOrder: string[] = [];
    functionScoresSorted.forEach((value: Number, key: string) => {
        var temp: string[] = functionVariables.get(key)!
        temp.forEach(v => {
            if (!variablesInOrder.includes(v)) variablesInOrder.push(...temp);
        })
    })

    return variablesInOrder;
}

function changeScoresBasedOnUserInput(functionScores: Map<string, number>, args: string) {
    var userOrder = args.split(" ");
    userOrder = userOrder.reverse()
    var maxScore = Math.max(...functionScores.values());

    functionScores.forEach((value: Number, key: string) => {
        if (userOrder.includes(key)) {
            functionScores.set(key, maxScore + userOrder.indexOf(key) + 1);
        }
    })
}