"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
__exportStar(require("./resources"), exports);
/**
 * A thin client over the API. No caching, no multi request calls, etc.
 * Goal is maximum client support. Other layers can be added on top for common use cases.
 */
class Client {
    constructor(accessToken, baseUrl = 'https://api-bhrsx2hg5q-uc.a.run.app/api/') {
        var _a;
        const decodedToken = jsonwebtoken_1.default.decode(accessToken, { json: true });
        this.userId = (_a = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.sub) !== null && _a !== void 0 ? _a : '';
        this.axios = axios_1.default.create({
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            baseURL: baseUrl
        });
    }
    refreshToken(accessToken) {
        this.axios.defaults.headers['Authorization'] = 'Bearer ' + accessToken;
    }
    getRootStreams() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get('streams', {
                params: {
                    'exists[owner]': false
                }
            });
            return response.data;
        });
    }
    getStreamsByParent(parentStreamId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get('streams', {
                params: {
                    'owner.id': parentStreamId
                }
            });
            return response.data;
        });
    }
    getStream(streamId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get(`streams/${streamId}`);
            return response.data;
        });
    }
    createStream(name, description, discoverable, isPrivate, parentStreamId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.post('streams', Object.assign({ name: name, description: description, discoverable: discoverable, private: isPrivate }, parentStreamId && { owner: { id: parentStreamId } }));
            return response.data;
        });
    }
    getEventStream(streamId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get('events', {
                params: {
                    'stream.id': streamId
                }
            });
            return response.data;
        });
    }
    createInvite(streamId, expiration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!expiration) {
                expiration = new Date();
                expiration.setDate(expiration.getDate() + 1);
            }
            const response = yield this.axios.post('invites', {
                stream: {
                    id: streamId
                },
                expiration: expiration
            });
            return response.data;
        });
    }
    getStreamUsers(streamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get(`streams/${streamId}/streamUsers`, {
                params: Object.assign({}, userId && { 'user.id': userId })
            });
            return response.data;
        });
    }
    createStreamUser(streamId, userId, inviteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.post('streamUsers', Object.assign({ stream: {
                    id: streamId
                }, user: {
                    id: userId
                } }, inviteId && { invite: {
                    id: inviteId
                } }));
            return response.data;
        });
    }
    setLastSeenEvent(streamUserId, lastSeenEventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.patch(`streamUsers/${streamUserId}`, {
                lastSeenEvent: {
                    id: lastSeenEventId
                }
            }, {
                headers: {
                    'Content-Type': 'application/merge-patch+json'
                }
            });
            return response.data;
        });
    }
    deleteStreamUser(streamUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.axios.delete(`streamUsers/${streamUserId}`);
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    getSubscriptions(streamUserId, transport) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get('subscriptions', {
                params: Object.assign({ 'streamUser.id': streamUserId }, transport && { 'transport.id': transport })
            });
            return response.data;
        });
    }
    createSubscription(streamUserId, transport, eventTypes, transportData) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.post('subscriptions', Object.assign({ streamUser: {
                    id: streamUserId
                }, transport: {
                    id: transport
                }, eventTypes: eventTypes }, transportData && { transportData: transportData }));
            return response.data;
        });
    }
    createEvent(streamId, type, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Axios likes to not serialize some json, especially when it contains emojis, so we do that manually here.
            const response = yield this.axios.post('events', JSON.stringify(Object.assign({ stream: {
                    id: streamId
                }, type: type }, data && { eventData: { data: data } })), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        });
    }
    getEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get(`events/${eventId}`);
            return response.data;
        });
    }
    getUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get(`users/${userId}`);
            return response.data;
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get('users');
            return response.data;
        });
    }
    getTransports() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axios.get('transports');
            return response.data;
        });
    }
}
exports.Client = Client;
exports.default = Client;
