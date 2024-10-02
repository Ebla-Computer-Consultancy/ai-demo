import { inject, Injectable } from '@angular/core';
import { ApiServiceBaseModel } from '../models/api-service-base-model';
import { HttpClient } from '@angular/common/http';
import { StreamResult } from '../models/stream-result';

@Injectable({
    providedIn: 'root',
})
export class AiAvatarService extends ApiServiceBaseModel {
    protected override http: HttpClient = inject(HttpClient);
    tag: string = 'common/';

    constructor() {
        super('avatar');
    }

    startStream(size: boolean = false) {
        return this.http.post<StreamResult>(this.baseUrl + '/start-stream', {}, {
            params: {
                ...(size ? {
                    size: 'life-size',
                } : {})
            }
        });
    }

    sendCandidate(streamId: string, candidate: any) {
        return this.http.post(`${this.baseUrl}/send-candidate/${streamId}`, {
            candidate: candidate,
        });
    }

    sendAnswer(streamId: string, answer: any) {
        return this.http.put(`${this.baseUrl}/send-answer/${streamId}`, {
            answer: answer,
        });
    }

    closeStream(streamId: string) {
        return this.http.delete(`${this.baseUrl}/close-stream/${streamId}`);
    }

    renderText(streamId: string, text: string) {
        return this.http.post(`${this.baseUrl}/render-text/${streamId}`, {
            text,
        });
    }
}
