import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Commands, Page, Pages, UnknownMap } from '../../spec/common-spec';
import { NotificationService } from '../../service/notification.service';
import {
    EnableAutoBreakToSetIntervalMessage,
    UnknownCommandErrorMessage,
    UnknownTopicErrorMessage,
} from '../../spec/message-spec';
import { GeneralActionsService } from '../../service/general-actions.service';
import { NgForm } from '@angular/forms';
import { MainTopicBasicData } from '../../spec/person-spec';
import { TimerService } from '../../service/timer.service';

@Injectable()
export class CommandLineService {
    currentViewName!: Page;
    viewContext: UnknownMap | undefined;

    constructor(
        private router: Router,
        private generalActionsService: GeneralActionsService,
        private notificationService: NotificationService,
        private timerService: TimerService
    ) {}

    handleCommandValue(
        normalizedCommandValue: string,
        componentDestroyed$: Subject<void>
    ) {
        switch (normalizedCommandValue) {
            case Commands.GO_TO_FOCUS_SESSIONS:
                void this.router.navigateByUrl(Pages.FOCUS_SESSIONS);
                break;
            case Commands.GO_TO_TIMER:
                void this.router.navigateByUrl(Pages.TIMER_HOME);
                break;
            case Commands.LOGOUT:
                this.generalActionsService.logoutWithHandledLogicAfter(
                    componentDestroyed$
                );
                break;
            default:
                this.viewNameCommands(
                    normalizedCommandValue,
                    componentDestroyed$
                );
                break;
        }
    }

    private viewNameCommands(
        normalizedCommandValue: string,
        componentDestroyed$: Subject<void>
    ) {
        if (this.currentViewName === Pages.TIMER_HOME) {
            this.onSubmitInHomeViewContext(
                normalizedCommandValue,
                componentDestroyed$
            );
        } else {
            this.notificationService.openErrorNotification(
                UnknownCommandErrorMessage
            );
        }
    }

    private onSubmitInHomeViewContext(
        normalizedCommandValue: string,
        componentDestroyed$: Subject<void>
    ) {
        const form = this.viewContext!['timerForm'] as NgForm;
        switch (true) {
            case normalizedCommandValue === Commands.RESET_FORM:
                form.resetForm();
                break;

            case normalizedCommandValue === Commands.SAVE:
                this.triggerSaveCommand(componentDestroyed$);
                break;

            case normalizedCommandValue === Commands.ENABLE_AUTO_BREAK:
                form.controls['timerAutoBreak'].setValue(true);
                break;

            case normalizedCommandValue === Commands.DISABLE_AUTO_BREAK:
                form.controls['timerAutoBreak'].setValue(false);
                break;

            case normalizedCommandValue.startsWith(Commands.SET_SECONDS):
                this.setControlValue(
                    normalizedCommandValue,
                    'timerSetSeconds',
                    2
                );
                break;

            case normalizedCommandValue.startsWith(Commands.SET_MINUTES):
                this.setControlValue(
                    normalizedCommandValue,
                    'timerSetMinutes',
                    2
                );
                break;

            case normalizedCommandValue.startsWith(Commands.SET_HOURS):
                this.setControlValue(
                    normalizedCommandValue,
                    'timerSetHours',
                    2
                );
                break;

            case normalizedCommandValue.startsWith(Commands.SET_SHORT_BREAK):
                this.setControlValue(
                    normalizedCommandValue,
                    'timerShortBreak',
                    3
                );
                break;

            case normalizedCommandValue.startsWith(Commands.SET_LONG_BREAK):
                this.setControlValue(
                    normalizedCommandValue,
                    'timerLongBreak',
                    3
                );
                break;

            case normalizedCommandValue.startsWith(Commands.SET_INTERVAL):
                this.triggerSetIntervalCommand(normalizedCommandValue);
                break;

            case normalizedCommandValue.startsWith(Commands.SET_TOPIC):
                this.triggerSetTopicCommand(normalizedCommandValue);
                break;

            default:
                this.notificationService.openErrorNotification(
                    UnknownCommandErrorMessage
                );
                break;
        }
    }

    private triggerSaveCommand(componentDestroyed$: Subject<void>) {
        const form = this.viewContext!['timerForm'] as NgForm;
        Object.values(form.controls).forEach(control => {
            control.markAsTouched();
            control.updateValueAndValidity();
        });

        if (form.invalid) {
            this.notificationService.openErrorNotification(
                'Please fix form errors before saving.'
            );
            return;
        }

        this.timerService.updatePrincipalTimerSettingsWithHandledLogicAfter(
            form,
            form.value,
            componentDestroyed$
        );
    }

    private triggerSetIntervalCommand(normalizedCommandValue: string) {
        const form = this.viewContext!['timerForm'] as NgForm;
        const timerIntervalControl = form.controls['timerInterval'];
        if (!timerIntervalControl) {
            this.notificationService.openErrorNotification(
                EnableAutoBreakToSetIntervalMessage
            );
            return;
        }

        timerIntervalControl.setValue(normalizedCommandValue.split(' ')[2]);
    }

    private triggerSetTopicCommand(normalizedCommandValue: string) {
        const inputTopicName = normalizedCommandValue.split(' ')[2];
        const topicToSelect = (
            this.viewContext!['mainTopicsBasicData'] as MainTopicBasicData[]
        ).find(
            topic => topic.name.toLowerCase() === inputTopicName.toLowerCase()
        );

        if (!topicToSelect) {
            this.notificationService.openErrorNotification(
                UnknownTopicErrorMessage
            );
            return;
        }

        const form = this.viewContext!['timerForm'] as NgForm;
        const timerSelectedTopicControl = form.controls['timerSelectedTopic'];
        timerSelectedTopicControl.setValue(topicToSelect.name);
    }

    private setControlValue(
        normalizedCommandValue: string,
        controlName: string,
        valuePosition: number
    ) {
        const form = this.viewContext!['timerForm'] as NgForm;
        form.controls[controlName].setValue(
            normalizedCommandValue.split(' ')[valuePosition]
        );
    }
}
