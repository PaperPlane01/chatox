package chatox.user.service.impl

import chatox.user.api.response.SessionActivityStatusResponse
import chatox.user.api.response.UserSessionResponse
import chatox.user.domain.UserSession
import chatox.user.mapper.UserSessionMapper
import chatox.user.messaging.rabbitmq.event.UserConnected
import chatox.user.messaging.rabbitmq.event.UserDisconnected
import chatox.user.messaging.rabbitmq.event.UserOffline
import chatox.user.messaging.rabbitmq.event.UserOnline
import chatox.user.messaging.rabbitmq.event.producer.UserEventsProducer
import chatox.user.repository.UserRepository
import chatox.user.repository.UserSessionRepository
import chatox.user.security.AuthenticationFacade
import chatox.user.service.UserSessionService
import chatox.platform.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
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
                             private val authenticationFacade: AuthenticationFacade,
                             private val userEventsProducer: UserEventsProducer,
                             private val discoveryClient: DiscoveryClient) : UserSessionService {

    private val log = LoggerFactory.getLogger(UserSessionServiceImpl::class.java)

    override fun userConnected(userConnected: UserConnected): Mono<Void> {
        return mono {
            log.debug("Received userConnected event")
            val user = userRepository.findAndIncreaseActiveSessionsCount(userConnected.userId).awaitFirstOrNull()

            if (user != null) {
                log.debug("Number of active sessions of user ${user.id} is ${user.activeSessionsCount}")
                val shouldPublishUserWentOnline = user.activeSessionsCount == 1
                val userSession = UserSession(
                        id = UUID.randomUUID().toString(),
                        userAgent = userConnected.userAgent,
                        ipAddress = userConnected.ipAddress,
                        accessToken = userConnected.accessToken,
                        createdAt = ZonedDateTime.now(),
                        disconnectedAt = null,
                        user = user,
                        socketIoId = userConnected.socketIoId
                )
                userSessionRepository.save(userSession).awaitFirst()

                userRepository.updateLastSeenDateIfNecessary(user.id, userSession.createdAt).subscribe()

                if (shouldPublishUserWentOnline) {
                    log.debug("Publishing userWentOnline event")
                    userEventsProducer.userWentOnline(UserOnline(
                            userId = user.id,
                            lastSeen = user.lastSeen
                    ))
                }
            }

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    override fun userDisconnected(userDisconnected: UserDisconnected): Mono<Void> {
        return mono {
            log.debug("Received userDisconnected event")
            var userSession = userSessionRepository
                    .findBySocketIoId(userDisconnected.socketIoId)
                    .awaitFirstOrNull()
            var user = userRepository.findAndDecreaseActiveSessionsCount(userDisconnected.userId).awaitFirstOrNull()

            if (userSession != null && user != null) {
                log.debug("Number of active sessions of user ${user.id} is ${user.activeSessionsCount}")
                if (user.activeSessionsCount < 0) {
                    user = userRepository.findAndIncreaseActiveSessionsCount(
                            user.id,
                            user.activeSessionsCount * (-1)
                    )
                            .awaitFirst()
                }

                val shouldPublishUserDisconnected = user!!.activeSessionsCount == 0
                userSession = userSession.copy(
                        disconnectedAt = ZonedDateTime.now()
                )
                userSessionRepository.save(userSession).awaitFirst()
                userRepository.updateLastSeenDateIfNecessary(user.id, userSession.disconnectedAt!!).subscribe()

                if (shouldPublishUserDisconnected) {
                    log.debug("Publishing userWentOffline event")
                    userEventsProducer.userWentOffline(
                            UserOffline(
                                    userId = user.id,
                                    lastSeen = user.lastSeen
                            )
                    )
                }
            }

            Mono.empty<Void>()
        }
                .flatMap { it }
    }

    override fun findActiveSessionsOfCurrentUser(): Flux<UserSessionResponse> {
        return mono {
            val user = authenticationFacade.getCurrentUser().awaitFirst()

            userSessionRepository
                    .findByUserIdAndDisconnectedAtNull(user.id)
                    .map { userSessionMapper.toUserSessionResponse(it) }
        }
                .flatMapMany { it }
    }

    override fun findSessionsOfCurrentUser(paginationRequest: PaginationRequest): Flux<UserSessionResponse> {
        return mono {
            val user = authenticationFacade.getCurrentUser().awaitFirst()

            userSessionRepository.findByUserId(user.id, paginationRequest.toPageRequest())
                    .map { userSessionMapper.toUserSessionResponse(it) }
        }
                .flatMapMany { it }
    }

    @Scheduled(cron = "0 0/5 * * * *")
    override fun lookForInactiveSessions() {
        log.info("Looking for inactive sessions")
        val webClient = WebClient.create()
        val sessionActivityMap: MutableMap<String, Boolean> = HashMap()

        mono {
            val activeSessions = userSessionRepository.findByDisconnectedAtNullAndCreatedAtBefore(
                    ZonedDateTime.now().minusMinutes(5L)
            )
                    .collectList()
                    .awaitFirst()

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
                                .bodyToMono<SessionActivityStatusResponse>(SessionActivityStatusResponse::class.java)
                                .awaitFirst()
                        sessionActivityMap[session.id] = sessionActivityStatusResponse.active
                    }
                }

                log.debug("Session activity map")
                log.debug("$sessionActivityMap")

                if (sessionActivityMap.isNotEmpty()) {
                    val nonActiveSessions = activeSessions
                            .filter { session -> !sessionActivityMap[session.id]!! }
                            .map { session -> session.copy(disconnectedAt = ZonedDateTime.now()) }
                    userSessionRepository.saveAll(nonActiveSessions).collectList().awaitFirst()

                    nonActiveSessions.forEach { session ->
                        val user = userRepository.findAndDecreaseActiveSessionsCount(session.user.id).awaitFirst()
                        userRepository.updateLastSeenDateIfNecessary(session.user.id, session.disconnectedAt!!).subscribe()
                        val shouldPublishWentOffline = user.activeSessionsCount == 0

                        if (shouldPublishWentOffline) {
                            userEventsProducer.userWentOffline(
                                    UserOffline(
                                            userId = session.user.id,
                                            lastSeen = session.disconnectedAt!!
                                    )
                            )
                        }
                     }
                }
            }

            Mono.empty<Void>()
        }
                .flatMap { it }
                .subscribe()
    }
}
