package chatox.user.controller

import chatox.user.api.request.BanUserRequest
import chatox.user.api.request.UpdateBanRequest
import chatox.user.service.GlobalBanService
import chatox.user.support.pagination.PaginationRequest
import chatox.user.support.pagination.annotation.PageSize
import chatox.user.support.pagination.annotation.PaginationConfig
import chatox.user.support.pagination.annotation.SortBy
import chatox.user.support.pagination.annotation.SortDirection
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.validation.Valid

@RestController("/api/v1/users")
class GlobalBanController(private val globalBanService: GlobalBanService) {

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/bans")
    fun banUser(@PathVariable userId: String,
                @RequestBody @Valid banUserRequest: BanUserRequest
    ) = globalBanService.banUser(userId, banUserRequest)

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
            sortBy = SortBy(allowed = ["createdAt", "expiresAt"], default = "createdAt"),
            sortingDirection = SortDirection(default = "desc"),
            pageSize = PageSize(default = 30)
    )
    fun findBans(@RequestParam(value = "excludeExpired", required = false, defaultValue = "false") excludeExpired: Boolean = false,
                 @RequestParam(value = "excludeCanceled", required = false, defaultValue = "false") excludeCanceled: Boolean = false,
                 paginationRequest: PaginationRequest
    ) = globalBanService.findBans(excludeExpired, excludeCanceled, paginationRequest)
}
