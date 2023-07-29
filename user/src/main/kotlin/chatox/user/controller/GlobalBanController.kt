package chatox.user.controller

import chatox.platform.pagination.PaginationRequest
import chatox.platform.pagination.annotation.PageSize
import chatox.platform.pagination.annotation.PaginationConfig
import chatox.platform.pagination.annotation.SortBy
import chatox.platform.pagination.annotation.SortDirection
import chatox.user.api.request.BanMultipleUsersRequest
import chatox.user.api.request.BanUserRequest
import chatox.user.api.request.GlobalBanFilters
import chatox.user.api.request.UpdateBanRequest
import chatox.user.service.GlobalBanService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class GlobalBanController(private val globalBanService: GlobalBanService) {

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/bans")
    fun banUser(@PathVariable userId: String,
                @RequestBody @Valid banUserRequest: BanUserRequest
    ) = globalBanService.banUser(userId, banUserRequest)

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/bans")
    fun banMultipleUsers(@RequestBody @Valid banMultipleUsersRequest: BanMultipleUsersRequest)
            = globalBanService.banMultipleUsers(banMultipleUsersRequest)

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}/bans/{banId}")
    fun updateBan(@PathVariable userId: String,
                  @PathVariable banId: String,
                  @RequestBody @Valid updateBanRequest: UpdateBanRequest
    ) = globalBanService.updateBan(userId, banId, updateBanRequest)

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userId}/bans/{banId}")
    fun cancelBan(@PathVariable userId: String,
                  @PathVariable banId: String
    ) = globalBanService.cancelBan(userId, banId)

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/bans")
    @PaginationConfig(
            sortBy = SortBy(allowed = ["createdAt", "expiresAt"], defaultValue = "createdAt"),
            sortingDirection = SortDirection(defaultValue = "desc"),
            pageSize = PageSize(defaultValue = 30)
    )
    fun findBans(@RequestParam(value = "excludeExpired", required = false, defaultValue = "false") excludeExpired: Boolean = false,
                 @RequestParam(value = "excludeCanceled", required = false, defaultValue = "false") excludeCanceled: Boolean = false,
                 @RequestParam(value = "bannedUserId", required = false) bannedUserId: String?,
                 @RequestParam(value = "bannedById", required = false) bannedById: String?,
                 paginationRequest: PaginationRequest
    ) = globalBanService.findBans(
            filters = GlobalBanFilters(
                    excludeCanceled = excludeCanceled,
                    excludeExpired = excludeExpired,
                    bannedById = bannedById,
                    bannedUserId = bannedUserId
            ),
            paginationRequest = paginationRequest
    )
}
