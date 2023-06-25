package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document
data class ChatUploadAttachment<UploadMetadataType>(
        @Id
        val id: String,
        val type: UploadType,

        val upload: Upload<UploadMetadataType>,

        @Indexed
        val uploadId: String,

        @Indexed
        val messageId: String? = null,

        @Indexed
        val chatId: String? = null,

        @Indexed
        val uploadCreatorId: String? = null,

        @Indexed
        val uploadSenderId: String? = null,
        val createdAt: ZonedDateTime
)
