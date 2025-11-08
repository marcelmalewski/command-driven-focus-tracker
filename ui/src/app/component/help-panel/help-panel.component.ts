import { Component } from '@angular/core';
import {
    Command,
    CommandsValues,
    CommandsWithParam,
} from '../../spec/common-spec';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'help-panel',
    standalone: true,
    templateUrl: './help-panel.component.html',
    imports: [TitleCasePipe],
})
export class HelpPanelComponent {
    commandsValues = CommandsValues;
    commandsWithParam = CommandsWithParam;

    // Generate a placeholder dynamically based on the command
    prepareCommandLabel(command: Command): string {
        if (this.commandsWithParam.includes(command)) {
            // Convert command string to friendly placeholder
            // e.g., "set seconds" → "set seconds {secondsValue}"
            const words = command.split(' '); // split into words
            const paramName = words.slice(-1)[0]; // take the last word
            return `${command} {${paramName}Value}`;
        }
        return command;
    }
}
