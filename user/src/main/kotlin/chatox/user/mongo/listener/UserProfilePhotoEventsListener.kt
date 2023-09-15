package chatox.user.mongo.listener

import chatox.user.domain.UserProfilePhoto
import chatox.user.mapper.UserProfilePhotoMapper
import chatox.user.messaging.rabbitmq.event.producer.UserProfilePhotoEventsProducer
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent
import org.springframework.stereotype.Component

@Component
class UserProfilePhotoEventsListener(
        private val userProfilePhotoEventsProducer: UserProfilePhotoEventsProducer,
        private val userProfilePhotoMapper: UserProfilePhotoMapper
) : AbstractMongoEventListener<UserProfilePhoto>() {

    override fun onAfterSave(event: AfterSaveEvent<UserProfilePhoto>) {
        userProfilePhotoEventsProducer.userProfilePhotoCreated(
                userProfilePhotoMapper.toUserProfilePhotoResponse(event.source)
        )
    }
}