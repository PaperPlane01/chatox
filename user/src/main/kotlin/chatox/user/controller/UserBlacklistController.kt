package chatox.user.controller

import chatox.user.service.UserBlacklistService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserBlacklistController(private val userBlacklistService: UserBlacklistService) {
    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    @GetMapping("/me/blacklist")
    fun getBlacklistOfCurrentUser() = userBlacklistService.getBlacklistOfCurrentUser()

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    @PostMapping("/{userId}/blacklist")
    fun blacklistUser(@PathVariable userId: String) = userBlacklistService.blacklistUser(userId)

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    @DeleteMapping("/{userId}/blacklist")
    fun removeUserFromBlacklist(@PathVariable userId: String) = userBlacklistService.removeUserFromBlackList(userId)

    @PreAuthorize("hasRole('USER') || hasRole('ANONYMOUS_USER')")
    @GetMapping("/{userId}/blacklist/status")
    fun checkBlacklistStatus(@PathVariable userId: String) = userBlacklistService.getBlacklistStatus(userId)
}
