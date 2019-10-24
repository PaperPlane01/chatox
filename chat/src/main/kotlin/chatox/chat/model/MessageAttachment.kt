package chatox.chat.model

data class MessageAttachment(
        var id: String,
        var type: MessageAttachmentType,
        var url: String
)
