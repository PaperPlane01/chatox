package chatox.user.service.impl

import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.api.response.SessionActivityStatusResponse
import chatox.user.api.response.UserSessionResponse
import chatox.user.domain.User
import chatox.user.domain.UserSession
import chatox.user.mapper.UserSessionMapper
import chatox.user.messaging.rabbitmq.event.UserConnected
import chatox.user.messaging.rabbitmq.event.UserDisconnected
import chatox.user.messaging.rabbitmq.event.UserOffline
import chatox.user.messaging.rabbitmq.event.UserOnline
import chatox.user.messaging.rabbitmq.event.producer.UserEventsProducer
import chatox.user.repository.UserRepository
import chatox.user.repository.UserSessionRepository
import chatox.user.service.UserSessionService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.cloud.client.discovery.DiscoveryClient
import org.springframework.http.MediaType
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@Transactional
class UserSessionServiceImpl(private val userSessionRepository: UserSessionRepository,
                             private val userRepository: UserRepository,
                             private val userSessionMapper: UserSessionMapper,
                             private val authenticationHolder: ReactiveAuthenticationHolder<User>,
                             private val userEventsProducer: UserEventsProducer,
                             private val discoveryClient: DiscoveryClient) : UserSessionService {

    private val log = LoggerFactory.getLogger(UserSessionServiceImpl::class.java)

    override fun userConnected(userConnected: UserConnected): Mono<Void> {
        return mono {
            log.debug("Received userConnected event $userConnected")
            val user = userRepository.findById(userConnected.userId).awaitFirstOrNull()

            if (user != null) {
                val userSession = UserSession(
                        id = UUID.randomUUID().toString(),
                        userAgent = userConnected.userAgent,
                        ipAddress = userConnected.ipAddress,
                        accessToken = userConnected.accessToken,
                        createdAt = ZonedDateTime.now(),
                        disconnectedAt = null,
                        userId = user.id,
                        socketIoId = userConnected.socketIoId
                )
                userSessionRepository.save(userSession).awaitFirst()

                if (!user.online) {
                    log.debug("Publishing userWentOnline event")
                    userEventsProducer.userWentOnline(UserOnline(
                            userId = user.id,
                            lastSeen = user.lastSeen
                    ))
                    userRepository.save(user.copy(online = true, lastSeen = ZonedDateTime.now())).awaitFirst()
                }
            }

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    override fun userDisconnected(userDisconnected: UserDisconnected): Mono<Void> {
        return mono {
            log.debug("Received userDisconnected event $userDisconnected")
            val userSession = userSessionRepository
                    .findBySocketIoId(userDisconnected.socketIoId)
                    .awaitSingleOrNull()
            val user = userRepository.findById(userDisconnected.userId).awaitFirstOrNull()

            if (userSession != null && user != null) {
                disconnectSessionAndCheckIfUserIsOffline(user, userSession).awaitFirstOrNull()
            }

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    override fun findActiveSessionsOfCurrentUser(): Flux<UserSessionResponse> {
        return mono {
            val user = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            userSessionRepository
                    .findByUserIdAndDisconnectedAtNull(user.id)
                    .map { userSessionMapper.toUserSessionResponse(it) }
        }
                .flatMapMany { it }
    }

    override fun findSessionsOfCurrentUser(paginationRequest: PaginationRequest): Flux<UserSessionResponse> {
        return mono {
            val user = authenticationHolder.requireCurrentUser().awaitFirst()

            userSessionRepository.findByUserId(user.id, paginationRequest.toPageRequest())
                    .map { userSessionMapper.toUserSessionResponse(it) }
        }
                .flatMapMany { it }
    }

    @Scheduled(cron = "0 0/5 * * * *")
    override fun checkOnlineStatusOfUsers() {
        mono {
            lookForInactiveSessions().awaitFirstOrNull()
            checkUsersWithOnlineStatus().awaitFirstOrNull()
        }
                .subscribe()
    }

    private fun lookForInactiveSessions(): Mono<Unit> {
        log.info("Looking for inactive sessions")
        val webClient = WebClient.create()

        return mono {
            val activeSessions = userSessionRepository.findByDisconnectedAtNullAndCreatedAtBefore(
                    ZonedDateTime.now().minusMinutes(5L)
            )
                    .collectList()
                    .awaitFirst()
            val sessionActivityMap = activeSessions.associate { it.id to false }.toMutableMap()

            log.debug("Active sessions are")
            log.debug("$activeSessions")

            if (activeSessions.size != 0)  {
                val eventsServiceInstances = discoveryClient.getInstances("events-service")

                eventsServiceInstances.forEach { instance ->
                    val host = instance.host
                    val port = instance.port

                    activeSessions.forEach { session ->
                        val url = "http://${host}:${port}/api/v1/sessions/${session.socketIoId}"

                        val sessionActivityStatusResponse = webClient
                                .get()
                                .uri(url)
                                .accept(MediaType.APPLICATION_JSON)
                                .retrieve()
                                .bodyToMono(SessionActivityStatusResponse::class.java)
                                .awaitFirst()

                        if (sessionActivityStatusResponse.active) {
                            sessionActivityMap[session.id] = true
                        }
                    }
                }

                log.debug("Session activity map")
                log.debug("$sessionActivityMap")

                if (sessionActivityMap.isNotEmpty()) {
                    val nonActiveSessions = activeSessions
                            .filter { session -> !sessionActivityMap[session.id]!! }
                            .map { session -> session.copy(disconnectedAt = ZonedDateTime.now()) }
                            .sortedByDescending { session -> session.disconnectedAt }
                    userSessionRepository.saveAll(nonActiveSessions).collectList().awaitFirst()

                    nonActiveSessions.forEach { session ->
                        val user = userRepository.findById(session.userId).awaitFirst()
                        disconnectSessionAndCheckIfUserIsOffline(user, session)
                    }
                }
            }
        }
    }

    private fun disconnectSessionAndCheckIfUserIsOffline(user: User, disconnectedSession: UserSession): Mono<Unit> {
        return mono {
            log.debug("Checking if user ${user.id} is offline")
            val otherSessionsCount = userSessionRepository.countByUserIdAndDisconnectedAtNullAndIdNot(
                    userId = user.id,
                    excludedId = disconnectedSession.id
            )
                    .awaitFirst()
            val disconnectedAt = ZonedDateTime.now()
            userSessionRepository.save(
                    disconnectedSession.copy(disconnectedAt = disconnectedAt)
            )
                    .awaitFirst()

            if (otherSessionsCount == 0L && user.online) {
                log.debug("Updating online status and publishing UserWentOffline event for user ${user.id}")
                userRepository.save(user.copy(
                        online = false,
                        lastSeen = disconnectedAt
                ))
                        .awaitFirst()
                userEventsProducer.userWentOffline(
                        UserOffline(
                                userId = user.id,
                                lastSeen = disconnectedAt
                        )
                )
            }
        }
    }

    private fun checkUsersWithOnlineStatus(): Mono<Unit> {
        return mono {
            log.debug("Checking users with online status")
            val onlineUsers = userRepository.findByOnlineTrue().collectList().awaitFirst()
            val usersToUpdate = mutableListOf<User>()
            val lastSeen = ZonedDateTime.now()

            onlineUsers.forEach { user ->
                val activeSessionsCount = userSessionRepository.countByUserIdAndDisconnectedAtNull(user.id).awaitFirst()

                if (activeSessionsCount == 0L) {
                    usersToUpdate.add(user.copy(online = false, lastSeen = lastSeen))
                }
            }

            if (usersToUpdate.isNotEmpty()) {
                userRepository.saveAll(usersToUpdate).collectList().awaitFirst()

                usersToUpdate.forEach { user ->
                    log.debug("Publishing UserOffline for user ${user.id}")
                    userEventsProducer.userWentOffline(
                            UserOffline(
                                    userId = user.id,
                                    lastSeen = user.lastSeen
                            )
                    )
                }
            }
        }
    }
}
