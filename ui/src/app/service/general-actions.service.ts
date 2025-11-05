import { Injectable } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Pages } from '../spec/common-spec';
import {
    LoggedOutMessage,
    UnknownServerErrorMessageRefreshPage,
} from '../spec/message-spec';
import { Router } from '@angular/router';
import { PrincipalDataService } from './principal-data.service';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root',
})
export class GeneralActionsService {
    constructor(
        private router: Router,
        private http: HttpClient,
        private principalDataService: PrincipalDataService,
        private notificationService: NotificationService
    ) {}

    getLoggedIn(): Observable<boolean> {
        return this.http.get<boolean>('/api/v1/persons/principal/logged-in');
    }

    login(payload: HttpParams): Observable<any> {
        return this.http.post('/api/login', payload);
    }

    logout(): Observable<any> {
        return this.http.post('/api/logout', null);
    }

    logoutWithHandledLogicAfter(componentDestroyed$: Subject<void>) {
        this.logout()
            .pipe(takeUntil(componentDestroyed$))
            .subscribe({
                error: (response: HttpResponse<any>) => {
                    if (response.status === 401) {
                        this.principalDataService.clearPrincipalData();
                        void this.router.navigateByUrl(Pages.LOGIN);
                        this.notificationService.openSuccessNotification(
                            LoggedOutMessage
                        );
                    } else {
                        this.notificationService.openErrorNotification(
                            UnknownServerErrorMessageRefreshPage
                        );
                        void this.router.navigateByUrl(Pages.UNKNOWN_ERROR, {
                            skipLocationChange: true,
                        });
                    }
                },
            });
    }
}
