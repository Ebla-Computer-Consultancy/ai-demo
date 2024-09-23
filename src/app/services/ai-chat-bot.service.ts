import { inject, Injectable } from '@angular/core';
import { ApiServiceBaseModel } from '../models/api-service-base-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize, map, Observable } from 'rxjs';
import { IChatMessageResult } from '../interfaces/i-chat-message-result';
import { Message } from '../models/message';
// import { environment } from '../../environments/environment.prod';

@Injectable({
    providedIn: 'root',
})
export class AiChatBotService extends ApiServiceBaseModel {
    override tag: string = 'website/';
    protected override http: HttpClient = inject(HttpClient);
    messageHistory: Message[] = [];
    constructor() {
        super('chat');
    }

    appendMessage(message: Message) {
        this.messageHistory.push(message);
    }
    private _drawBack() {
        this.messageHistory.pop();
    }
    askQuestion(
        message: string,
        stream_id?: string
    ): Observable<IChatMessageResult> {
        this.appendMessage(new Message(message));
        this.startLoading();
        return this.http
            .post<IChatMessageResult>(
                this.baseUrl,
                { messages: this.messageHistory, stream_id },
                {
                    headers: new HttpHeaders({
                        // 'x-functions-key': environment.functionDefaultKey as string,
                    }),
                }
            )
            .pipe(
                finalize(() => {
                    this.stopLoading();
                }),
                catchError((err) => {
                    this._drawBack();
                    this.appendMessage(
                        new Message().clone({
                            content: err.message,
                            role: 'error',
                        })
                    );
                    throw new Error(err);
                })
            )
            .pipe(
                map((response) => {
                    if (typeof response === 'string') {
                        response = JSON.parse(response);
                        if (response.error) {
                            response.message = new Message(
                                response.message as unknown as string,
                                'error'
                            );
                        }
                    }
                    return response;
                })
            );
    }
    resetMessageHistory() {
        this.messageHistory = [];
    }
}
