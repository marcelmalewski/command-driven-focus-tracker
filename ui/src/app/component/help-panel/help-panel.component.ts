import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
    selector: 'help-panel',
    standalone: true,
    templateUrl: './help-panel.component.html',
    imports: [FormsModule, MatAutocompleteTrigger],
})
export class HelpPanelComponent implements OnDestroy {
    private componentDestroyed$ = new Subject<void>();

    constructor() {}

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }
}
