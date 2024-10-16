import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    inject,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { AiChatBotService } from '../../../services/ai-chat-bot.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { IChatMessageResult } from '../../../interfaces/i-chat-message-result';
import { CommonModule } from '@angular/common';
import { ICitations, Message } from '../../../models/message';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AudioRecorderComponent } from '../../../standalone/audio-recorder/audio-recorder.component';
import { AiSpeechToTextService } from '../../../services/ai-speech-to-text.service';
import { LoadingComponent } from '../../../standalone/loading/loading.component';
import { TextWriterAnimatorDirective } from '../../../directives/text-writer-animator.directive';
import { formateString, isRTL } from '../../../utils';
import { StopProcessingBtnComponent } from '../../../standalone/stop-processing-btn/stop-processing-btn.component';
import { AiAvatarButtonComponent } from '../../../standalone/ai-avatar-button/ai-avatar-button.component';
import { environment } from '../../../../environments/environment';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
    selector: 'app-ai-chat-bot',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        AudioRecorderComponent,
        LoadingComponent,
        TextWriterAnimatorDirective,
        StopProcessingBtnComponent,
        AiAvatarButtonComponent,
        TooltipModule,
    ],
    templateUrl: './ai-chat-bot.component.html',
    styleUrls: ['./ai-chat-bot.component.scss'],
    providers: [BsModalService],
})
export class AiChatBotComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chat_container') chat_container!: ElementRef;
    @ViewChild('chat_body') chat_body!: ElementRef;
    @ViewChild('recorder') recorder!: AudioRecorderComponent;
    toggled = false;
    service = inject(AiChatBotService);
    aiSpeechToTextService: AiSpeechToTextService = inject(
        AiSpeechToTextService
    );
    modalService = inject(BsModalService);
    stopProcessing$: Subject<void> = new Subject<void>();
    modalRef?: BsModalRef | null;
    control: FormControl = new FormControl('', Validators.required);
    ask$: Subject<void> = new Subject<void>();
    selectedDoc!: ICitations;
    fullScreen: boolean = false;
    animating: boolean = false;
    activeAvatar: boolean = false;
    interval!: NodeJS.Timeout;
    readonly isRTL = isRTL;
    readonly OUTER_AVATAR_IS_ACTIVE_KEY =
        environment.OUTER_AVATAR_IS_ACTIVE_KEY;
    readonly MESSAGE_TEXT_KEY = environment.MESSAGE_TEXT_KEY;
    readonly AVATAR_IS_RECORDING_KEY = environment.AVATAR_IS_RECORDING_KEY;
    readonly STREAM_ID_STORAGE_KEY = environment.STREAM_ID_STORAGE_KEY;

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.ask$.next();
        }
    }
    constructor() {}

    ngOnInit() {
        this.listenToAskQuestion();
        this.handleOuterAvatar();
    }
    ngAfterViewInit() {
        this.scrollToMessage();
    }
    handleOuterAvatar() {
        this.interval = setInterval(() => {
            if (
                localStorage.getItem(this.MESSAGE_TEXT_KEY) &&
                !JSON.parse(
                    localStorage.getItem(this.AVATAR_IS_RECORDING_KEY) ||
                        'false'
                )
            ) {
                this.control.setValue(
                    localStorage.getItem(this.MESSAGE_TEXT_KEY)
                );
                this.ask$.next();
            }
        }, 200);
    }
    scrollToMessage() {
        this.chat_body &&
            this.chat_container &&
            this.chat_container.nativeElement.lastElementChild &&
            (this.chat_body.nativeElement.scrollTop =
                this.chat_body?.nativeElement.scrollHeight -
                this.chat_container.nativeElement.lastElementChild
                    .scrollHeight -
                20);
    }
    listenToAskQuestion() {
        this.ask$
            .pipe(
                filter(
                    () =>
                        !this.service.loading &&
                        this.control.valid &&
                        !!this.control.value.trim()
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
                switchMap(() => {
                    setTimeout(() => {
                        this.scrollToMessage();
                    }, 200);
                    const streamId =
                        localStorage.getItem(this.STREAM_ID_STORAGE_KEY) ||
                        undefined;
                    return this.service
                        .askQuestion(this.control.value, streamId)
                        .pipe(takeUntil(this.stopProcessing$));
                })
            )
            .subscribe((response: IChatMessageResult) => {
                formateString(this.formatText(response.message.content));
                this.reset();
                this.service.appendMessage(
                    new Message().clone({
                        ...response.message,
                        content: this.formatText(response.message.content),
                    })
                );
                setTimeout(() => {
                    this.scrollToMessage();
                }, 200);
            });
    }
    openDocModal(template: TemplateRef<void>, link: ICitations) {
        this.selectedDoc = link;
        this.modalRef = this.modalService.show(template, {
            class: 'modal-lg',
        });
    }
    formatText(text: string) {
        let formattedText = text.replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
        );

        // Replace text between [ and ] with <a> tags
        formattedText = formattedText.replace(
            /\[(.*?)\]/g,
            '<pre class="d-inline"><small class="px-1 text-primary">$1<i class="mdi mdi-link-variant"></i></small></pre>'
        );
        // text = text.replace(/\./g, '.<br>')

        // Return the formatted text
        return formattedText.trim();
    }
    stopAnimation() {
        this.stopProcessing$.next();
        if (
            this.service.messageHistory[this.service.messageHistory.length - 1]
                .role == 'assistant'
        ) {
            this.service.messageHistory[
                this.service.messageHistory.length - 1
            ].content =
                this.chat_container.nativeElement.lastElementChild.children[0].children[0].innerHTML;
        }
        this.reset();
    }
    handleSpeechToText(result: string) {
        this.control.setValue(result);
    }
    stopRecording() {
        this.ask$.next();
    }
    reset() {
        this.control.reset();
        localStorage.setItem(this.MESSAGE_TEXT_KEY, '');
        this.control.updateValueAndValidity();
    }
    clear() {
        this.reset();
        this.service.resetMessageHistory();
        clearInterval(this.interval);
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler() {
        this.clear();
    }
    ngOnDestroy(): void {
        this.clear();
    }
}
