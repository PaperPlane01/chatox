package chatox.user.repository

import chatox.user.domain.User
import chatox.user.domain.UserProfilePhoto
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UserProfilePhotoRepository : ReactiveMongoRepository<UserProfilePhoto, String> {
    fun findByIdAndUserId(id: String, userId: String): Mono<UserProfilePhoto>
    fun findByIdInAndUserId(ids: List<String>, userId: String): Flux<UserProfilePhoto>
    fun findByUserId(userId: String, sort: Sort): Flux<UserProfilePhoto>
    fun countByUserId(userId: String): Mono<Long>
    fun countByUserIdAndUploadIdNot(userId: String, uploadId: String): Mono<Long>
    fun findByUserIdAndUploadId(userId: String, uploadId: String): Mono<UserProfilePhoto>
}