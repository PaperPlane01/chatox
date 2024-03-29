package chatox.user.service.impl

import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.api.response.BlacklistStatusResponse
import chatox.user.api.response.UserResponse
import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.domain.User
import chatox.user.domain.UserBlacklist
import chatox.user.domain.UserBlacklistEntry
import chatox.user.exception.UserHasAlreadyBeenBlacklistedException
import chatox.user.exception.UserNotFoundException
import chatox.user.mapper.UserMapper
import chatox.user.messaging.rabbitmq.event.UserAddedToBlacklist
import chatox.user.messaging.rabbitmq.event.UserRemovedFromBlacklist
import chatox.user.messaging.rabbitmq.event.producer.BlacklistEventsProducer
import chatox.user.repository.UserBlacklistRepository
import chatox.user.repository.UserRepository
import chatox.user.service.UserBlacklistService
import chatox.user.service.UserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
class UserBlacklistServiceImpl(private val userBlacklistRepository: UserBlacklistRepository,
                               private val userRepository: UserRepository,
                               private val userService: UserService,
                               private val userReactiveRepositoryCacheWrapper: UserReactiveRepositoryCacheWrapper,
                               private val blacklistEventsProducer: BlacklistEventsProducer,
                               private val userMapper: UserMapper,
                               private val authenticationHolder: ReactiveAuthenticationHolder<User>) : UserBlacklistService {

    override fun blacklistUser(userId: String): Flux<UserResponse> {
        return mono {
            val blacklist = getBlacklistOfCurrentUserOrCreate().awaitFirst()
            val usersIds = blacklist.entries.map { entry -> entry.userId }.toMutableList()

            val blacklistedUser = userReactiveRepositoryCacheWrapper.findById(userId).awaitFirstOrNull()
                    ?: throw UserNotFoundException("Could not find user with id $userId")

            if (usersIds.contains(userId)) {
                throw UserHasAlreadyBeenBlacklistedException("User with id $userId has already been blacklisted")
            }

            val newEntries = blacklist.entries.toMutableList()
            newEntries.add(UserBlacklistEntry(
                    userId = blacklistedUser.id,
                    createdAt = ZonedDateTime.now()
            ))

            userBlacklistRepository.save(blacklist.copy(entries = newEntries)).awaitFirst()

            val users = userRepository.findAllById(usersIds).collectList().awaitFirst()

            val currentUser = authenticationHolder.requireCurrentUser().awaitFirst()
            Mono.fromRunnable<Unit> { blacklistEventsProducer.userAddedToBlacklist(UserAddedToBlacklist(
                    userId = userId,
                    addedById = currentUser.id
            )) }
                    .awaitFirstOrNull()

            return@mono Flux.fromIterable(users.map { user -> userMapper.toUserResponse(user) })
        }
                .flatMapMany { it }
    }

    override fun removeUserFromBlackList(userId: String): Flux<UserResponse> {
        return mono {
            val blacklist = getBlacklistOfCurrentUserOrCreate().awaitFirst()
            val newEntries = blacklist.entries.filter { entry -> entry.userId != userId }

            userBlacklistRepository.save(blacklist.copy(entries = newEntries)).awaitFirst()

            val users = userRepository.findAllById(newEntries.map { entry -> entry.userId }.toMutableList()).collectList().awaitFirst()

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            Mono.fromRunnable<Unit> { blacklistEventsProducer.userRemovedFromBlacklist(UserRemovedFromBlacklist(
                    userId = userId,
                    removedById = currentUser.id
            )) }

            return@mono Flux.fromIterable(users.map { user -> userMapper.toUserResponse(user) })
        }
                .flatMapMany { it }
    }

    override fun getBlacklistOfCurrentUser(): Flux<UserResponse> {
        return mono {
            val usersIds = getBlacklistOfCurrentUserOrCreate().awaitFirst().entries.map { entry -> entry.userId }
            val users = userRepository.findAllById(usersIds.toMutableList()).collectList().awaitFirst()

            return@mono Flux.fromIterable(users.map { user -> userMapper.toUserResponse(user) })
        }
                .flatMapMany { it }
    }

    override fun getBlacklistStatus(userId: String): Mono<BlacklistStatusResponse> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val userBlacklist = getBlacklistOfUserOrCreate(userId).awaitFirst()
            val currentUserBlacklisted = userBlacklist.entries.any { entry -> entry.userId == currentUser.id }

            return@mono BlacklistStatusResponse(blacklisted = currentUserBlacklisted)
        }
    }

    override fun isUserBlacklisted(checkedUserId: String, blacklistOwnerId: String): Mono<Boolean> {
        return mono {
            val blacklist = getBlacklistOfUserOrCreate(blacklistOwnerId).awaitFirst()

            return@mono blacklist.entries.any { entry -> entry.userId == checkedUserId }
        }
    }

    private fun getBlacklistOfCurrentUserOrCreate(): Mono<UserBlacklist> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            return@mono getBlacklistOfUserOrCreate(currentUser.id).awaitFirst()
        }
    }

    private fun getBlacklistOfUserOrCreate(userId: String): Mono<UserBlacklist> {
       return mono {
           val userBlacklist = userBlacklistRepository.findByUserId(userId).awaitFirstOrNull()

           if (userBlacklist == null) {
               userService.assertUserExists(userId).awaitFirstOrNull()

               return@mono userBlacklistRepository.save(UserBlacklist(
                       id = UUID.randomUUID().toString(),
                       entries = mutableListOf(),
                       userId = userId
               ))
                       .awaitFirst()
           } else {
               return@mono userBlacklist
           }
       }
    }
}
