import { start } from 'repl';
import * as vscode from 'vscode';
import {regex, types} from './constants'


var typesRegex = [
    {
        regex: regex.INT_STATE_VARIABLE,
        type: types.INT
    },
    {
        regex: regex.UINT_STATE_VARIABLE,
        type: types.UINT
    }];

interface TextLineCustom extends Partial<vscode.TextLine> {
    bits?: number
}

export function packStateVariables(editor: vscode.TextEditor) {
	var document = editor.document;
	var lineCount = document.lineCount;

	var stateVariableStrings = getNextStateVariableBlock(0, lineCount, document);

	for (var i = 0; i < stateVariableStrings.length; i++) {
        stateVariableStrings[i].bits = extractBits(stateVariableStrings[i].text as string)
		console.log(stateVariableStrings[i].bits);
	}
	// editor?.document.save();
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

export function swapLines(editor: vscode.TextEditor, line1: number, line2: number) {
	editor?.edit((editBuilder) => {
		let line1String = editor.document.lineAt(line1).text;
		let line2String = editor.document.lineAt(line2).text;
		
		let line1Range = editor.document.lineAt(line1).range
		let line2Range = editor.document.lineAt(line2).range

		editBuilder.replace(line1Range, line2String);
		editBuilder.replace(line2Range, line1String);
	})
}

export function extractBits(variableString: string) {
    var type = typesRegex.find(t => t.regex.test(variableString))?.type;

	switch (type) {
		case types.UINT:
			return variableString.matchAll(regex.EXTRACT_BITS_FROM_UINT).next().value[1];
		case types.INT:
			return variableString.matchAll(regex.EXTRACT_BITS_FROM_INT).next().value[1];
		default:
			return undefined
	}
}

export function getTypesOfVariable() {
	
}