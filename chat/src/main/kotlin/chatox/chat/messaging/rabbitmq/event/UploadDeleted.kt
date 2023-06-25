package chatox.chat.messaging.rabbitmq.event

import chatox.chat.model.UploadType

data class UploadDeleted(
        val uploadId: String,
        val uploadType: UploadType,
        val deletionReasons: List<UploadDeletionReason>
)