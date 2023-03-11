import { start } from 'repl';
import * as vscode from 'vscode';
import {regex, types} from './constants'
import * as binPacking from "./variable_packing_algorithms/binPacking"
import { CompileFailedError, CompileResult, compileSol, PathOptions } from "solc-typed-ast";

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

export async function packStateVariables(editor: vscode.TextEditor, strategy: number) {
	var document = editor.document;

	var stateVariables = await getNextStateVariables(document, editor);

    if (stateVariables == undefined || stateVariables.length == 0) {
        return;
    }

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

export async function getNextStateVariables(document: vscode.TextDocument, editor: vscode.TextEditor) {
    // get line from character count: editor.document.lineAt(editor.document.positionAt(210))
    var file = document.fileName;
    var astCompileResult: CompileResult;
    var lines: TextLineCustom[] = [];

    try {
        astCompileResult = await compileSol(file.replaceAll("\\", "/"), "auto");
        var ast: any = Object.values(astCompileResult.data.sources);
        ast = ast[0].ast;
        var nodes = ast.nodes[1].nodes;

        console.log(nodes);

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].stateVariable) {
                var charLocation = nodes[i].src.split(":")[0] as number;
                var line = editor.document.lineAt(editor.document.positionAt(charLocation)) as TextLineCustom
                lines.push(line);
            } else {
                break;
            }
        }
    } catch (e: unknown) {
        console.log("Error finding file");
    }

	return lines;
}

export function rearrangeLines(editor: vscode.TextEditor, lines: TextLineCustom[]) {
	editor?.edit((editBuilder) => {
        for (var i = 0; i < lines.length; i++) {
            let lineRange = editor.document.lineAt(lines[i].rearrangedLineNumber).range;
            editBuilder.replace(lineRange, lines[i].text);
        }
	}).then(success => {
        if (success) {
            removeExtraLines(editor, lines);
        }
    })

}

export function removeExtraLines(editor: vscode.TextEditor, lines: TextLineCustom[]) {
	editor?.edit((editBuilder) => {
        var maxLineAfterRearranged = Math.max(...lines.map(line => line.rearrangedLineNumber));
        var maxLineBeforeRearranged = Math.max(...lines.map(line => line.lineNumber));

        for (var i = maxLineAfterRearranged + 1; i <= maxLineBeforeRearranged; i++) {
            var p1 = new vscode.Position(i, 0);
            var p2 = new vscode.Position(i + 1, 0);
            let lineRange = new vscode.Range(p1, p2);
            editBuilder.delete(lineRange)
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
