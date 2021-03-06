import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, Subject, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { WebAppSettingDataService, MessageQueueService, MESSAGE_TO, NewUrlStateNotificationService } from 'app/shared/services';

@Component({
    selector: 'pp-application-inspector-contents-container',
    templateUrl: './application-inspector-contents-container.component.html',
    styleUrls: ['./application-inspector-contents-container.component.css']
})
export class ApplicationInspectorContentsContainerComponent implements OnInit, OnDestroy {
    private unsubscribe = new Subject<void>();

    isApplicationInspectorActivated$: Observable<boolean>;
    gridLayout$: Observable<string>;
    coverRangeElements$: Observable<boolean>;

    constructor(
        private webAppSettingDataService: WebAppSettingDataService,
        private messageQueueService: MessageQueueService,
        private newUrlStateNotificationService: NewUrlStateNotificationService
    ) {}

    ngOnInit() {
        this.isApplicationInspectorActivated$ = this.webAppSettingDataService.isApplicationInspectorActivated();
        this.gridLayout$ = merge(
            of(this.webAppSettingDataService.getChartLayoutOption()),
            this.messageQueueService.receiveMessage(this.unsubscribe, MESSAGE_TO.INSPECTOR_CHART_SET_LAYOUT).pipe(
                map(([chartNumbPerRow]: number[]) => chartNumbPerRow)
            )
        ).pipe(
            map((chartNumPerRow: number) => this.getGridLayout(chartNumPerRow))
        );
        this.coverRangeElements$ = this.newUrlStateNotificationService.onUrlStateChange$.pipe(
            map((urlService: NewUrlStateNotificationService) => urlService.isRealTimeMode())
        );
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    private getGridLayout(chartNumPerRow: number): string {
        return `repeat(${chartNumPerRow}, 1fr)`;
    }
}
