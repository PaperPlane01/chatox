package chatox.user.security

import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import chatox.user.mapper.GlobalBanMapper
import chatox.user.mapper.UploadMapper
import chatox.user.repository.GlobalBanRepository
import chatox.user.repository.UserRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Component
@Transactional
class AuthenticationFacade(private val userRepository: UserRepository,
                           private val globalBanRepository: GlobalBanRepository,
                           private val uploadMapper: UploadMapper,
                           private val globalBanMapper: GlobalBanMapper,
                           private val userReactiveRepositoryCacheWrapper: UserReactiveRepositoryCacheWrapper) {

    fun getCurrentUserEntity(): Mono<User> {
        return getCurrentAuthentication()
                .map { authentication -> userRepository.findById(authentication.customUserDetails.id) }
                .flatMap { user -> user }
    }

    fun isCurrentUserBannedGlobally(): Mono<Boolean> {
        return mono {
            val authentication = getCurrentAuthentication().awaitFirst()

            if (authentication.customUserDetails.jwtGlobalBanInfo == null) {
                return@mono false
            }

            val lastActiveBan = globalBanRepository.findById(authentication.customUserDetails.jwtGlobalBanInfo!!.id).awaitFirstOrNull()
                    ?: return@mono false

            if (authentication.customUserDetails.getAuthoritiesAsStrings().contains("ROLE_ADMIN")) {
                return@mono false;
            }

            return@mono !lastActiveBan.canceled && (lastActiveBan.permanent || lastActiveBan.expiresAt!!.isAfter(ZonedDateTime.now()))
        }
    }

    fun getCurrentUser(): Mono<CurrentUser> {
        return mono {
            val authentication = ReactiveSecurityContextHolder.getContext()
                    .map { context -> context.authentication }
                    .filter { authentication -> authentication is CustomAuthentication }
                    .cast(CustomAuthentication::class.java)
                    .awaitFirst()
            val user = userRepository.findById(authentication.customUserDetails.id).awaitFirst()
            var lastActiveBan: GlobalBan? = null

            if (authentication.customUserDetails.jwtGlobalBanInfo != null) {
                lastActiveBan = globalBanRepository.findById(authentication.customUserDetails.jwtGlobalBanInfo!!.id)
                        .awaitFirstOrNull()
            }

            return@mono CurrentUser(
                    id = user.id,
                    slug = user.slug,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    accountId = user.accountId,
                    avatar = if (user.avatar != null) uploadMapper.toUploadResponse(user.avatar!!) else null,
                    roles = authentication.customUserDetails.authorities.map { grantedAuthority -> grantedAuthority.authority },
                    bio = user.bio,
                    createdAt = user.createdAt,
                    dateOfBirth = user.dateOfBirth,
                    email = user.email,
                    globalBan = if (lastActiveBan != null) globalBanMapper.toGlobalBanResponse(
                            globalBan = lastActiveBan,
                            bannedUser = user,
                            createdBy = userReactiveRepositoryCacheWrapper.findById(lastActiveBan.createdById).awaitFirst(),
                            updatedBy = if (lastActiveBan.updatedById != null) userReactiveRepositoryCacheWrapper.findById(lastActiveBan.updatedById!!).awaitFirst() else null,
                            canceledBy = if (lastActiveBan.cancelledById != null) userReactiveRepositoryCacheWrapper.findById(lastActiveBan.cancelledById!!).awaitFirst() else null
                    ) else null,
                    externalAvatarUri = user.externalAvatarUri
            )
        }
    }

    private fun getCurrentAuthentication(): Mono<CustomAuthentication> {
        return ReactiveSecurityContextHolder.getContext()
                .map { context -> context.authentication }
                .filter { authentication -> authentication is CustomAuthentication }
                .cast(CustomAuthentication::class.java)
    }
}
