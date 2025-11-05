import { Injectable } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {
    PrincipalBasicData,
    TimerSetTimeDto,
    TimerSettings,
} from '../spec/person-spec';
import { Page, Pages, Stage, Stages, StageToPage } from '../spec/common-spec';
import { Router } from '@angular/router';
import {
    MoveTimerToStageBreakWithAutoBreakResult,
    TimerCurrentTime,
    TimerManualBreakDto,
} from '../spec/timer-spec';
import {
    TimerSettingsUpdated,
    UnknownServerErrorMessage,
} from '../spec/message-spec';
import { PrincipalDataService } from './principal-data.service';
import { NotificationService } from './notification.service';
import { NgForm } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    headers = new HttpHeaders().set('content-type', 'application/json');

    constructor(
        private http: HttpClient,
        private router: Router,
        private principalDataService: PrincipalDataService,
        private notificationService: NotificationService
    ) {}

    matchPageWithStage(currentPage: Page, currentStage: Stage) {
        const expectedCurrentPage = StageToPage[currentStage];
        if (currentPage === expectedCurrentPage) {
            return;
        }

        void this.router.navigateByUrl(expectedCurrentPage);
    }

    updatePrincipalTimerSettings(body: TimerSettings): Observable<any> {
        return this.http.put('/api/v1/persons/principal/timer', body, {
            headers: this.headers,
        });
    }

    updatePrincipalTimerSettingsWithHandledLogicAfter(
        timerForm: NgForm,
        body: TimerSettings,
        componentDestroyed$: Subject<void>
    ) {
        if (timerForm.invalid) {
            return;
        }

        this.updatePrincipalTimerSettings(body)
            .pipe(takeUntil(componentDestroyed$))
            .subscribe({
                next: () => {
                    this.principalDataService.localUpdateTimerSettings(body);
                    this.notificationService.openSuccessNotification(
                        TimerSettingsUpdated
                    );
                },
                error: (_: HttpResponse<any>) => {
                    this.notificationService.openErrorNotification(
                        UnknownServerErrorMessage
                    );
                },
            });
    }

    updatePrincipalTimerStage(timerStage: Stage): Observable<any> {
        return this.http.put(
            '/api/v1/persons/principal/timer/stage',
            { timerStage },
            {
                headers: this.headers,
            }
        );
    }

    principalMoveTimerToStageFocus(body: TimerSettings): Observable<number> {
        return this.http.put<number>(
            '/api/v1/persons/principal/timer/focus',
            body,
            {
                headers: this.headers,
            }
        );
    }

    principalMoveTimerToStageFocusAgain(
        body: TimerSetTimeDto
    ): Observable<number> {
        return this.http.put<number>(
            '/api/v1/persons/principal/timer/focus-again',
            body,
            {
                headers: this.headers,
            }
        );
    }

    principalMoveTimerToStagePause(body: TimerCurrentTime): Observable<number> {
        return this.http.put<number>(
            '/api/v1/persons/principal/timer/pause',
            body,
            {
                headers: this.headers,
            }
        );
    }

    principalMoveTimerToStageBreakWitAutoBreak(
        finished: boolean
    ): Observable<MoveTimerToStageBreakWithAutoBreakResult> {
        return this.http.put<MoveTimerToStageBreakWithAutoBreakResult>(
            `/api/v1/persons/principal/timer/auto-break?finished=${finished}`,
            {
                headers: this.headers,
            }
        );
    }

    principalMoveTimerToStageBreakWitManualBreak(
        body: TimerManualBreakDto
    ): Observable<any> {
        return this.http.put(
            '/api/v1/persons/principal/timer/manual-break',
            body,
            {
                headers: this.headers,
            }
        );
    }

    onBackToHome(
        countDownId: any | undefined,
        componentDestroyed$: Subject<void>
    ) {
        clearInterval(countDownId);
        this.principalMoveTimerBackToStageHome()
            .pipe(takeUntil(componentDestroyed$))
            .subscribe({
                next: () => {
                    this.principalDataService.localUpdateTimerStage(
                        Stages.HOME
                    );
                    this.principalDataService.localUpdateTimerRemainingFocus(
                        undefined
                    );
                    void this.router.navigateByUrl(Pages.TIMER_HOME);
                },
                error: (_: HttpResponse<any>) => {
                    this.notificationService.openErrorNotification(
                        UnknownServerErrorMessage
                    );
                },
            });
    }

    private principalMoveTimerBackToStageHome(): Observable<any> {
        return this.http.put<number>(
            '/api/v1/persons/principal/timer/home-after-focus',
            {
                headers: this.headers,
            }
        );
    }

    static prepareDefaultTimerSettings(): TimerSettings {
        return {
            timerStage: Stages.HOME,
            timerSelectedTopic: '',
            timerSetHours: 0,
            timerSetMinutes: 0,
            timerSetSeconds: 0,
            timerShortBreak: 0,
            timerLongBreak: 0,
            timerAutoBreak: false,
            timerInterval: 0,
        };
    }

    static mapToTimerSettings(
        timerSettings: TimerSettings | PrincipalBasicData
    ): TimerSettings {
        return {
            timerStage: timerSettings.timerStage,
            timerSelectedTopic: timerSettings.timerSelectedTopic,
            timerSetHours: timerSettings.timerSetHours,
            timerSetMinutes: timerSettings.timerSetMinutes,
            timerSetSeconds: timerSettings.timerSetSeconds,
            timerShortBreak: timerSettings.timerShortBreak,
            timerLongBreak: timerSettings.timerLongBreak,
            timerAutoBreak: timerSettings.timerAutoBreak,
            timerInterval: timerSettings.timerInterval,
        };
    }
}
