package chatox.chat.repository.mongodb

import chatox.chat.model.UserGlobalNotificationsSettings
import org.springframework.data.mongodb.repository.ReactiveMongoRepository

interface UserGlobalNotificationsSettingsRepository : ReactiveMongoRepository<UserGlobalNotificationsSettings, String> {
}