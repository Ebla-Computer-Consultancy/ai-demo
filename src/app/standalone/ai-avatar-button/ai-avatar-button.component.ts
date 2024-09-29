import {
    AfterViewInit,
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
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AiAvatarService } from '../../services/ai-avatar.service';
import { StreamResult } from '../../models/stream-result';
import { catchError, finalize, from, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'ai-avatar-button',
    standalone: true,
    imports: [TooltipModule, CommonModule],
    templateUrl: './ai-avatar-button.component.html',
    styleUrls: ['./ai-avatar-button.component.scss'],
    providers: [],
})
export class AiAvatarButtonComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    readonly AiAvatarButtonComponent = AiAvatarButtonComponent;
    @ViewChild('video_ref') video_ref!: ElementRef;
    @Output() onToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() type: 'outer' | 'inner' = 'inner';

    service = inject(AiAvatarService);
    route = inject(Router);
    static toggled: boolean = false;
    isProcessing: boolean = false;
    readonly STREAM_ID_STORAGE_KEY: string = environment.STREAM_ID_STORAGE_KEY;
    readonly OUTER_AVATAR_IS_ACTIVE_KEY: string =
        environment.OUTER_AVATAR_IS_ACTIVE_KEY;
    get isActiveOuterScreen() {
        return JSON.parse(
            localStorage.getItem(this.OUTER_AVATAR_IS_ACTIVE_KEY) || 'false'
        );
    }
    ngOnInit() {
        const streamId = localStorage.getItem(this.STREAM_ID_STORAGE_KEY);
        if (streamId) {
            this.closeStream();
        }
    }
    ngAfterViewInit(): void {}
    closeStream() {
        const streamId = localStorage.getItem(this.STREAM_ID_STORAGE_KEY);

        if (streamId) {
            localStorage.removeItem(this.STREAM_ID_STORAGE_KEY);
            this.service
                .closeStream(streamId)
                .pipe(
                    catchError((e) => {
                        localStorage.setItem(
                            this.STREAM_ID_STORAGE_KEY,
                            streamId
                        );
                        throw e;
                    })
                )
                .subscribe();
        }
        this.video_ref && (this.video_ref.nativeElement.srcObject = null);
    }
    toggleVideo() {
        if (this.type == 'outer') {
            this.onToggle.emit();
            window.open(
                window.location.origin + environment.base + '/ai-avatar',
                'myWindow',
                'fullscreen=1'
            );
        } else {
            AiAvatarButtonComponent.toggled = !AiAvatarButtonComponent.toggled;
            this.onToggle.emit(AiAvatarButtonComponent.toggled);
            const streamId = localStorage.getItem(this.STREAM_ID_STORAGE_KEY);
            if (!streamId) {
                this.isProcessing = true;
                this.service
                    .startStream()
                    .pipe(
                        switchMap((stream: StreamResult) => {
                            const { webrtcData } = stream.data;
                            const { offer, iceServers } = webrtcData;
                            const { id } = stream.data;

                            localStorage.setItem(
                                this.STREAM_ID_STORAGE_KEY,
                                id
                            );

                            const peerConnection = new RTCPeerConnection({
                                iceTransportPolicy: 'relay',
                                iceServers,
                            });
                            peerConnection.onicecandidate = (e) => {
                                console.log('onicecandidate', e);
                                if (!e.candidate) return;
                                this.service
                                    .sendCandidate(id, e.candidate)
                                    .subscribe();
                            };

                            peerConnection.onicegatheringstatechange = (e) => {
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
                                this.video_ref.nativeElement.srcObject =
                                    remoteStream;
                            };
                            return from(
                                peerConnection.setRemoteDescription(
                                    new RTCSessionDescription(offer)
                                )
                            )
                                .pipe(
                                    switchMap(() => {
                                        return from(
                                            peerConnection.createAnswer()
                                        );
                                    })
                                )
                                .pipe(
                                    switchMap(
                                        (
                                            answer_: RTCSessionDescriptionInit
                                        ) => {
                                            return from(
                                                peerConnection.setLocalDescription(
                                                    answer_
                                                )
                                            ).pipe(
                                                map(() => {
                                                    return {
                                                        id,
                                                        answer_,
                                                    };
                                                })
                                            );
                                        }
                                    )
                                );
                        })
                    )
                    .pipe(
                        finalize(() => {
                            this.isProcessing = false;
                        }),
                        switchMap(({ id, answer_ }) => {
                            return this.service.sendAnswer(id, answer_);
                        })
                    )
                    .subscribe();
            } else {
                this.closeStream();
            }
        }
    }
    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler() {
        this.closeStream();
    }
    ngOnDestroy(): void {
        this.closeStream();
    }
}
