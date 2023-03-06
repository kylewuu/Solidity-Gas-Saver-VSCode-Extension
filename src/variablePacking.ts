import { start } from 'repl';
import * as vscode from 'vscode';
import {regex, types} from './constants'
import * as binPacking from "./variable_packing_algorithms/binPacking"


var typesRegex = [
    {
        regex: regex.INT_STATE_VARIABLE,
        type: types.INT
    },
    {
        regex: regex.UINT_STATE_VARIABLE,
        type: types.UINT
    }];

export interface TextLineCustom extends Partial<vscode.TextLine> {
    bits: number
    lineNumber: number
    rearrangedLineNumber: number
    text: string
}

export function packStateVariables(editor: vscode.TextEditor, strategy: number) {
	var document = editor.document;
	var lineCount = document.lineCount;

	var stateVariables = getNextStateVariableBlock(0, lineCount, document);

	for (var i = 0; i < stateVariables.length; i++) {
        stateVariables[i].bits = extractBits(stateVariables[i].text)
	}

    switch(strategy){
        case 0:
            binPacking.binPackingFirstFit(stateVariables);
            break;
        case 1:
            binPacking.binPackingBestFit(stateVariables);
            break;
    }
    rearrangeLines(editor, stateVariables);
}

export function getNextStateVariableBlock(startingLine: number, lineCount: number, document: vscode.TextDocument) {
	var lines = [];
	for (let i = 0; i < lineCount; i++) {
		if (regex.MATCH_ALL_STATE_VARIABLE.test(document.lineAt(i).text)) {
			while (regex.MATCH_ALL_STATE_VARIABLE.test(document.lineAt(i).text) && i < lineCount) {
				console.log(document.lineAt(i).text);
				lines.push(document.lineAt(i) as TextLineCustom);
				i++;
			}
			break; // only get the first block for now
		}
	}
	return lines;
}

export function rearrangeLines(editor: vscode.TextEditor, lines: TextLineCustom[]) {
	editor?.edit((editBuilder) => {
        for (var i = 0; i < lines.length; i++) {
            let lineRange = editor.document.lineAt(lines[i].rearrangedLineNumber).range;
            editBuilder.replace(lineRange, lines[i].text);
        }
	})
}

export function extractBits(variableString: string) {
    var type = typesRegex.find(t => t.regex.test(variableString))?.type;

	switch (type) {
		case types.UINT:
			return variableString.matchAll(regex.EXTRACT_BITS_FROM_UINT).next().value[1] ? +variableString.matchAll(regex.EXTRACT_BITS_FROM_UINT).next().value[1] : 256;
		case types.INT:
			return variableString.matchAll(regex.EXTRACT_BITS_FROM_INT).next().value[1] ? +variableString.matchAll(regex.EXTRACT_BITS_FROM_INT).next().value[1] : 256;
		default:
			return 256
	}
}
