package chatox.user.service.impl

import chatox.user.api.request.BanUserRequest
import chatox.user.api.request.UpdateBanRequest
import chatox.user.api.response.GlobalBanResponse
import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import chatox.user.exception.GlobalBanIsNotActiveException
import chatox.user.exception.GlobalBanNotFoundException
import chatox.user.exception.UserNotFoundException
import chatox.user.mapper.GlobalBanMapper
import chatox.user.repository.GlobalBanRepository
import chatox.user.repository.UserRepository
import chatox.user.security.AuthenticationFacade
import chatox.user.service.GlobalBanService
import chatox.user.support.pagination.PaginationRequest
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@Transactional
class GlobalBanServiceImpl(private val globalBanRepository: GlobalBanRepository,
                           private val userRepository: UserRepository,
                           private val globalBanMapper: GlobalBanMapper,
                           private val authenticationFacade: AuthenticationFacade) : GlobalBanService {

    override fun banUser(userId: String, banUserRequest: BanUserRequest): Mono<GlobalBanResponse> {
        return mono {
            val user = findUserById(userId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserEntity().awaitFirst()

            var otherActiveBans = globalBanRepository.findByBannedUserAndExpiresAtAfterOrPermanentTrueAndCanceledFalse(
                    bannedUser = user,
                    date = ZonedDateTime.now()
            )
                    .collectList()
                    .awaitFirst()

            if (otherActiveBans.isNotEmpty()) {
                otherActiveBans = otherActiveBans.map { ban -> ban.copy(
                        canceledAt = ZonedDateTime.now(),
                        cancelledBy = currentUser,
                        canceled = true
                )}
                globalBanRepository.saveAll(otherActiveBans).collectList().awaitFirst()
            }


            val globalBan = GlobalBan(
                    id = UUID.randomUUID().toString(),
                    createdAt = ZonedDateTime.now(),
                    expiresAt = banUserRequest.expiresAt,
                    bannedUser = user,
                    canceled = false,
                    permanent = banUserRequest.permanent,
                    reason = banUserRequest.reason,
                    createdBy = currentUser,
                    comment = banUserRequest.comment,
                    canceledAt = null,
                    updatedBy = null,
                    updatedAt = null,
                    cancelledBy = null
            )
            globalBanRepository.save(globalBan).awaitFirst()

            globalBanMapper.toGlobalBanResponse(globalBan)
        }
    }

    override fun updateBan(userId: String, banId: String, updateBanRequest: UpdateBanRequest): Mono<GlobalBanResponse> {
        return mono {
            val user = findUserById(userId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserEntity().awaitFirst()
            var ban = findBanByUserAndBanId(user, banId).awaitFirst()

            if (!isBanActive(ban)) {
                throw GlobalBanIsNotActiveException("Cannot update global ban if it's expired or canceled")
            }

            ban = ban.copy(
                    expiresAt = updateBanRequest.expiresAt,
                    permanent = updateBanRequest.permanent,
                    reason = updateBanRequest.reason,
                    comment = updateBanRequest.comment,
                    updatedAt = ZonedDateTime.now(),
                    updatedBy = currentUser
            )

            globalBanRepository.save(ban)

            globalBanMapper.toGlobalBanResponse(ban)
        }
    }

    override fun cancelBan(userId: String, banId: String): Mono<GlobalBanResponse> {
        return mono {
            val user = findUserById(userId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserEntity().awaitFirst()
            var ban = findBanByUserAndBanId(user, banId).awaitFirst()

            if (isBanActive(ban)) {
                throw GlobalBanIsNotActiveException("Cannot cancel ban which is not active")
            }

            ban = ban.copy(
                    canceled = true,
                    canceledAt = ZonedDateTime.now(),
                    cancelledBy = currentUser
            )
            globalBanRepository.save(ban).awaitFirst()

            globalBanMapper.toGlobalBanResponse(ban)
        }
    }

    override fun findBans(excludeExpired: Boolean, excludeCanceled: Boolean, paginationRequest: PaginationRequest): Flux<GlobalBanResponse> {
        val pageRequest = paginationRequest.toPageRequest()
        val result = if (excludeExpired) {
            if (excludeCanceled) {
                globalBanRepository.findByCanceledFalseAndExpiresAtAfter(ZonedDateTime.now(), pageRequest)
            } else{
                globalBanRepository.findByExpiresAtAfter(ZonedDateTime.now(), pageRequest)
            }
        } else if (excludeCanceled) {
            globalBanRepository.findByCanceledFalse(pageRequest)
        } else {
            globalBanRepository.findAllBy(pageRequest)
        }

        return result.map { globalBan -> globalBanMapper.toGlobalBanResponse(globalBan) }
    }

    private fun findUserById(userId: String) = userRepository.findById(userId)
            .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id $userId")))

    private fun isBanActive(ban: GlobalBan): Boolean {
        return !ban.canceled && (ban.permanent || (ban.expiresAt != null && ban.expiresAt!!.isAfter(ZonedDateTime.now())))
    }

    private fun findBanByUserAndBanId(user: User, banId: String) = globalBanRepository.findByUserAndId(
            user = user,
            id = banId
    )
            .switchIfEmpty(Mono.error(GlobalBanNotFoundException("Could not find global ban of user ${user.id} with id $banId")))
}
