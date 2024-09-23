import { webrtcData } from './webrtc-data';

export class StreamResult {
    status_code!: number;
    status!: 'SUCCESS';
    message!: number;
    data!: Data;
}

class Data {
    id!: string;
    webrtcData!: webrtcData;
}
