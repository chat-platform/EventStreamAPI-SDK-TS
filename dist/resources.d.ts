export interface User {
    id: string;
}
export interface Stream {
    id: string;
    name: string;
    description: string;
    discoverable: boolean;
    private: boolean;
    owner?: Stream;
}
export interface StreamUser {
    id: string;
    user: User;
    stream: Stream;
    lastSeenEvent?: Event;
    invite?: Invite;
}
interface EventData {
    data: string;
}
export interface Event {
    id: string;
    type: string;
    stream: Pick<Stream, 'id'>;
    datetime: Date;
    user: User;
    eventData?: EventData;
    transport?: Transport;
}
export interface Transport {
    name: string;
}
export interface Subscription {
    id: string;
    transport: Transport;
    eventTypes?: string[];
    streamUser: StreamUser;
    transportData?: string;
}
export interface Invite {
    id: string;
    stream: Pick<Stream, 'id'>;
    expiration: Date;
    invitedStreamUser?: StreamUser;
}
export {};
