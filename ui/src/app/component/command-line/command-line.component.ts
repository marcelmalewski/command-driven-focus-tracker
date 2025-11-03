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
    GeneralCommand,
    GeneralCommands,
    GeneralCommandsValues,
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
    commands: GeneralCommand[] = GeneralCommandsValues;
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
        this.filteredCommands = this.commandInputControl.valueChanges.pipe(
            startWith(''),
            map(value => this.filterCommands(value || ''))
        );

        this.filteredCommands.subscribe(commands => {
            this.isAutocompleteDisabled = commands.length === 0;
        });
    }

    private filterCommands(value: string): string[] {
        // TODO filtorwanie na podstawie viewName
        if (value === '') {
            return [];
        }

        const filterValue = value.toLowerCase();
        const filteredCommands = this.commands.filter(option =>
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

        if (this.currentViewName() === Pages.TIMER_HOME) {
            this.onSubmitInHomeViewContext(commandValue);
            this.commandInputControl.reset();
            return;
        }

        if (commandValue === GeneralCommands.GO_TO_FOCUS_SESSIONS) {
            void this.router.navigateByUrl(Pages.FOCUS_SESSIONS);
        } else if (commandValue === GeneralCommands.GO_TO_TIMER) {
            void this.router.navigateByUrl(Pages.TIMER_HOME);
        } else if (commandValue === GeneralCommands.LOGOUT) {
            this.logout();
        } else {
            this.notificationService.openErrorNotification(
                UnknownCommandErrorMessage
            );
        }

        this.commandInputControl.reset();
    }

    private logout() {
        this.generalActionsService.logoutWithHandleLogic(
            this.componentDestroyed$
        );
    }

    private onSubmitInHomeViewContext(commandValue: string) {
        if (commandValue === GeneralCommands.RESET_FORM) {
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
