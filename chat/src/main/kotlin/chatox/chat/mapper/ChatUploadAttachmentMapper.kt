package chatox.chat.mapper

import chatox.chat.api.response.ChatUploadAttachmentResponse
import chatox.chat.model.ChatUploadAttachment
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

@Component
class ChatUploadAttachmentMapper(private val userMapper: UserMapper,
                                 private val uploadMapper: UploadMapper) {
    @Autowired
    @Lazy
    private lateinit var messageMapper: MessageMapper

    fun <T>toChatUploadAttachmentResponse(chatUploadAttachment: ChatUploadAttachment<T>,
                                          mapMessage: Boolean = false
    ) = ChatUploadAttachmentResponse(
            id = chatUploadAttachment.id,
            createdAt = chatUploadAttachment.createdAt,
            message = if (mapMessage) messageMapper.toMessageResponse(
                    message = chatUploadAttachment.message!!,
                    mapReferredMessage = false,
                    readByCurrentUser = false
            ) else null,
            upload = uploadMapper.toUploadResponse(chatUploadAttachment.upload),
            uploadCreator = if (chatUploadAttachment.uploadCreator != null)
                userMapper.toUserResponse(chatUploadAttachment.uploadCreator!!)
                        else null,
            uploadSender = userMapper.toUserResponse(chatUploadAttachment.uploadSender)
    )
}
