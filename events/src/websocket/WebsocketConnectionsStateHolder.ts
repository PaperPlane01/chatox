import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Socket} from "socket.io";
import {parse, ParsedUrlQuery} from "querystring";
import {DisconnectionResult, JwtPayload, WebsocketEvent} from "./types";
import {PersistentWebsocketEvent, PersistentWebsocketEventDocument} from "./entities";
import {ChatParticipationService} from "../chat-participation";
import {LoggerFactory} from "../logging";
import {ChatFeatures} from "../chat-roles";

@Injectable()
export class WebsocketConnectionsStateHolder {
    /**
     * key: userId, value: sockets
     */
    private usersToSockets = new Map<string, Socket[]>();

    /**
     * key: socketId, value: user id
     */
    private socketsToUsers = new Map<string, string>();

    /**
     *
     * key: userId, value: ids of chats
     */
    private usersToChats = new Map<string, string[]>();

    /**
     * key: chatId, value: ids of users
     */
    private chatsToUsers = new Map<string, string[]>()

    /**
     * key: chatId, value: sockets
     */
    private chatParticipantsSubscriptions = new Map<string, Socket[]>();

    /**
     * key: chatId, value: sockets
     */
    private nonParticipantsChatSubscriptions = new Map<string, Socket[]>();

    /**
     * key: socketId, value: chatsIds
     */
    private nonParticipantsSocketsSubscribedToChats = new Map<string, string[]>();

    private readonly log = LoggerFactory.getLogger(WebsocketConnectionsStateHolder);


    constructor(private readonly chatParticipationService: ChatParticipationService,
                private readonly jwtService: JwtService,
                @InjectModel(PersistentWebsocketEvent.name) private readonly websocketEventModel: Model<PersistentWebsocketEventDocument>) {
    }

    public async handleConnection(socket: Socket): Promise<JwtPayload & {accessToken: string} | undefined> {
        const userInfo = await this.getJwtPayload(this.getQueryParameters(socket));

        if (!userInfo) {
            return undefined;
        }

        const chatParticipations = await this.chatParticipationService.findByUserId(userInfo.user_id);

        if (this.usersToSockets.has(userInfo.user_id)) {
            this.usersToSockets.get(userInfo.user_id)?.push(socket);
        } else {
            this.usersToSockets.set(userInfo.user_id, [socket]);
        }

        this.socketsToUsers.set(socket.id, userInfo.user_id);

        chatParticipations.forEach(chatParticipation => {
            if (this.chatParticipantsSubscriptions.has(chatParticipation.chatId)) {
                this.chatParticipantsSubscriptions.get(chatParticipation.chatId)?.push(socket);
            } else {
                this.chatParticipantsSubscriptions.set(chatParticipation.chatId, [socket]);
            }

            if (this.usersToChats.has(chatParticipation.userId)) {
                this.usersToChats.get(chatParticipation.userId)?.push(chatParticipation.chatId);
            } else {
                this.usersToChats.set(chatParticipation.userId, [chatParticipation.chatId]);
            }

            if (this.chatsToUsers.has(chatParticipation.chatId)) {
                this.chatsToUsers.get(chatParticipation.chatId)?.push(chatParticipation.userId);
            } else {
                this.chatsToUsers.set(chatParticipation.chatId, [chatParticipation.userId]);
            }
        });

        return userInfo;
    }

    private getQueryParameters(socket: Socket): ParsedUrlQuery {
        if (typeof socket.handshake.query === "object") {
            return socket.handshake.query;
        }

        return parse(socket.handshake.query);
    }

    private async getJwtPayload(queryParameters: ParsedUrlQuery): Promise<JwtPayload & {accessToken: string} | undefined> {
        if (!queryParameters.accessToken) {
            return undefined;
        }

        const jwtPayload =  await this.jwtService.verifyAsync<JwtPayload>(queryParameters.accessToken as string);

        return {...jwtPayload, accessToken: queryParameters.accessToken as string};
    }

    public handleDisconnect(disconnectedSocket: Socket): DisconnectionResult {
        const {userId, noMoreConnections} = this.removeSocketFromUsersToSocketsMap(disconnectedSocket);
        this.removeSocketFromChatParticipantsSubscriptions(
            disconnectedSocket,
            userId,
            noMoreConnections
        );
        this.removeSocketFromNonChatParticipantsSubscription(disconnectedSocket);
        this.socketsToUsers.delete(disconnectedSocket.id);

        return {
            userId,
            noMoreConnections
        };
    }

    private removeSocketFromUsersToSocketsMap(disconnectedSocket: Socket): DisconnectionResult {
        let noMoreConnections = false;
        let userId: string | undefined = undefined;

        for (const [connectedUserId, sockets] of this.usersToSockets.entries()) {
            if (this.removeSocketFromArray(disconnectedSocket, sockets)) {
                if (sockets.length === 0) {
                    noMoreConnections = true;
                    this.usersToSockets.delete(userId);
                }

                userId = connectedUserId;
                break;
            }
        }

        return {
            noMoreConnections,
            userId
        };
    }

    private removeSocketFromChatParticipantsSubscriptions(
        disconnectedSocket: Socket,
        disconnectedUserId: string,
        noMoreConnections: boolean
    ): void {
        const chatsIds = this.usersToChats.get(disconnectedUserId);

        if (!chatsIds) {
            return;
        }

        chatsIds.forEach(chatId => {
            const connectedSockets = this.chatParticipantsSubscriptions.get(chatId);

            if (connectedSockets) {
                this.removeSocketFromArray(disconnectedSocket, connectedSockets);

                if (connectedSockets.length === 0) {
                    this.chatParticipantsSubscriptions.delete(chatId);
                }
            }

            const usersIds = this.chatsToUsers.get(chatId);

            if (usersIds) {
                const userIndex = usersIds.indexOf(disconnectedUserId);

                if (userIndex > -1) {
                    usersIds.splice(userIndex, 1);
                }

                if (usersIds.length === 0) {
                    this.chatsToUsers.delete(chatId);
                }
            }
        });

        if (noMoreConnections) {
            this.usersToChats.delete(disconnectedUserId);
        }
    }

    private removeSocketFromNonChatParticipantsSubscription(disconnectedSocket: Socket): void {
        if (!this.nonParticipantsSocketsSubscribedToChats.has(disconnectedSocket.id)) {
            return;
        }

        const chatsIds = this.nonParticipantsSocketsSubscribedToChats.get(disconnectedSocket.id) || [];

        this.nonParticipantsSocketsSubscribedToChats.delete(disconnectedSocket.id);

        if (chatsIds.length === 0) {
            return;
        }

        chatsIds.forEach(chatId => {
            const sockets = this.nonParticipantsChatSubscriptions.get(chatId);
            this.removeSocketFromArray(disconnectedSocket, sockets);

            if (sockets.length === 0) {
                this.nonParticipantsChatSubscriptions.delete(chatId);
            }
        });
    }

    private removeSocketFromArray(socket: Socket, sockets: Socket[]): boolean {
        let socketIndex = -1;
        let removed = false;

        for (let index = 0; index < sockets.length; index++) {
            const currentSocket = sockets[index];

            if (currentSocket.id === socket.id) {
                socketIndex = index;
                removed = true;
                break;
            }
        }

        if (socketIndex > -1) {
            sockets.splice(socketIndex, 1);
        }

        return removed;
    }

    public addUserToChat(userId: string, chatId: string): void {
        const sockets = this.usersToSockets.get(userId);

        if (sockets?.length === 0) {
            return;
        }

        if (this.usersToChats.has(userId)) {
            this.usersToChats.get(chatId).push(userId);
        } else {
            this.usersToChats.set(userId, [chatId]);
        }

        if (this.chatParticipantsSubscriptions.has(chatId)) {
            this.chatParticipantsSubscriptions.get(chatId).push(...sockets);
        } else {
            this.chatParticipantsSubscriptions.set(chatId, sockets);
        }
    }

    public removeUserFromChat(userId: string, chatId: string): void {
        const sockets = this.usersToSockets.get(userId);

        if (sockets?.length === 0) {
            return;
        }

        if (this.usersToChats.has(userId)) {
            const index = this.usersToChats.get(userId)?.indexOf(chatId);

            if (index > -1) {
                this.usersToChats.get(userId)?.splice(index, 1);
            }

            if (this.usersToSockets.get(userId)?.length === 0) {
                this.usersToChats.delete(userId);
            }
        }

        const chatSockets = this.chatParticipantsSubscriptions.get(chatId);

        if (chatSockets?.length !== 0) {
            sockets.forEach(socket => this.removeSocketFromArray(socket, chatSockets));
        }
    }

    public subscribeSocketToChat(socket: Socket, chatId: string): void {
        if (this.nonParticipantsChatSubscriptions.has(chatId)) {
            this.nonParticipantsChatSubscriptions.get(chatId)?.push(socket);
        } else {
            this.nonParticipantsChatSubscriptions.set(chatId, [socket]);
        }

        if (this.nonParticipantsSocketsSubscribedToChats.has(chatId)) {
            this.nonParticipantsSocketsSubscribedToChats.get(chatId)?.push(socket.id);
        } else {
            this.nonParticipantsSocketsSubscribedToChats.set(chatId, [socket.id]);
        }
    }

    public unsubscribeSocketFromChat(socket: Socket, chatId: string): void {
        const existingSockets = this.nonParticipantsChatSubscriptions.get(chatId);

        if (existingSockets?.length !== 0) {
            this.removeSocketFromArray(socket, existingSockets);

            if (existingSockets.length === 0) {
                this.nonParticipantsChatSubscriptions.delete(chatId);
            }
        }

        const existingSocketsIds = this.nonParticipantsSocketsSubscribedToChats.get(chatId);

        if (existingSockets?.length !== 0) {
            const index = existingSocketsIds.indexOf(socket.id);

            if (index > -1) {
                existingSocketsIds.splice(index, 1);
            }

            if (existingSocketsIds.length === 0) {
                this.nonParticipantsSocketsSubscribedToChats.delete(chatId);
            }
        }
    }

    public async publishEventToChatParticipants(chatId: string, event: WebsocketEvent): Promise<void> {
        const sockets = this.chatParticipantsSubscriptions.get(chatId) ?? [];
        const recipients: string[] = this.emitEventForSocketsAndGetRecipients(sockets, event);

        if (recipients.length !== 0) {
            this.saveEvent(event, recipients);
        }
    }

    public async publishEventToChatParticipantsWithEnabledFeatures(
        chatId: string,
        event: WebsocketEvent,
        ...features: Array<keyof ChatFeatures>
    ): Promise<void> {
        const usersIds = this.chatsToUsers.get(chatId) || [];

        if (usersIds.length === 0) {
            return;
        }

        const usersWithFeatures = (await this.chatParticipationService.findChatParticipationsByUsersWithEnabledFeatures(
            chatId,
            usersIds,
            features
        ))
            .map(chatParticipation => chatParticipation.userId);

        await this.publishEventToUsers(usersWithFeatures, event);
        this.saveEvent(event, usersWithFeatures);
    }

    public async publishEventToUsersSubscribedToChat(chatId: string, event: WebsocketEvent): Promise<void> {
        const sockets = this.nonParticipantsChatSubscriptions.get(chatId) || [];
        const recipients = this.emitEventForSocketsAndGetRecipients(sockets, event);

        if (recipients.length !== 0) {
            this.saveEvent(event, recipients);
        }
    }

    private emitEventForSocketsAndGetRecipients(sockets: Socket[], event: WebsocketEvent): string[] {
        const recipients: string[] = [];

        if (sockets.length !== 0) {
            sockets.forEach(socket => {
                socket.emit(event.type, event);

                if (this.socketsToUsers.has(socket.id)) {
                    recipients.push(this.socketsToUsers.get(socket.id));
                }
            });
        }

        return recipients;
    }

    public async publishEventToUsers(usersIds: string[], event: WebsocketEvent): Promise<void> {
        usersIds.forEach(userId => {
            this.usersToSockets.get(userId)?.forEach(socket => socket.emit(event.type, event));
        });
        this.saveEvent(event, usersIds);
    }

    private async saveEvent(event: WebsocketEvent, recipients: string[]): Promise<void> {
        const persistentEvent = new this.websocketEventModel({
            recipients,
            ...event
        });
        await persistentEvent.save();
    }

    public isSocketActive(socketId: string): boolean {
        return this.socketsToUsers.has(socketId);
    }

    public getSocketIdsOfUser(userId: string): string[] {
        return this.usersToSockets.get(userId)?.map(socket => socket.id) ?? [];
    }
}