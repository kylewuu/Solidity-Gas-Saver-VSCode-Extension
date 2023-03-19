import { off } from 'process';
import * as vscode from 'vscode';
import {TextLineCustom} from '../variablePacking'
import * as packByFunction from "./packByFunction"

export function pack(lines: TextLineCustom[], nodes: any[]) {
    var stateVariables = lines.map(line => line.varName);
    var stateVariableOrder: string[] = [];

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].body) {
            var statements = nodes[i].body.statements;
            statements = statements == undefined ? [] : statements;
            for (var j = 0; j < statements.length; j++) {
                var s = statements[j];
                var typeOfStatement = packByFunction.getTypeOfStatement(s);
                switch(typeOfStatement) {
                    case "assign_existing_variable":
                        var leftHandSide = s.expression.leftHandSide;
                        var rightHandSide = s.expression.rightHandSide;
                        packByFunction.checkVariableAndAdd(leftHandSide.name, stateVariables, stateVariableOrder);
                        packByFunction.traverseExpressionForVariables(rightHandSide, stateVariables, stateVariableOrder);
                        break;
                    case "assign_new_variable":
                        var rightHandSide = s.initialValue;
                        packByFunction.traverseExpressionForVariables(rightHandSide, stateVariables, stateVariableOrder);
                        break;
                    case "return_statement":
                        packByFunction.traverseExpressionForVariables(s.expression, stateVariables, stateVariableOrder);
                        break;
                    case "function_call":
                        break;
                }
            }
        }
    }

    reorderLinesBasedOnVariableOrder(lines, stateVariableOrder);
}

export function reorderLinesBasedOnVariableOrder(lines: any[], stateVariableOrder: string[]) {
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
}