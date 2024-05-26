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
}