import { start } from 'repl';
import * as vscode from 'vscode';
import {regex, types} from './constants'
import * as binPacking from "./variable_packing_algorithms/binPacking"
import * as packByUse from "./variable_packing_algorithms/packByUse"
import * as packByFunction from "./variable_packing_algorithms/packByFunction"
import { CompileFailedError, CompileResult, compileSol, PathOptions } from "solc-typed-ast";

export interface TextLineCustom extends Partial<vscode.TextLine> {
    bits: number
    lineNumber: number
    rearrangedLineNumber: number
    text: string
    varName: string
}

export async function packStateVariables(editor: vscode.TextEditor, strategy: number, args? : string) {
	var document = editor.document;

	var [stateVariables, nodes] = await getNextStateVariables(document, editor);

    if (stateVariables == undefined || stateVariables.length == 0 || nodes == undefined || nodes.length == 0) {
        return;
    }

    console.log(nodes);

    switch(strategy){
        case 0:
            binPacking.binPackingFirstFit(stateVariables);
            break;
        case 1:
            binPacking.binPackingBestFit(stateVariables);
            break;
        case 2:
            packByUse.pack(stateVariables, nodes);
            break;
        case 3:
            packByFunction.pack(stateVariables, nodes);
            break;
        case 4:
            packByFunction.pack(stateVariables, nodes, args);
    }
    rearrangeLines(editor, stateVariables);
}

export async function getNextStateVariables(document: vscode.TextDocument, editor: vscode.TextEditor) {
    var file = document.fileName;
    var astCompileResult: CompileResult;
    var lines: TextLineCustom[] = [];
    var nodes = [];

    try {
        astCompileResult = await compileSol(file.replaceAll("\\", "/"), "auto");
        var ast: any = Object.values(astCompileResult.data.sources);
        ast = ast[0].ast;
        nodes = ast.nodes[1].nodes;

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].stateVariable) {
                var charLocation = nodes[i].src.split(":")[0] as number;
                var line = editor.document.lineAt(editor.document.positionAt(charLocation)) as TextLineCustom
                line.varName = nodes[i].name;
                line.bits = extractBits(nodes[i].typeName.name);
                lines.push(line);
            } else {
                break;
            }
        }
    } catch (e: unknown) {
        console.log("Error finding file");
    }

	return [lines, nodes];
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

export function extractBits(type: string) {
    var typeName = type.matchAll(regex.EXTRACT_TYPE_NAME).next().value[1];
    var bits = type.matchAll(regex.EXTRACT_BITS).next().value ? parseInt(type.matchAll(regex.EXTRACT_BITS).next().value[2]) : 0;
    
	switch (typeName) {
		case types.UINT:
			if (bits != 0) return bits;
            else return 256;
		case types.INT:
			if (bits != 0) return bits;
            else return 256;
        case types.BOOL:
            return 8;
        case types.BYTES:
            if (bits == 0) return 256;
            return 8 * bits;
		default:
			return 256
	}
}
