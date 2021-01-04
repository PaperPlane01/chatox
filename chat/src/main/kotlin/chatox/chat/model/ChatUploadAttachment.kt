package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chatUploadAttachment")
data class ChatUploadAttachment<UploadMetadataType>(
        @Id
        var id: String,
        var type: UploadType,

        var upload: Upload<UploadMetadataType>,

        @Indexed
        var uploadId: String,

        @Indexed
        var messageId: String? = null,

        var chat: Chat,

        @Indexed
        var chatId: String? = null,

        @Indexed
        var uploadCreatorId: String? = null,

        @Indexed
        var uploadSenderId: String? = null,
        var createdAt: ZonedDateTime
)
