import { Component, input, OnDestroy } from '@angular/core';
import { CommandLineComponent } from '../command-line/command-line.component';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { GeneralActionsService } from '../../service/general-actions.service';
import { Page, Pages, UnknownMap } from '../../spec/common-spec';

@Component({
    selector: 'bottom-menu',
    standalone: true,
    templateUrl: './bottom-menu.component.html',
    imports: [CommandLineComponent],
})
export class BottomMenuComponent implements OnDestroy {
    currentViewName = input.required<Page>();
    viewContext = input<UnknownMap>();

    private componentDestroyed$ = new Subject<void>();

    constructor(
        private router: Router,
        private generalActionsService: GeneralActionsService
    ) {}

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    submitLogout() {
        this.generalActionsService.logoutWithHandledLogicAfter(
            this.componentDestroyed$
        );
    }

    goToHome() {
        void this.router.navigateByUrl(Pages.TIMER_HOME);
    }

    goToFocusSessions() {
        void this.router.navigateByUrl(Pages.FOCUS_SESSIONS);
    }
}
