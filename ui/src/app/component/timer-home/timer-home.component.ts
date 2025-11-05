import {
    AfterViewInit,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { CommandLineComponent } from '../command-line/command-line.component';
import { MatFormField, MatInput } from '@angular/material/input';
import { HttpResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { PrincipalDataService } from '../../service/principal-data.service';
import { NotificationService } from '../../service/notification.service';
import {
    MatOption,
    MatSelect,
    MatSelectModule,
} from '@angular/material/select';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TimerService } from '../../service/timer.service';
import { BottomMenuComponent } from '../bottom-menu/bottom-menu.component';
import { MainTopicBasicData, TimerSettings } from '../../spec/person-spec';
import {
    AtLeastOneMessage,
    LessThanOrEqual99Message,
    AtLeastZeroMessage,
    LessThanOrEqual59Message,
    UnknownServerErrorMessage,
    NotImplementedYet,
} from '../../spec/message-spec';
import { Pages, Stages, UnknownMap } from '../../spec/common-spec';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommandLineComponent,
        MatInput,
        MatFormField,
        MatSelect,
        MatOption,
        NgIf,
        MatFormFieldModule,
        MatSelectModule,
        MatDivider,
        FormsModule,
        MatCard,
        MatCardContent,
        MatSlideToggle,
        BottomMenuComponent,
    ],
    templateUrl: './timer-home.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimerHomeComponent implements OnDestroy, OnInit, AfterViewInit {
    mainTopicsBasicData: MainTopicBasicData[] | undefined;
    timerSettings: TimerSettings = TimerService.prepareDefaultTimerSettings();
    viewContext: UnknownMap | undefined;

    readonly AtLeastOneMessage = AtLeastOneMessage;
    readonly LessThanOrEqual99Message = LessThanOrEqual99Message;
    readonly AtLeastZeroMessage = AtLeastZeroMessage;
    readonly LessThanOrEqual59Message = LessThanOrEqual59Message;
    readonly Pages = Pages;

    @ViewChild('timerForm') private timerForm!: NgForm;
    private componentDestroyed$ = new Subject<void>();

    constructor(
        private router: Router,
        private timerService: TimerService,
        private principalDataService: PrincipalDataService,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        const { principalBasicData, mainTopicsBasicData } =
            this.principalDataService.getPrincipalWithMainTopics();

        this.timerService.matchPageWithStage(
            Pages.TIMER_HOME,
            principalBasicData.timerStage
        );

        this.mainTopicsBasicData = mainTopicsBasicData;
        this.timerSettings =
            TimerService.mapToTimerSettings(principalBasicData);
    }

    ngAfterViewInit(): void {
        this.viewContext = {
            timerForm: this.timerForm,
            mainTopicsBasicData: this.mainTopicsBasicData,
        };
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    onSubmitStart() {
        if (this.timerForm.invalid) {
            return;
        }

        const body: TimerSettings = this.timerSettings;
        this.timerService
            .principalMoveTimerToStageFocus(body)
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe({
                next: timerRemainingFocus => {
                    this.principalDataService.localUpdateTimerSettings(body);
                    this.principalDataService.localUpdateTimerRemainingFocus(
                        timerRemainingFocus
                    );
                    this.principalDataService.localUpdateTimerRemainingInterval(
                        body.timerInterval
                    );
                    this.principalDataService.localUpdateTimerStage(
                        Stages.FOCUS
                    );
                    void this.router.navigateByUrl(Pages.TIMER_FOCUS);
                },
                error: (_: HttpResponse<any>) => {
                    this.notificationService.openErrorNotification(
                        UnknownServerErrorMessage
                    );
                },
            });
    }

    onSubmitSave() {
        this.timerService.updatePrincipalTimerSettingsWithHandledLogicAfter(
            this.timerForm,
            this.timerSettings,
            this.componentDestroyed$
        );
    }

    onChangeToStopwatch() {
        this.notificationService.openErrorNotification(NotImplementedYet);
    }

    onAutoBreakToggle() {
        if (
            this.timerSettings.timerAutoBreak &&
            !this.timerSettings.timerInterval
        ) {
            this.timerSettings.timerInterval = 1;
        }
    }
}
