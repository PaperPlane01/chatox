package chatox.user.controller

import chatox.user.api.request.UserInteractionCostRequest
import chatox.user.service.UserInteractionCostService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users/interactions/costs")
class UserInteractionCostController(private val userInteractionCostService: UserInteractionCostService) {

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping
    fun updateUserInteractionCost(
            @RequestBody @Valid userInteractionCostRequest: UserInteractionCostRequest
    ) = userInteractionCostService.creatOrUpdateUserInteractionCost(userInteractionCostRequest)

    @GetMapping
    fun getUserInteractionCosts() = userInteractionCostService.getUserInteractionCosts()

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/full")
    fun getFullUserInteractionCosts() = userInteractionCostService.getFullUserInteractionCosts()
}