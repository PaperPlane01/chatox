package chatox.wallet.controller;

import chatox.platform.pagination.PaginationRequest;
import chatox.platform.pagination.annotation.PaginationConfig;
import chatox.platform.pagination.annotation.SortBy;
import chatox.wallet.api.request.CreateRewardRequest;
import chatox.wallet.api.response.CurrentUserRewardResponse;
import chatox.wallet.api.response.RewardResponse;
import chatox.wallet.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
public class RewardController {
    private final RewardService rewardService;

    @PreAuthorize("hasRole('ADMIN')")
    @PaginationConfig(
            sortBy = @SortBy(
                    defaultValue = "createdAt",
                    allowed = {"createdAt", "periodStart", "periodEnd", "minRewardValue", "maxRewardValue"}
            )
    )
    @GetMapping
    public List<RewardResponse> getAllRewards(PaginationRequest paginationRequest) {
        return rewardService.getAllRewards(paginationRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public RewardResponse createReward(@RequestBody @Valid CreateRewardRequest createRewardRequest) {
        return rewardService.createReward(createRewardRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PaginationConfig(
            sortBy = @SortBy(
                    defaultValue = "createdAt",
                    allowed = {"createdAt", "periodStart", "periodEnd", "minRewardValue", "maxRewardValue"}
            )
    )
    @GetMapping("/active")
    public List<RewardResponse> getActiveRewards(PaginationRequest paginationRequest) {
        return rewardService.getActiveRewards(paginationRequest);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/available")
    public List<CurrentUserRewardResponse> getAvailableRewardsForCurrentUser() {
        return rewardService.getAvailableRewardsForCurrentUser();
    }
}
