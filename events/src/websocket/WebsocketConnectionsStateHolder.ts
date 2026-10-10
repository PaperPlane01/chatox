import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Server, Socket} from "socket.io";
import {parse, ParsedUrlQuery} from "querystring";
import {DisconnectionResult, JwtPayload, WebsocketEvent} from "./types";
import {PersistentWebsocketEvent, PersistentWebsocketEventDocument} from "./entities";
import {ChatParticipationService} from "../chat-participation";
import {LoggerFactory} from "../logging";
import {ChatFeatures} from "../chat-roles";

const USER_ROOM_PREFIX = "user-";

@Injectable()
export class WebsocketConnectionsStateHolder {
    private connectedSockets = new Set<string>();

    private server: Server;

    private readonly log = LoggerFactory.getLogger(WebsocketConnectionsStateHolder);

    constructor(private readonly chatParticipationService: ChatParticipationService,
                private readonly jwtService: JwtService,
                @InjectModel(PersistentWebsocketEvent.name) private readonly websocketEventModel: Model<PersistentWebsocketEventDocument>) {
    }

    public setServer(server: Server): void {
        this.server = server;
    }

    public async handleConnection(socket: Socket): Promise<JwtPayload & {accessToken: string} | undefined> {
        const userInfo = await this.getJwtPayload(this.getQueryParameters(socket));

        if (!userInfo) {
            return undefined;
        }

        const chatParticipations = await this.chatParticipationService.findByUserId(userInfo.user_id);
        const chatIds = chatParticipations.map(chatParticipation => chatParticipation.chatId);
        socket.join(chatIds);
        socket.userId = userInfo.user_id;
        socket.join(`${USER_ROOM_PREFIX}${userInfo.user_id}`);

        this.connectedSockets.add(socket.id);

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

    public handleDisconnect(disconnectedSocket: Socket): Promise<DisconnectionResult> {
        this.connectedSockets.delete(disconnectedSocket.id);
        return this.removeSocketFromUsersToSocketsMap(disconnectedSocket);
    }

    private async removeSocketFromUsersToSocketsMap(disconnectedSocket: Socket): Promise<DisconnectionResult> {
        const noMoreConnections = !(await this.server.fetchSockets())
            .some(socket => socket.userId === disconnectedSocket.userId);
        const userId = disconnectedSocket.userId;
        return {
            noMoreConnections,
            userId
        };
    }

    public async addUserToChat(userId: string, chatId: string): Promise<void> {
        this.log.log(`Adding user ${userId} to chat ${chatId}`);

        const sockets = await this.server.in(this.getUserRoom(userId)).fetchSockets();

        if (sockets.length === 0) {
            this.log.log(`User ${userId} doesn't have sockets, exiting`);
            return;
        }

        sockets.forEach(socket => socket.join(chatId));
    }

    public addSocketToChat(socket: Socket, chatId: string): void {
        socket.join(chatId);
    }

    public async removeUserFromChat(userId: string, chatId: string): Promise<void> {
        const sockets = (await this.server.in(this.getUserRoom(userId)).fetchSockets())
            .filter(socket => socket.userId === userId);

        if (sockets.length === 0) {
            return;
        }

        sockets.forEach(socket => socket.leave(chatId));
    }

    public removeSocketFromChat(socket: Socket, chatId: string): void {
        socket.leave(chatId);
    }

    public publishEventToChat(chatId: string, event: WebsocketEvent): void {
        const broadcast = this.server.to(chatId);
        broadcast.emit(event.type, event);

        broadcast.fetchSockets().then(sockets => {
            const recipients = sockets
                .map(socket => socket.userId)
                .filter(userId => userId !== null && userId !== undefined);

            if (recipients.length !== 0) {
                this.saveEvent(event, recipients);
            }
        })
    }

    public async publishEventToChatParticipantsWithEnabledFeatures(
        chatId: string,
        event: WebsocketEvent,
        ...features: Array<keyof ChatFeatures>
    ): Promise<void> {
        const sockets = await this.server.to(chatId).fetchSockets();
        const usersIds = sockets
            .flatMap(socket => [...socket.rooms])
            .filter(roomId => roomId.startsWith(USER_ROOM_PREFIX))
            .map(roomId => roomId.substring(USER_ROOM_PREFIX.length));

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

    public async publishEventToUsers(usersIds: string[], event: WebsocketEvent): Promise<void> {
        this.server.to(usersIds.map(this.getUserRoom)).emit(event.type, event);
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
        return this.connectedSockets.has(socketId);
    }

    public async getSocketIdsOfUser(userId: string): Promise<string[]> {
        const sockets = await this.server.to(this.getUserRoom(userId))
            .fetchSockets();
        return sockets.map(socket => socket.id);
    }

    private getUserRoom(userId: string): string {
        return `${USER_ROOM_PREFIX}${userId}`;
    }
}