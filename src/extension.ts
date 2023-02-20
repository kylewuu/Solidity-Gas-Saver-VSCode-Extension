// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { start } from 'repl';
import * as vscode from 'vscode';
import {regex} from './regex/regex'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "soliditygassaver" is now active!');

	// updates editor when new files are opened or switched
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			changeCode(editor);
		}
	})

	// updates the document on startup since sometimes editors can be opened
	onStartUp();
}

// This method is called when your extension is deactivated
export function deactivate() {}

function onStartUp() {
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		changeCode(editor);
	}
}

function changeCode(editor: vscode.TextEditor) {
	var startPosition = new vscode.Position(0, randomIntInRange(0, 5));
	var endPosition = new vscode.Position(0, randomIntInRange(6, 10));
	var range = new vscode.Range(startPosition, endPosition);

	var document = editor.document;
	var lineCount = document.lineCount;
	var globalVariableBlockFound = false;

	for (let i = 0; i < lineCount; i++) {
		if (regex.MATCH_GLOBAL_VARIABLE.test(document.lineAt(i).text)) {
			globalVariableBlockFound = true;
			console.log(document.lineAt(i).text);
		}

	}

	// editor?.edit(editBuilder => {
		
	// })

	editor?.document.save();
}

function randomIntInRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}