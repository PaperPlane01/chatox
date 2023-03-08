package chatox.user.security

import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import chatox.user.mapper.GlobalBanMapper
import chatox.user.mapper.UploadMapper
import chatox.user.repository.GlobalBanRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class CurrentUserService(private val globalBanRepository: GlobalBanRepository,
                         private val uploadMapper: UploadMapper,
                         private val globalBanMapper: GlobalBanMapper,
                         private val userReactiveRepositoryCacheWrapper: UserReactiveRepositoryCacheWrapper,
                         private val authenticationHolder: ReactiveAuthenticationHolder<User>) {

    fun getCurrentUser(): Mono<CurrentUser> {
        return mono {
            val jwtPayload = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val user = authenticationHolder.requireCurrentUser().awaitFirst()
            var lastActiveBan: GlobalBan? = null

            if (jwtPayload.globalBanInfo != null) {
                lastActiveBan = globalBanRepository.findById(jwtPayload.globalBanInfo.id)
                        .awaitFirstOrNull()
            }

            return@mono CurrentUser(
                    id = user.id,
                    slug = user.slug,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    accountId = user.accountId,
                    avatar = if (user.avatar != null) uploadMapper.toUploadResponse(user.avatar!!) else null,
                    roles = jwtPayload.authorities.map { grantedAuthority -> grantedAuthority.authority },
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
}
