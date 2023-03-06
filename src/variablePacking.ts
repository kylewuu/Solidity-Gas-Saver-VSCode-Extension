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
    bits: number
    lineNumber: number
    rearrangedLineNumber: number
    text: string
}

export function packStateVariables(editor: vscode.TextEditor) {
	var document = editor.document;
	var lineCount = document.lineCount;

	var stateVariables = getNextStateVariableBlock(0, lineCount, document);

	for (var i = 0; i < stateVariables.length; i++) {
        stateVariables[i].bits = extractBits(stateVariables[i].text)
	}

    binPackingFirstFit(stateVariables);

    rearrangeLines(editor, stateVariables);
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

// Reference: https://www.youtube.com/watch?v=vUxhAmfXs2o
export function binPackingFirstFit(lines: TextLineCustom[]) {
    let firstLine = lines[0].lineNumber;
    
    let binBits = 256;

    let binsCapacity: number[] = [];
    let binsLineNumber: number[] = [];

    for (let i = 0; i < lines.length; i++) {
        binsCapacity[i] = binBits;
        binsLineNumber[i] = lines[0].lineNumber + (lines.length * i);
    }

    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < binsLineNumber.length; j++) {
            if (binsCapacity[j] - lines[i].bits >= 0) {
                lines[i].rearrangedLineNumber = binsLineNumber[j];
                binsLineNumber[j]++;
                binsCapacity[j] -= lines[i].bits;
                j = binsLineNumber.length;
                break;
            }
        }
    }

    lines.sort((a, b) => a.rearrangedLineNumber - b.rearrangedLineNumber)

    for (let i = 1; i < lines.length; i++) {
        lines[i].rearrangedLineNumber = lines[i - 1].rearrangedLineNumber + 1;
    }
}