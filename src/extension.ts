// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { start } from 'repl';
import * as vscode from 'vscode';
import {regex, types} from './constants'
import * as variablePacking from './variablePacking'
import * as test from './test'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "soliditygassaver" is now active!');
	let editor = vscode.window.activeTextEditor;

	let packvariablesFirstFit = vscode.commands.registerCommand('soliditygassaver.packvariablesfirstfit', () => {
		editor = vscode.window.activeTextEditor;
		packVariables(editor, 0);
	});

	let packvariablesBestFit = vscode.commands.registerCommand('soliditygassaver.packvariablesbestfit', () => {
		editor = vscode.window.activeTextEditor;
		packVariables(editor, 1);
	});

	let packvariablesByUse = vscode.commands.registerCommand('soliditygassaver.packvariablesbyuse', () => {
		editor = vscode.window.activeTextEditor;
		packVariables(editor, 2);
	});

	let packvariablesByFunction = vscode.commands.registerCommand('soliditygassaver.packvariablesbyfunction', () => {
		editor = vscode.window.activeTextEditor;
		packVariables(editor, 3);
	});
	
	let packvariablesByUserInputFunction = vscode.commands.registerCommand('soliditygassaver.packvariablesbyuserinputfunction', () => {
		var inputBoxOptions = {
			ignoreFocusOut: true,
			title: "Please input your funtion order (separate with spaces)"
		}

		vscode.window.showInputBox(inputBoxOptions).then(args => {
			if (args != undefined) {
				packVariables(editor, 4, args);
			}
		})
		
	}); 

	context.subscriptions.push(packvariablesFirstFit)
	context.subscriptions.push(packvariablesBestFit)
	context.subscriptions.push(packvariablesByUse)
	context.subscriptions.push(packvariablesByFunction)
	context.subscriptions.push(packvariablesByUserInputFunction)
}

export function deactivate() {}

function packVariables(editor?: vscode.TextEditor, strategy?: number, args?: string) {
	if (editor) {
		if (strategy == null) strategy = 0;
		variablePacking.packStateVariables(editor, strategy, args);
	}
}
