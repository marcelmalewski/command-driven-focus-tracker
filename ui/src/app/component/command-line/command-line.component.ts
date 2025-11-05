import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    ElementRef,
    HostListener,
    input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import {
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
} from '@angular/material/autocomplete';
import { map, Observable, startWith, Subject } from 'rxjs';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
    Command,
    CommandsValues,
    CommandsWithParam,
    CommandToAvailability,
    Page,
    UnknownMap,
} from '../../spec/common-spec';
import { HelpPanelComponent } from '../help-panel/help-panel.component';
import { CommandLineService } from './command-line.service';

@Component({
    selector: 'app-command-line',
    standalone: true,
    imports: [
        FormsModule,
        NgIf,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        AsyncPipe,
        HelpPanelComponent,
    ],
    templateUrl: './command-line.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [CommandLineService],
})
export class CommandLineComponent implements OnInit, OnDestroy {
    @ViewChild('commandInput', { static: true })
    commandInput!: ElementRef<HTMLInputElement>;

    currentViewName = input.required<Page>();
    viewContext = input<UnknownMap>();

    isAutocompleteDisabled = true;
    commandInputControl = new FormControl('');
    availableCommands: Command[] = [];
    filteredCommands: Observable<string[]> | undefined;
    firstCommandFromFilteredCommands: string | undefined;

    private componentDestroyed$ = new Subject<void>();

    constructor(private commandLineService: CommandLineService) {}

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    ngOnInit() {
        this.commandLineService.currentViewName = this.currentViewName();
        this.commandLineService.viewContext = this.viewContext();

        this.availableCommands = this.prepareAvailableCommands();
        this.filteredCommands = this.commandInputControl.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCommands(value || ''))
        );

        this.filteredCommands.subscribe(commands => {
            this.isAutocompleteDisabled = commands.length === 0;
        });
    }

    private prepareAvailableCommands() {
        return CommandsValues.filter(commandValue => {
            const commandAvailability = CommandToAvailability[commandValue];
            return (
                commandAvailability.length === 0 ||
                commandAvailability.includes(this.currentViewName())
            );
        });
    }

    private filterCommands(value: string): string[] {
        if (value === '') {
            return [];
        }

        const filterValue = value.toLowerCase();
        const filteredCommands = this.availableCommands.filter(command => {
            const lowerCaseCommand = command.toLowerCase();
            return (
                lowerCaseCommand.includes(filterValue) ||
                filterValue.startsWith(lowerCaseCommand + ' ')
            );
        });

        this.firstCommandFromFilteredCommands = filteredCommands[0];
        return filteredCommands;
    }

    onSubmit() {
        const commandValue: string | null = this.prepareCommandValue();
        if (!commandValue || commandValue === '') {
            return;
        }
        const normalizedCommandValue = commandValue.trim();
        this.commandLineService.handleCommandValue(
            normalizedCommandValue,
            this.componentDestroyed$
        );
        this.commandInputControl.reset();
    }

    private prepareCommandValue() {
        if (
            this.firstCommandFromFilteredCommands &&
            CommandsWithParam.includes(
                this.firstCommandFromFilteredCommands as Command
            )
        ) {
            return this.commandInputControl.value;
        } else {
            return (
                this.firstCommandFromFilteredCommands ||
                this.commandInputControl.value
            );
        }
    }

    @HostListener('document:keydown', ['$event'])
    handleShortcut(event: KeyboardEvent): void {
        if (
            event.key === 'C' &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
        ) {
            event.preventDefault();
            this.focusInput();
        }
    }

    private focusInput(): void {
        this.commandInput.nativeElement.focus();
    }
}
