package chatox.chat.messaging.rabbitmq.event

data class UploadDeletionReason(
        val deletionReasonType: UploadDeletionReasonType,
        val sourceObjectId: String?
)
