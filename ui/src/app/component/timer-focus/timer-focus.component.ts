import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { CommandLineComponent } from '../command-line/command-line.component';
import { BottomMenuComponent } from '../bottom-menu/bottom-menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatError,
    MatFormField,
    MatLabel,
    MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { NgIf } from '@angular/common';
import { TimerService } from '../../service/timer.service';
import { Router } from '@angular/router';
import { PrincipalDataService } from '../../service/principal-data.service';
import { NotificationService } from '../../service/notification.service';
import { MatCard, MatCardContent } from '@angular/material/card';
import { TimerFieldPipe } from '../../pipes/timer-field.pipe';
import { Subject, takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import {
    Command,
    Commands,
    Pages,
    Stages,
    UnknownMap,
} from '../../spec/common-spec';
import { PrincipalBasicData } from '../../spec/person-spec';
import {
    SavedNewSession,
    UnknownServerErrorMessage,
} from '../../spec/message-spec';
import { TimerCurrentTime } from '../../spec/timer-spec';
import { translateBreakPipe } from '../../pipes/translate-break.pipe';

@Component({
    selector: 'app-timer-focus',
    standalone: true,
    templateUrl: './timer-focus.component.html',
    imports: [
        CommandLineComponent,
        BottomMenuComponent,
        FormsModule,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        MatOption,
        MatSelect,
        MatSlideToggle,
        MatSuffix,
        NgIf,
        ReactiveFormsModule,
        MatCard,
        MatCardContent,
        TimerFieldPipe,
        translateBreakPipe,
    ],
})
export class TimerFocusComponent implements OnInit, OnDestroy {
    principalBasicData!: PrincipalBasicData;
    timerCurrentTime!: TimerCurrentTime;
    countDownId: any | undefined;
    nextBreak: string | undefined;
    viewContext: UnknownMap | undefined;

    readonly Pages = Pages;
    readonly Stages = Stages;

    private componentDestroyed$ = new Subject<void>();

    triggerCommandSignal = signal<Command | null>(null);

    constructor(
        private router: Router,
        private timerService: TimerService,
        private principalDataService: PrincipalDataService,
        private notificationService: NotificationService
    ) {
        effect(() => {
            if (this.triggerCommandSignal()) {
                this.handleTriggeredCommand(this.triggerCommandSignal()!);
            }
        });
    }

    private handleTriggeredCommand(triggeredCommand: Command) {
        switch (true) {
            case triggeredCommand === Commands.PAUSE:
                this.onPause();
                break;
            case triggeredCommand === Commands.RESUME:
                this.onResume();
                break;
            case triggeredCommand === Commands.HOME:
                this.onBackToHome();
                break;
            case triggeredCommand === Commands.SHORT_BREAK:
                this.onShortBreak();
                break;
            case triggeredCommand === Commands.LONG_BREAK:
                this.onLongBreak();
                break;
        }
    }

    ngOnInit(): void {
        this.principalBasicData =
            this.principalDataService.getPrincipalBasicData();

        this.timerService.matchPageWithStage(
            Pages.TIMER_FOCUS,
            this.principalBasicData.timerStage
        );

        this.nextBreak = this.prepareNextBreakName();

        const { timerCurrentHour, timerCurrentMinute, timerCurrentSecond } =
            this.extractCurrentFocusTime(
                this.principalBasicData.timerRemainingFocus!
            );
        this.timerCurrentTime = {
            timerCurrentHour,
            timerCurrentMinute,
            timerCurrentSecond,
        };

        if (this.principalBasicData.timerStage === Stages.FOCUS) {
            this.countDownId = setInterval(() => {
                this.countDownLogic();
            }, 1000);
        }

        this.viewContext = {
            triggerCommandSignal: this.triggerCommandSignal,
        };
    }

    private prepareNextBreakName(): string {
        return this.principalBasicData.timerRemainingInterval === 0
            ? Stages.LONG_BREAK
            : Stages.SHORT_BREAK;
    }

    private extractCurrentFocusTime(remainingTime: number) {
        const allMinutes = Math.floor(remainingTime / 60);
        const timerCurrentSecond = remainingTime - allMinutes * 60;

        const timerCurrentHour = Math.floor(allMinutes / 60);
        const timerCurrentMinute = allMinutes - timerCurrentHour * 60;

        return {
            timerCurrentHour,
            timerCurrentMinute,
            timerCurrentSecond,
        };
    }

    ngOnDestroy() {
        if (this.countDownId) {
            clearInterval(this.countDownId);
        }
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    private countDownLogic() {
        if (this.timerCurrentTime.timerCurrentSecond > 0) {
            this.timerCurrentTime.timerCurrentSecond =
                this.timerCurrentTime.timerCurrentSecond - 1;
        } else {
            this.countDownLogicOnTimerSetSecondsIsZero();
        }
    }

    private countDownLogicOnTimerSetSecondsIsZero() {
        if (this.timerCurrentTime.timerCurrentMinute > 0) {
            this.timerCurrentTime.timerCurrentMinute =
                this.timerCurrentTime.timerCurrentMinute - 1;
            this.timerCurrentTime.timerCurrentSecond = 59;
        } else {
            this.countDownLogicOnTimerSetMinutesIsZero();
        }
    }

    private countDownLogicOnTimerSetMinutesIsZero() {
        if (this.timerCurrentTime.timerCurrentHour > 0) {
            this.timerCurrentTime.timerCurrentHour =
                this.timerCurrentTime.timerCurrentHour - 1;
            this.timerCurrentTime.timerCurrentMinute = 59;
            this.timerCurrentTime.timerCurrentSecond = 59;
        }
    }

    onPause() {
        clearInterval(this.countDownId);
        this.timerService
            .principalMoveTimerToStagePause(this.timerCurrentTime)
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe({
                next: timerRemainingFocus => {
                    this.principalDataService.localUpdateTimerRemainingFocus(
                        timerRemainingFocus
                    );
                    this.principalBasicData.timerStage = Stages.PAUSE;
                },
                error: (_: HttpResponse<any>) => {
                    this.notificationService.openErrorNotification(
                        UnknownServerErrorMessage
                    );

                    this.countDownId = setInterval(() => {
                        this.countDownLogic();
                    }, 1000);
                },
            });
    }

    onResume() {
        this.timerService
            .updatePrincipalTimerStage(Stages.FOCUS)
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe({
                next: () => {
                    this.principalDataService.localUpdateTimerStage(
                        Stages.FOCUS
                    );
                    this.principalBasicData.timerStage = Stages.FOCUS;
                    this.countDownId = setInterval(() => {
                        this.countDownLogic();
                    }, 1000);
                },
                error: (_: HttpResponse<any>) => {
                    this.notificationService.openErrorNotification(
                        UnknownServerErrorMessage
                    );
                },
            });
    }

    onBackToHome() {
        this.timerService.onBackToHome(
            this.countDownId,
            this.componentDestroyed$
        );
    }

    onAutoBreak() {
        clearInterval(this.countDownId);

        const finished =
            this.timerCurrentTime.timerCurrentSecond +
                this.timerCurrentTime.timerCurrentSecond +
                this.timerCurrentTime.timerCurrentSecond ===
            0;
        this.timerService
            .principalMoveTimerToStageBreakWitAutoBreak(finished)
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe({
                next: result => {
                    this.principalDataService.localUpdateTimerStage(
                        result.timerStage
                    );
                    this.principalDataService.localUpdateTimerRemainingInterval(
                        result.timerRemainingInterval
                    );
                    this.principalDataService.localUpdateTimerRemainingFocus(
                        undefined
                    );
                    this.notificationService.openSuccessNotification(
                        SavedNewSession
                    );
                    void this.router.navigateByUrl(Pages.TIMER_BREAK);
                },
                error: (_: HttpResponse<any>) => {
                    this.notificationService.openErrorNotification(
                        UnknownServerErrorMessage
                    );
                },
            });
    }

    onShortBreak() {
        const finished =
            this.timerCurrentTime.timerCurrentSecond +
                this.timerCurrentTime.timerCurrentSecond +
                this.timerCurrentTime.timerCurrentSecond ===
            0;
        const body = {
            breakTypeToStart: Stages.SHORT_BREAK,
            finished,
        };

        clearInterval(this.countDownId);
        this.timerService
            .principalMoveTimerToStageBreakWitManualBreak(body)
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe({
                next: () => {
                    this.principalDataService.localUpdateTimerStage(
                        Stages.SHORT_BREAK
                    );
                    this.principalDataService.localUpdateTimerRemainingFocus(
                        undefined
                    );
                    this.notificationService.openSuccessNotification(
                        SavedNewSession
                    );
                    void this.router.navigateByUrl(Pages.TIMER_BREAK);
                },
                error: (_: HttpResponse<any>) => {
                    this.notificationService.openErrorNotification(
                        UnknownServerErrorMessage
                    );
                },
            });
    }

    onLongBreak() {
        const finished =
            this.timerCurrentTime.timerCurrentSecond +
                this.timerCurrentTime.timerCurrentSecond +
                this.timerCurrentTime.timerCurrentSecond ===
            0;
        const body = {
            breakTypeToStart: Stages.LONG_BREAK,
            finished,
        };

        clearInterval(this.countDownId);
        this.timerService
            .principalMoveTimerToStageBreakWitManualBreak(body)
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe({
                next: () => {
                    this.principalDataService.localUpdateTimerStage(
                        Stages.LONG_BREAK
                    );
                    this.principalDataService.localUpdateTimerRemainingFocus(
                        undefined
                    );
                    this.notificationService.openSuccessNotification(
                        SavedNewSession
                    );
                    void this.router.navigateByUrl(Pages.TIMER_BREAK);
                },
                error: (_: HttpResponse<any>) => {
                    this.notificationService.openErrorNotification(
                        UnknownServerErrorMessage
                    );
                },
            });
    }
}
