import Axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';

import { Event, Invite, Stream, StreamUser, Subscription, Transport, User } from './resources';

export * from './resources';

/**
 * A thin client over the API. No caching, no multi request calls, etc.
 * Goal is maximum client support. Other layers can be added on top for common use cases.
 */
export class Client {
  private readonly axios: AxiosInstance;
  public readonly userId: string;

  constructor(
    accessToken: string,
    baseUrl: string = 'https://api-bhrsx2hg5q-uc.a.run.app/api/'
  ) {
    const decodedToken = jwt.decode(accessToken, {json: true});

    this.userId = decodedToken?.sub ?? '';
    this.axios = Axios.create({
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      baseURL: baseUrl
    });
  }

  public refreshToken(accessToken: string) {
    this.axios.defaults.headers['Authorization'] = 'Bearer ' + accessToken;
  }

  public async getRootStreams(): Promise<Stream[]> {
    const response = await this.axios.get<Stream[]>('streams', {
      params: {
        'exists[owner]': false
      }
    });

    return response.data;
  }

  public async getStreamsByParent(parentStreamId: string): Promise<Stream[]> {
    const response = await this.axios.get<Stream[]>('streams', {
      params: {
        'owner.id': parentStreamId
      }
    });

    return response.data;
  }

  public async getStream(streamId: string): Promise<Stream> {
    const response = await this.axios.get(`streams/${streamId}`);

    return response.data;
  }

  public async createStream(
    name: string,
    description: string,
    discoverable: boolean,
    isPrivate: boolean,
    parentStreamId?: string,
  ): Promise<Stream> {
    const response = await this.axios.post<Stream>('streams', {
      name: name,
      description: description,
      discoverable: discoverable,
      private: isPrivate,
      ...parentStreamId && { owner: {id: parentStreamId}}
    });

    return response.data;
  }

  public async getEventStream(streamId: string): Promise<Event[]> {
    const response = await this.axios.get<Event[]>('events', {
      params: {
        'stream.id': streamId
      }
    });

    return response.data;
  }

  public async createInvite(
      streamId: string,
      expiration?: Date
  ): Promise<Invite> {
    if (!expiration) {
      expiration = new Date();
      expiration.setDate(expiration.getDate() + 1);
    }
    const response = await this.axios.post<Invite>('invites', {
      stream: {
        id: streamId
      },
      expiration: expiration
    });

    return response.data;
  }

  public async getStreamUsers(streamId: string, userId?: string): Promise<StreamUser[]> {
    const response = await this.axios.get<StreamUser[]>(`streams/${streamId}/streamUsers`, {
      params: {
        ...userId && { 'user.id': userId }
      }
    });

    return response.data;
  }

  public async createStreamUser(streamId: string, userId: string, inviteId?: string): Promise<StreamUser> {
    const response = await this.axios.post<StreamUser>('streamUsers', {
      stream: {
        id: streamId
      },
      user: {
        id: userId
      },
      ...inviteId && { invite: {
          id: inviteId
      } }
    });

    return response.data;
  }

  public async setLastSeenEvent(streamUserId: string, lastSeenEventId: string): Promise<StreamUser> {
    const response = await this.axios.patch<StreamUser>(`streamUsers/${streamUserId}`, {
      lastSeenEvent: {
        id: lastSeenEventId
      }
    });

    return response.data;
  }

  public async deleteStreamUser(streamUserId: string): Promise<boolean> {
    try {
      await this.axios.delete(`streamUsers/${streamUserId}`);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  public async getSubscriptions(streamUserId: string, transport?: string): Promise<Subscription[]> {
    const response = await this.axios.get<Subscription[]>('subscriptions', {
      params: {
        'streamUser.id': streamUserId,
        ...transport && { 'transport.id': transport }
      }
    });

    return response.data;
  }

  public async createSubscription(
      streamUserId: string,
      transport: string,
      eventTypes?: string[],
      transportData?: any
  ): Promise<Subscription> {
    const response = await this.axios.post<Subscription>('subscriptions', {
      streamUser: {
        id: streamUserId
      },
      transport: {
        id: transport
      },
      eventTypes: eventTypes,
      ...transportData && { transportData: transportData }
    });

    return response.data;
  }

  public async createEvent(streamId: string, type: string, data?: any): Promise<Event> {
    const response = await this.axios.post('events', {
      stream: {
        id: streamId
      },
      type: type,
      ...data && { eventData: data }
    });

    return response.data;
  }

  public async getUser(userId: string): Promise<User> {
    const response = await this.axios.get(`users/${userId}`);

    return response.data;
  }

  public async getUsers(): Promise<User[]> {
    const response = await this.axios.get('users');

    return response.data;
  }

  public async getTransports(): Promise<Transport[]> {
    const response = await this.axios.get('transports');

    return response.data;
  }
}

export default Client;