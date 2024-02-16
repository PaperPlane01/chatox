package chatox.user.controller

import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.pagination.annotation.SortDirection
import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import chatox.user.api.request.UserInteractionCostRequest
import chatox.user.service.UserInteractionService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserInteractionController(private val userInteractionService: UserInteractionService) {

    @PreAuthorize("hasRole('ROLE_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@userInteractionPermissions.canCreateInteraction(#userId)")
    @PostMapping("/{userId}/like")
    fun likeUser(@PathVariable userId: String) = userInteractionService.likeUser(userId)

    @PreAuthorize("hasRole('ROLE_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@userInteractionPermissions.canCreateInteraction(#userId)")
    @PostMapping("/{userId}/dislike")
    fun dislikeUser(@PathVariable userId: String) = userInteractionService.dislikeUser(userId)

    @PreAuthorize("hasRole('ROLE_USER')")
    //language=SpEL
    @ReactivePermissionCheck("@userInteractionPermissions.canCreateInteraction(#userId)")
    @PostMapping("/{userId}/love")
    fun loveUser(@PathVariable userId: String) = userInteractionService.loveUser(userId)

    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "type"], defaultValue = "createdAt"),
            sortingDirection = SortDirection(defaultValue = "desc")
    )
    @GetMapping("/{userId}/interactions")
    fun getUserInteractionsHistory(
            @PathVariable userId: String,
            paginationRequest: PaginationRequest
    ) = userInteractionService.getUserInteractionsHistory(userId, paginationRequest)

    @GetMapping("/{userId}/interactions/count")
    fun getUserInteractionsCount(
            @PathVariable userId: String
    ) = userInteractionService.getUserInteractionsCount(userId)
}