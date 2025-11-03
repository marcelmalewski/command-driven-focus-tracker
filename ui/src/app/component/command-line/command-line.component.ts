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
import {
    FormControl,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
} from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router } from '@angular/router';
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
    Commands,
    CommandsValues,
    CommandToAvailability,
    Page,
    Pages,
    UnknownMap,
} from '../../spec/common-spec';
import { HelpPanelComponent } from '../help-panel/help-panel.component';
import { NotificationService } from '../../service/notification.service';
import { UnknownCommandErrorMessage } from '../../spec/message-spec';
import { GeneralActionsService } from '../../service/general-actions.service';

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

    constructor(
        private router: Router,
        private generalActionsService: GeneralActionsService,
        private notificationService: NotificationService
    ) {}

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    ngOnInit() {
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
        const filteredCommands = this.availableCommands.filter(option =>
            option.toLowerCase().includes(filterValue)
        );
        this.firstCommandFromFilteredCommands = filteredCommands[0];

        return filteredCommands;
    }

    onSubmit() {
        const commandValue: string | null = this
            .firstCommandFromFilteredCommands
            ? this.firstCommandFromFilteredCommands
            : this.commandInputControl.value;
        if (!commandValue) {
            return;
        }

        switch (commandValue) {
            case Commands.GO_TO_FOCUS_SESSIONS:
                void this.router.navigateByUrl(Pages.FOCUS_SESSIONS);
                break;
            case Commands.GO_TO_TIMER:
                void this.router.navigateByUrl(Pages.TIMER_HOME);
                break;
            case Commands.LOGOUT:
                this.logout();
                break;
            default:
                this.viewNameCommands(commandValue);
                break;
        }

        this.commandInputControl.reset();
    }

    private logout() {
        this.generalActionsService.logoutWithHandleLogic(
            this.componentDestroyed$
        );
    }

    private viewNameCommands(commandValue: string) {
        if (this.currentViewName() === Pages.TIMER_HOME) {
            this.onSubmitInHomeViewContext(commandValue);
        } else {
            this.notificationService.openErrorNotification(
                UnknownCommandErrorMessage
            );
        }
    }

    private onSubmitInHomeViewContext(commandValue: string) {
        if (commandValue === Commands.RESET_FORM) {
            (this.viewContext()!['timerForm'] as NgForm).resetForm();
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
