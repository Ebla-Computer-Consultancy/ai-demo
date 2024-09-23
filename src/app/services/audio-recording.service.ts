import { Injectable } from '@angular/core';
import RecordRTC from 'recordrtc';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { IRecordedAudioOutput } from '../interfaces/i-recorded-audio-output';

@Injectable({
    providedIn: 'root',
})
export class AudioRecordingService {
    private stream: any;
    private recorder: any;
    private interval: any;
    private startTime: any;
    private _recorded = new Subject<IRecordedAudioOutput>();
    private _recordingTime = new Subject<string>();
    private _recordingFailed = new Subject<string>();

    getRecordedBlob(): Observable<IRecordedAudioOutput> {
        return this._recorded.asObservable();
    }

    getRecordedTime(): Observable<string> {
        return this._recordingTime.asObservable();
    }

    recordingFailed(): Observable<string> {
        return this._recordingFailed.asObservable();
    }

    startRecording() {
        if (this.recorder) {
            // It means recording is already started or it is already recording something
            return;
        }

        this._recordingTime.next('00:00');
        navigator.mediaDevices
            .getUserMedia({
                video: false,
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    sampleSize: 16,
                },
            })
            .then((s) => {
                this.stream = s;
                this.record();
            })
            .catch((error) => {
                this._recordingFailed.next('');
            });
    }

    abortRecording() {
        this.stopMedia();
    }

    private record() {
        this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
            type: 'audio',
            mimeType: 'audio/wav',
        });

        this.recorder.record();
        this.startTime = moment();
        this.interval = setInterval(() => {
            const currentTime = moment();
            const diffTime = moment.duration(currentTime.diff(this.startTime));
            const time =
                this.toString(diffTime.minutes()) +
                ':' +
                this.toString(diffTime.seconds());
            this._recordingTime.next(time);
        }, 1000);
    }

    private toString(value: any) {
        let val = value;
        if (!value) val = '00';
        if (value < 10) val = '0' + value;
        return val;
    }

    stopRecording() {
        if (this.recorder) {
            this.recorder.stop(
                (blob: any) => {
                    if (this.startTime) {
                        const fileName = encodeURIComponent(
                            'audio_' + new Date().getTime() + '.wav'
                        );
                        this._recorded.next({
                            blob: blob,
                            title: fileName,
                        });
                        this.stopMedia();
                    }
                },
                () => {
                    this.stopMedia();
                    this._recordingFailed.next('');
                }
            );
        }
    }

    private stopMedia() {
        if (this.recorder) {
            this.recorder = null;
            clearInterval(this.interval);
            this.startTime = null;
            if (this.stream) {
                this.stream
                    .getAudioTracks()
                    .forEach((track: any) => track.stop());
                this.stream = null;
            }
        }
    }
}
