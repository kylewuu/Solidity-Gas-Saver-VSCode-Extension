import * as vscode from 'vscode';
import {TextLineCustom} from '../variablePacking'


// Reference: https://www.youtube.com/watch?v=vUxhAmfXs2o
export function binPackingFirstFit(lines: TextLineCustom[]) {   
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

export function binPackingBestFit(lines: TextLineCustom[]) {   
    let binBits = 256;

    let binsCapacity: number[] = [];
    let binsLineNumber: number[] = [];

    for (let i = 0; i < lines.length; i++) {
        binsCapacity[i] = binBits;
        binsLineNumber[i] = lines[0].lineNumber + (lines.length * i);
    }

    for (let i = 0; i < lines.length; i++) {
        let minDifference = binBits + 1;
        let bestBin = 0;
        for (let j = 0; j < binsLineNumber.length; j++) {
            if (binsCapacity[j] - lines[i].bits < minDifference && binsCapacity[j] - lines[i].bits >= 0) {
                bestBin = j;
                minDifference = binsCapacity[j] - lines[i].bits;
            }
        }
        lines[i].rearrangedLineNumber = binsLineNumber[bestBin];
        binsLineNumber[bestBin]++;
        binsCapacity[bestBin] -= lines[i].bits;
    }

    lines.sort((a, b) => a.rearrangedLineNumber - b.rearrangedLineNumber)

    for (let i = 1; i < lines.length; i++) {
        lines[i].rearrangedLineNumber = lines[i - 1].rearrangedLineNumber + 1;
    }
}
