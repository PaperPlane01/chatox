package chatox.chat.model

import com.fasterxml.jackson.annotation.JsonProperty

enum class NotificationSound {
   @JsonProperty("ding")
   DING,

    @JsonProperty("happy-pop-1")
    HAPPY_POP_1,

    @JsonProperty("happy-pop-2")
    HAPPY_POP_2,

    @JsonProperty("happy-pop-3")
    HAPPY_POP_3,

    @JsonProperty("jug-pop-1")
    JUG_POP_1,

    @JsonProperty("livechat")
    LIVECHAT,

    @JsonProperty("message-notification")
    MESSAGE_NOTIFICATION,

    @JsonProperty("music-box")
    MUSIC_BOX,

    @JsonProperty("new_notification_7")
    NEW_NOTIFICATION_7,

    @JsonProperty("notification-sound")
    NOTIFICATION_SOUND,

    @JsonProperty("simple-notification")
    SIMPLE_NOTIFICATION,

    @JsonProperty("start")
    START,

    @JsonProperty("system-notification")
    SYSTEM_NOTIFICATION
}