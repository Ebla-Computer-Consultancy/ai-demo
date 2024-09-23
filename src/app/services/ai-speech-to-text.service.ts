import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServiceBaseModel } from '../models/api-service-base-model';
import { finalize, Observable } from 'rxjs';
// import { environment } from '../../environments/environment.prod';

@Injectable({
    providedIn: 'root',
})
export class AiSpeechToTextService extends ApiServiceBaseModel {
    override tag: string = 'common/';
    protected override http: HttpClient = inject(HttpClient);
    constructor() {
        super('speech');
    }
    transcribe(formData: FormData): Observable<string> {
        this.startLoading();
        return this.http
            .post<string>(this.baseUrl + '/transcribe', formData, {
                headers: new HttpHeaders({
                    enctype: 'multipart/form-data',
                    // 'x-functions-key': environment.functionDefaultKey as string,
                }),
            })
            .pipe(
                finalize(() => {
                    this.stopLoading();
                })
            );
    }
    requestAuthorizationToken() {
        return this.http.get<{ token: string; region: string }>(
            this.baseUrl + '/token',
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                }),
            }
        );
    }
}
