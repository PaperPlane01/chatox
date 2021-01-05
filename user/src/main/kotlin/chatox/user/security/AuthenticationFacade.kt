package chatox.user.security

import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import chatox.user.exception.UserNotFoundException
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
import reactor.util.function.Tuples

@Component
@Transactional
class AuthenticationFacade(private val userRepository: UserRepository,
                           private val globalBanRepository: GlobalBanRepository,
                           private val uploadMapper: UploadMapper,
                           private val globalBanMapper: GlobalBanMapper) {

    fun getCurrentUserEntity(): Mono<User> {
        return ReactiveSecurityContextHolder.getContext()
                .map { context -> context.authentication }
                .filter { authentication -> authentication is CustomAuthentication }
                .cast(CustomAuthentication::class.java)
                .map { authentication -> userRepository.findById(authentication.customUserDetails.id) }
                .flatMap { user -> user }
    }

    fun getCurrentUser(): Mono<CurrentUser> {
        return mono {
            val authentication = ReactiveSecurityContextHolder.getContext()
                    .map { context -> context.authentication }
                    .filter { authentication -> authentication is CustomAuthentication }
                    .cast(CustomAuthentication::class.java)
                    .awaitFirst()
            println(authentication.customUserDetails.id)
            val user = userRepository.findById(authentication.customUserDetails.id).awaitFirst()
            var lastActiveBan: GlobalBan? = null

            if (authentication.customUserDetails.jwtGlobalBanInfo != null) {
                println(authentication.customUserDetails.jwtGlobalBanInfo!!.id)
                lastActiveBan = globalBanRepository.findById(authentication.customUserDetails.jwtGlobalBanInfo!!.id)
                        .awaitFirstOrNull()
                println(lastActiveBan)
            }

            CurrentUser(
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
                    email = authentication.customUserDetails.email,
                    globalBan = if (lastActiveBan != null) globalBanMapper.toGlobalBanResponse(lastActiveBan) else null
            )
        }
    }
}
