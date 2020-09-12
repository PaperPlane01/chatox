package chatox.chat.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.DBRef
import org.springframework.data.mongodb.core.mapping.Document
import java.time.ZonedDateTime

@Document(collection = "chatUploadAttachment")
data class ChatUploadAttachment<UploadMetadataType>(
        @Id
        var id: String,
        var type: UploadType,

        @DBRef
        var upload: Upload<UploadMetadataType>,

        @DBRef(lazy = true)
        var message: Message?,

        @DBRef(lazy = true)
        var chat: Chat,

        @DBRef
        var uploadCreator: User?,

        @DBRef
        var uploadSender: User,
        var createdAt: ZonedDateTime
)
