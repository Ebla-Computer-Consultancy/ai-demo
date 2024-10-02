import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AiAvatarService } from '../../../services/ai-avatar.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AiSpeechToTextService } from '../../../services/ai-speech-to-text.service';
import { AudioRecorderComponent } from '../../../standalone/audio-recorder/audio-recorder.component';
import { finalize, from, map, Subject, switchMap } from 'rxjs';
import { StreamResult } from '../../../models/stream-result';

@Component({
    selector: 'app-ai-avatar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AudioRecorderComponent],
    templateUrl: './ai-avatar.component.html',
    styleUrls: ['./ai-avatar.component.scss'],
})
export class AiAvatarComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('video_ref') video_ref!: ElementRef;
    @ViewChild('recorder') recorder!: AudioRecorderComponent;
    @Output() onToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() type: 'outer' | 'inner' = 'inner';
    aiSpeechToTextService: AiSpeechToTextService = inject(
        AiSpeechToTextService
    );
    _cd = inject(ChangeDetectorRef);
    service = inject(AiAvatarService);
    route = inject(Router);
    control: FormControl = new FormControl({
        value: '',
        disabled: true,
    });
    isLoading: boolean = false;
    readonly STREAM_ID_STORAGE_KEY: string = environment.STREAM_ID_STORAGE_KEY;
    readonly MESSAGE_TEXT_KEY: string = environment.MESSAGE_TEXT_KEY;
    readonly AVATAR_IS_RECORDING_KEY: string =
        environment.AVATAR_IS_RECORDING_KEY;
    readonly OUTER_AVATAR_IS_ACTIVE_KEY: string =
        environment.OUTER_AVATAR_IS_ACTIVE_KEY;
    ask$: Subject<void> = new Subject<void>();
    constructor() {}
    ngOnInit() {}
    ngAfterViewInit(): void {
        localStorage.setItem(this.OUTER_AVATAR_IS_ACTIVE_KEY, String(true));
        const streamId = localStorage.getItem(this.STREAM_ID_STORAGE_KEY);
        if (streamId) {
            this.closeStream();
        }
        this.isLoading = true;
        this._cd.detectChanges();
        this.service
            .startStream(true)
            .pipe(
                switchMap((stream: StreamResult) => {
                    const { webrtcData } = stream.data;
                    const { offer, iceServers } = webrtcData;
                    const { id } = stream.data;

                    localStorage.setItem(this.STREAM_ID_STORAGE_KEY, id);

                    const peerConnection = new RTCPeerConnection({
                        iceTransportPolicy: 'relay',
                        iceServers,
                    });
                    peerConnection.onicecandidate = (e) => {
                        console.log('onicecandidate', e);
                        if (!e.candidate) return;
                        this.service.sendCandidate(id, e.candidate).subscribe();
                    };

                    peerConnection.onicegatheringstatechange = (e) => {
                        console.log('onicegatheringstatechange', e);
                        console.log(
                            'srcObject',
                            this.video_ref.nativeElement.srcObject
                        );

                        const iceGatheringState = (e.target as any)
                            .iceGatheringState;
                        if (
                            iceGatheringState === 'complete' &&
                            this.video_ref.nativeElement.paused &&
                            this.video_ref.nativeElement.srcObject
                        ) {
                            this.video_ref.nativeElement.play();
                        }
                    };

                    peerConnection.ontrack = (e) => {
                        console.log('ontrack', e);
                        const [remoteStream] = e.streams;
                        this.video_ref.nativeElement.srcObject = remoteStream;
                    };
                    return from(
                        peerConnection.setRemoteDescription(
                            new RTCSessionDescription(offer)
                        )
                    )
                        .pipe(
                            switchMap(() => {
                                return from(peerConnection.createAnswer());
                            })
                        )
                        .pipe(
                            switchMap((answer_: RTCSessionDescriptionInit) => {
                                return from(
                                    peerConnection.setLocalDescription(answer_)
                                ).pipe(
                                    map(() => {
                                        return {
                                            id,
                                            answer_,
                                        };
                                    })
                                );
                            })
                        );
                })
            )
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this._cd.detectChanges();
                }),
                switchMap(({ id, answer_ }) => {
                    return this.service.sendAnswer(id, answer_);
                })
            )
            .subscribe();
    }
    get isProcessing(): boolean {
        return (
            !!localStorage.getItem(this.MESSAGE_TEXT_KEY) &&
            !JSON.parse(
                localStorage.getItem(this.AVATAR_IS_RECORDING_KEY) || 'false'
            )
        );
    }
    closeStream() {
        const streamId = localStorage.getItem(this.STREAM_ID_STORAGE_KEY);

        if (streamId) {
            localStorage.removeItem(this.STREAM_ID_STORAGE_KEY);
            this.service.closeStream(streamId).subscribe();
        }
        this.video_ref.nativeElement.srcObject = null;
    }
    stopRecording() {
        if (this.control.value) {
            localStorage.setItem(this.MESSAGE_TEXT_KEY, this.control.value);
        }
        this.reset();
    }
    reset() {
        this.control.reset();
        this.control.updateValueAndValidity();
    }
    handleSpeechToText(result: string) {
        this.control.setValue(result);
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler() {
        localStorage.setItem(this.OUTER_AVATAR_IS_ACTIVE_KEY, String(false));
        this.closeStream();
    }
    ngOnDestroy(): void {
        localStorage.setItem(this.OUTER_AVATAR_IS_ACTIVE_KEY, String(false));
        this.closeStream();
    }
}
