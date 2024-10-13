package chatox.chat.model

data class MessageUpdateResult<T: MessageInterface>(
        val initialMessage: T,
        val updatedMessage: T,
        val newChatUploadAttachments: List<ChatUploadAttachment<*>>,
        val chatUploadsAttachmentsToRemove: List<ChatUploadAttachment<*>>,
        val newMentionedChatParticipants: List<ChatParticipation>,
        val unmentionedChatParticipants: List<ChatParticipation>
)
