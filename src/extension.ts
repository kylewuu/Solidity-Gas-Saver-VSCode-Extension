// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { start } from 'repl';
import * as vscode from 'vscode';
import {regex, types} from './constants'
import * as variablePacking from './variablePacking'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "soliditygassaver" is now active!');

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			variablePacking.packStateVariables(editor);
		}
	})

	onStartUp();
}

export function deactivate() {}

function onStartUp() {
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		variablePacking.packStateVariables(editor);
	}
}
