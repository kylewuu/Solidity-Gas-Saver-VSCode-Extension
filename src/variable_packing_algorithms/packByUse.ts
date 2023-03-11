import * as vscode from 'vscode';
import {TextLineCustom} from '../variablePacking'

export function pack(lines: TextLineCustom[], nodes: any[]) {   
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].body) {
            // console.log(nodes[i].body.statements);
            // var statements = nodes[i].body.statements[0];
            // for (var j = 0; j < statements.length; j++) {
            //     console.log(statements[i]);
            // }
        }
    }
}
