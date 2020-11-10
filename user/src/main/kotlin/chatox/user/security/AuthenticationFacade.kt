package chatox.user.security

import chatox.user.exception.UserNotFoundException
import chatox.user.mapper.UploadMapper
import chatox.user.repository.UserRepository
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Mono
import reactor.util.function.Tuples

@Component
@Transactional
class AuthenticationFacade(private val userRepository: UserRepository,
                           private val uploadMapper: UploadMapper) {

    fun getCurrentUser(): Mono<CurrentUser> {
        return ReactiveSecurityContextHolder.getContext()
                .map { it.authentication }
                .filter { it is CustomAuthentication }
                .cast(CustomAuthentication::class.java)
                .map {
                    UserIdAndRolesHolder(
                            id = it.customUserDetails.id,
                            roles = it.customUserDetails.authorities.map { authority -> authority.authority },
                            userDetails = it.customUserDetails
                    )
                }
                .map { Tuples.of(
                        it,
                        userRepository.findById(it.id)
                                .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id $it.id")))
                ) }
                .map { it.t2.zipWith(Mono.just(it.t1)) }
                .flatMap { it }
                .map { CurrentUser(
                        id = it.t1.id,
                        slug = it.t1.slug,
                        firstName = it.t1.firstName,
                        lastName = it.t1.lastName,
                        accountId = it.t1.accountId,
                        avatar = if (it.t1.avatar != null) uploadMapper.toUploadResponse(it.t1.avatar!!) else null,
                        roles = it.t2.roles,
                        bio = it.t1.bio,
                        createdAt = it.t1.createdAt,
                        dateOfBirth = it.t1.dateOfBirth,
                        email = it.t2.userDetails.email
                ) }
    }

    data class UserIdAndRolesHolder(val id: String, val roles: List<String>, val userDetails: CustomUserDetails)
}
