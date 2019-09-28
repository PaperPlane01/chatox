package chatox.user.controller

import chatox.user.api.request.CreateUserRequest
import chatox.user.api.request.UpdateUserRequest
import chatox.user.service.UserService
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
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/user")
class UserController(private val userService: UserService) {

    @PreAuthorize("#oauth2.hasScope('internal_create_user')")
    @PostMapping
    fun createUser(@RequestBody @Valid createUserRequest: CreateUserRequest) = userService.createUser(createUserRequest)

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{id}")
    fun updateUser(@PathVariable idOrSlug: String,
                   @RequestBody @Valid updateUserRequest: UpdateUserRequest) = userService.updateUser(idOrSlug, updateUserRequest)

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable idOrSlug: String): Mono<ResponseEntity<Void>> {
        return userService.deleteUser(idOrSlug)
                .map { ResponseEntity.noContent().build<Void>() }
    }

    @GetMapping("/{id}")
    fun findUserByIdOrSlug(@PathVariable idOrSlug: String) = userService.findUserByIdOrSlug(idOrSlug)
}
