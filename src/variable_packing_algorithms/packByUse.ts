import { off } from 'process';
import * as vscode from 'vscode';
import {TextLineCustom} from '../variablePacking'

export function pack(lines: TextLineCustom[], nodes: any[]) {
    var stateVariables = lines.map(line => line.varName);
    var stateVariableOrder: string[] = [];

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].body) {
            var statements = nodes[i].body.statements;
            statements = statements == undefined ? [] : statements;
            for (var j = 0; j < statements.length; j++) {
                var leftHandSide = statements[j].expression.leftHandSide;
                var rightHandSide = statements[j].expression.rightHandSide;
                checkVariableAndAddInOrder(leftHandSide.name, stateVariables, stateVariableOrder);
                traverseExpression(rightHandSide, stateVariables, stateVariableOrder);
            }
        }
    }

    var startingLine = lines[0].lineNumber;
    var lastLine = lines[lines.length - 1].lineNumber;
    for (var i = 0; i < lines.length; i++) {
        var offSet = stateVariableOrder.indexOf(lines[i].varName);
        if (offSet == -1) {
            lines[i].rearrangedLineNumber = lastLine;
            lastLine++;
        } else {
            lines[i].rearrangedLineNumber = startingLine + offSet;
        }
    }

    lines.sort((a, b) => a.rearrangedLineNumber - b.rearrangedLineNumber)

    for (let i = 1; i < lines.length; i++) {
        lines[i].rearrangedLineNumber = lines[i - 1].rearrangedLineNumber + 1;
    }

    console.log(stateVariableOrder);
}

/**
 * This function is required to traverse the expression, as sometimes there can be nested expressions such as
 * a17 = 2 + a18 * a19;
 * @param exp 
 */
function traverseExpression(exp: any, stateVariables: string[], stateVariableOrder: string[]) {
    if (exp.leftExpression == undefined) {
        checkVariableAndAddInOrder(exp.name, stateVariables, stateVariableOrder);
    } else {
        checkVariableAndAddInOrder(exp.leftExpression.name, stateVariables, stateVariableOrder);
        traverseExpression(exp.leftExpression, stateVariables, stateVariableOrder);
        traverseExpression(exp.rightExpression, stateVariables, stateVariableOrder);
    }
}

function checkVariableAndAddInOrder(name: string, stateVariables: string[], stateVariableOrder: string[]) {
    if (stateVariables.includes(name) && !stateVariableOrder.includes(name)) {
        stateVariableOrder.push(name);
    }
}