package chatox.user.controller

import chatox.platform.pagination.PaginationRequest
import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.security.CurrentUserService
import chatox.user.service.UserService
import chatox.user.service.UserSessionService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/v1/users")
class UserController(private val userService: UserService,
                     private val userSessionService: UserSessionService,
                     private val currentUserService: CurrentUserService) {

    @PreAuthorize("hasAuthority('SCOPE_internal_create_user')")
    @PostMapping
    fun createUser(@RequestBody @Valid createUserRequest: CreateUserRequest) = userService.createUser(createUserRequest)

    @PreAuthorize("authentication.details.id == #id")
    @PutMapping("/{id}")
    fun updateUser(@PathVariable id: String,
                   @RequestBody @Valid updateUserRequest: UpdateUserRequest) = userService.updateUser(id, updateUserRequest)

    @PreAuthorize("hasRole('ADMIN') || authentication.details.id == #id")
    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: String): Mono<ResponseEntity<Void>> {
        return userService.deleteUser(id)
                .map { ResponseEntity.noContent().build<Void>() }
    }

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    @GetMapping("/me")
    fun getCurrentUser() = currentUserService.getCurrentUser()

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/me/sessions")
    fun getSessionsOfCurrentUser(paginationRequest: PaginationRequest) = userSessionService.findSessionsOfCurrentUser(
            paginationRequest
    )

    @GetMapping("/{idOrSlug}")
    fun findUserByIdOrSlug(@PathVariable idOrSlug: String) = userService.findUserByIdOrSlug(idOrSlug)

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/me/sessions/active")
    fun getActiveSessionsOfCurrentUser() = userSessionService.findActiveSessionsOfCurrentUser()

    @GetMapping("/slug/{slug}/isAvailable")
    fun isSlugAvailable(@PathVariable slug: String) = userService.isSlugAvailable(slug)
}
