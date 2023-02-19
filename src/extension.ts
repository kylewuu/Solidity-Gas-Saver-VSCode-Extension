// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { start } from 'repl';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "soliditygassaver" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('soliditygassaver.testCommand', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		let message = "asdfasdf asd fasd fas dfas df";
		vscode.window.showInformationMessage(`Hello ${message} from SolidityGasSaver!`);
	});

	context.subscriptions.push(disposable);

	// vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
	// 	let lineCount = document.lineCount;
	// 	for (let i = 0; i < lineCount; i++) {
	// 		console.log(document.lineAt(i));
	// 	}

	// 	var startPosition = new vscode.Position(0, 6);
	// 	var endPosition = new vscode.Position(0, 9);
	// 	var range = new vscode.Range(startPosition, endPosition);

	// 	let editor = vscode.window.visibleTextEditors.find(editorTemp => editorTemp.document == document);
	// 	editor?.edit(editBuilder => {
	// 		editBuilder.replace(range, "replaced");
	// 	})

	// 	editor?.document.save();
	// })

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

	editor?.edit(editBuilder => {
		editBuilder.replace(range, "replaced");
	})

	editor?.document.save();
}

function randomIntInRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}