export enum NotificationLevel {
	MUTED = "MUTED",
	MENTIONS_AND_REPLIES = "MENTIONS_AND_REPLIES",
	ALL_MESSAGES = "ALL_MESSAGES"
}

export const getNotificationLevel = (notificationLevel: NotificationLevel) => {
	switch (notificationLevel) {
		case NotificationLevel.ALL_MESSAGES:
			return 2;
		case NotificationLevel.MENTIONS_AND_REPLIES:
			return 1;
		case NotificationLevel.MUTED:
			return 0;
	}
};

export const NOTIFICATION_LEVELS: NotificationLevel[] = [
	NotificationLevel.MUTED,
	NotificationLevel.MENTIONS_AND_REPLIES,
	NotificationLevel.ALL_MESSAGES
];
