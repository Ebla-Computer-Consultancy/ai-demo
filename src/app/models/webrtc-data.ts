import { IceServers } from './ice-servers';

export class webrtcData {
    offer!: Offer;
    iceServers: IceServers[] = [];
}

class Offer {
    type!: 'offer';
    sdp!: string;
}
