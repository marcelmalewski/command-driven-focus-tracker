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

@Injectable()
export class CommandLineService {
    currentViewName!: Page;
    viewContext: UnknownMap | undefined;

    constructor(
        private router: Router,
        private generalActionsService: GeneralActionsService,
        private notificationService: NotificationService
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
                this.logout(componentDestroyed$);
                break;
            default:
                this.viewNameCommands(normalizedCommandValue);
                break;
        }
    }

    private logout(componentDestroyed$: Subject<void>) {
        this.generalActionsService.logoutWithHandleLogic(componentDestroyed$);
    }

    private viewNameCommands(normalizedCommandValue: string) {
        if (this.currentViewName === Pages.TIMER_HOME) {
            this.onSubmitInHomeViewContext(normalizedCommandValue);
        } else {
            this.notificationService.openErrorNotification(
                UnknownCommandErrorMessage
            );
        }
    }

    private onSubmitInHomeViewContext(normalizedCommandValue: string) {
        if (normalizedCommandValue === Commands.RESET_FORM) {
            (this.viewContext!['timerForm'] as NgForm).resetForm();
        } else if (normalizedCommandValue === Commands.ENABLE_AUTO_BREAK) {
            const form = this.viewContext!['timerForm'] as NgForm;
            form.controls['timerAutoBreakInput'].setValue(true);
        } else if (normalizedCommandValue === Commands.DISABLE_AUTO_BREAK) {
            const form = this.viewContext!['timerForm'] as NgForm;
            form.controls['timerAutoBreakInput'].setValue(false);
        } else if (normalizedCommandValue.startsWith(Commands.SET_SECONDS)) {
            this.setControlValue(
                normalizedCommandValue,
                'timerSetSecondsInput',
                2
            );
        } else if (normalizedCommandValue.startsWith(Commands.SET_MINUTES)) {
            this.setControlValue(
                normalizedCommandValue,
                'timerSetMinutesInput',
                2
            );
        } else if (normalizedCommandValue.startsWith(Commands.SET_HOURS)) {
            this.setControlValue(
                normalizedCommandValue,
                'timerSetHoursInput',
                2
            );
        } else if (
            normalizedCommandValue.startsWith(Commands.SET_SHORT_BREAK)
        ) {
            this.setControlValue(
                normalizedCommandValue,
                'timerShortBreakInput',
                3
            );
        } else if (normalizedCommandValue.startsWith(Commands.SET_LONG_BREAK)) {
            this.setControlValue(
                normalizedCommandValue,
                'timerLongBreakInput',
                3
            );
        } else if (normalizedCommandValue.startsWith(Commands.SET_INTERVAL)) {
            const form = this.viewContext!['timerForm'] as NgForm;
            const timerIntervalControl = form.controls['timerIntervalInput'];
            if (!timerIntervalControl) {
                this.notificationService.openErrorNotification(
                    EnableAutoBreakToSetIntervalMessage
                );
                return;
            }

            timerIntervalControl.setValue(normalizedCommandValue.split(' ')[2]);
        } else if (normalizedCommandValue.startsWith(Commands.SET_TOPIC)) {
            const inputTopicName = normalizedCommandValue.split(' ')[2];
            const topicToSelect = (
                this.viewContext!['mainTopicsBasicData'] as MainTopicBasicData[]
            ).find(
                topic =>
                    topic.name.toLowerCase() === inputTopicName.toLowerCase()
            );

            if (!topicToSelect) {
                this.notificationService.openErrorNotification(
                    UnknownTopicErrorMessage
                );
                return;
            }

            const form = this.viewContext!['timerForm'] as NgForm;
            const timerSelectedTopicControl =
                form.controls['timerSelectedTopicInput'];
            timerSelectedTopicControl.setValue(topicToSelect.name);
        } else {
            this.notificationService.openErrorNotification(
                UnknownCommandErrorMessage
            );
        }
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
