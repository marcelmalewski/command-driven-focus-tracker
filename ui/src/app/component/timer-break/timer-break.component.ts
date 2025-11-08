import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { CommandLineComponent } from '../command-line/command-line.component';
import { BottomMenuComponent } from '../bottom-menu/bottom-menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgIf } from '@angular/common';
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
import { PrincipalDataService } from '../../service/principal-data.service';
import { TimerFieldPipe } from '../../pipes/timer-field.pipe';
import { PrincipalBasicData, TimerSettings } from '../../spec/person-spec';
import {
    Command,
    Commands,
    Pages,
    Stages,
    UnknownMap,
} from '../../spec/common-spec';
import { TimerCurrentBreakTime } from '../../spec/timer-spec';
import { TimerService } from '../../service/timer.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { UnknownServerErrorMessage } from '../../spec/message-spec';
import { Router } from '@angular/router';
import { NotificationService } from '../../service/notification.service';

@Component({
    selector: 'app-timer-break',
    standalone: true,
    templateUrl: './timer-break.component.html',
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
    ],
})
export class TimerBreakComponent implements OnInit, OnDestroy {
    principalBasicData!: PrincipalBasicData;
    timerCurrentTime!: TimerCurrentBreakTime;
    countDownId: any | undefined;
    viewContext: UnknownMap | undefined;

    readonly Pages = Pages;

    private componentDestroyed$ = new Subject<void>();

    triggerCommandSignal = signal<Command | null>(null);

    constructor(
        private router: Router,
        private principalDataService: PrincipalDataService,
        private timerService: TimerService,
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
            case triggeredCommand === Commands.AGAIN:
                this.onAgain();
                break;
            case triggeredCommand === Commands.HOME:
                this.onBackToHome();
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

        const timerCurrentTimeInMinutes =
            this.principalBasicData.timerStage === Stages.SHORT_BREAK
                ? this.principalBasicData.timerShortBreak
                : this.principalBasicData.timerLongBreak;
        this.timerCurrentTime = {
            timerCurrentMinute: timerCurrentTimeInMinutes,
            timerCurrentSecond: 0,
        };
        this.countDownId = setInterval(() => {
            this.countDownLogic();
        }, 1000);

        this.viewContext = {
            triggerCommandSignal: this.triggerCommandSignal,
        };
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
            this.timerCurrentTime.timerCurrentMinute = 59;
            this.timerCurrentTime.timerCurrentSecond = 59;
        }
    }

    ngOnDestroy() {
        if (this.countDownId) {
            clearInterval(this.countDownId);
        }
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    onAgain() {
        clearInterval(this.countDownId);
        const body: TimerSettings = TimerService.mapToTimerSettings(
            this.principalBasicData
        );
        this.timerService
            .principalMoveTimerToStageFocusAgain(body)
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe({
                next: timerRemainingFocus => {
                    this.principalDataService.localUpdateTimerRemainingFocus(
                        timerRemainingFocus
                    );
                    this.principalDataService.localUpdateTimerStage(
                        Stages.FOCUS
                    );
                    this.router.navigateByUrl(Pages.TIMER_FOCUS);
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
}
