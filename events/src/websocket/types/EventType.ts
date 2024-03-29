export enum EventType {
    MESSAGE_CREATED = "MESSAGE_CREATED",
    MESSAGE_UPDATED = "MESSAGE_UPDATED",
    MESSAGE_DELETED = "MESSAGE_DELETED",
    CHAT_UPDATED = "CHAT_UPDATED",
    CHAT_DELETED = "CHAT_DELETED",
    USER_JOINED_CHAT = "USER_JOINED_CHAT",
    USER_LEFT_CHAT = "USER_LEFT_CHAT",
    USER_KICKED_FROM_CHAT = "USER_KICKED_FROM_CHAT",
    USER_BLOCKED_IN_CHAT = "USER_BLOCKED_IN_CHAT",
    USER_UPDATED = "USER_UPDATED",
    USER_DELETED = "USER_DELETED",
    CHAT_SUBSCRIPTION = "CHAT_SUBSCRIPTION",
    CHAT_UNSUBSCRIPTION = "CHAT_UNSUBSCRIPTION",
    MESSAGES_DELETED = "MESSAGES_DELETED",
    CHAT_BLOCKING_CREATED = "CHAT_BLOCKING_CREATED",
    CHAT_BLOCKING_UPDATED = "CHAT_BLOCKING_UPDATED",
    CHAT_PARTICIPANT_WENT_ONLINE = "CHAT_PARTICIPANT_WENT_ONLINE",
    CHAT_PARTICIPANT_WENT_OFFLINE = "CHAT_PARTICIPANT_WENT_OFFLINE",
    GLOBAL_BAN_CREATED = "GLOBAL_BAN_CREATED",
    GLOBAL_BAN_UPDATED = "GLOBAL_BAN_UPDATED",
    MESSAGE_PINNED = "MESSAGE_PINNED",
    MESSAGE_UNPINNED = "MESSAGE_UNPINNED",
    SCHEDULED_MESSAGE_CREATED = "SCHEDULED_MESSAGE_CREATED",
    SCHEDULED_MESSAGE_UPDATED = "SCHEDULED_MESSAGE_UPDATED",
    SCHEDULED_MESSAGE_PUBLISHED = "SCHEDULED_MESSAGE_PUBLISHED",
    SCHEDULED_MESSAGE_DELETED = "SCHEDULED_MESSAGE_DELETED",
    MESSAGE_READ = "MESSAGE_READ",
    PRIVATE_CHAT_CREATED = "PRIVATE_CHAT_CREATED",
    CHAT_ROLE_CREATED = "CHAT_ROLE_CREATED",
    CHAT_ROLE_UPDATED = "CHAT_ROLE_UPDATED",
    CHAT_PARTICIPANT_UPDATED = "CHAT_PARTICIPANT_UPDATED",
    BALANCE_UPDATED = "BALANCE_UPDATED",
    USER_STARTED_TYPING = "USER_STARTED_TYPING"
}
