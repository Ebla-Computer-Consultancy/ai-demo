import {
    Component,
    HostListener,
    inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { filter, map, Subject, switchMap, tap } from 'rxjs';
import { AiSearchService } from '../../../services/ai-search.service';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SearchResult } from '../../../models/search-result';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.prod';
import { AudioRecorderComponent } from '../../../standalone/audio-recorder/audio-recorder.component';
import { AiSpeechToTextService } from '../../../services/ai-speech-to-text.service';
import { LoadingComponent } from '../../../standalone/loading/loading.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { isRTL } from '../../../utils';
import { StopProcessingBtnComponent } from '../../../standalone/stop-processing-btn/stop-processing-btn.component';
@Component({
    selector: 'app-ai-search',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        AudioRecorderComponent,
        LoadingComponent,
        PaginationModule,
        StopProcessingBtnComponent,
    ],
    templateUrl: './ai-search.component.html',
    styleUrls: ['./ai-search.component.scss'],
})
export class AiSearchComponent implements OnInit {
    @ViewChild('recorder') recorder!: AudioRecorderComponent;
    service: AiSearchService = inject(AiSearchService);
    aiSpeechToTextService: AiSpeechToTextService = inject(
        AiSpeechToTextService
    );
    search$: Subject<number> = new Subject<number>();
    control: FormControl = new FormControl('', [Validators.required]);
    results: SearchResult[] = [];
    total_count: number = 0;
    currentPage: number = 1;
    searchKeyWord = '';
    readonly isRTL = isRTL;
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.search$.next(1);
        }
    }
    constructor() {}

    ngOnInit() {
        this.listenToSearch();
    }

    listenToSearch() {
        this.search$
            .pipe(
                filter(
                    () =>
                        !this.service.loading &&
                        (!!this.control.valid || !!this.searchKeyWord)
                )
            )
            .pipe(
                tap(() => {
                    if (
                        this.recorder.isProcessing ||
                        this.recorder.isRecording
                    ) {
                        this.recorder.canceledRecording();
                    }
                })
            )
            .pipe(
                map((page) => {
                    if (!this.control.value) {
                        this.control.setValue(this.searchKeyWord);
                    }
                    if (
                        this.control.value &&
                        this.searchKeyWord !== this.control.value
                    ) {
                        this.currentPage = 1;
                    } else {
                        this.currentPage = page;
                    }
                    return this.currentPage;
                })
            )
            .pipe(
                switchMap((page: number) => {
                    return this.service.search(this.control.value, 10, page);
                })
            )
            .subscribe(({ rs, total_count }) => {
                this.results = rs;
                this.total_count = total_count;
                this.searchKeyWord = this.control.value;
                this.control.reset();
                this.control.updateValueAndValidity();
            });
    }

    handleSpeechToText(result: string) {
        this.control.setValue(result);
    }
    stopRecording() {
        this.search$.next(1);
    }

    readonly environment = environment;
}
