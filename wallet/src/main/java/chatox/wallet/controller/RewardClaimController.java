package chatox.wallet.controller;

import chatox.wallet.api.response.RewardClaimResponse;
import chatox.wallet.service.RewardClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
public class RewardClaimController {
    private final RewardClaimService rewardClaimService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/{rewardId}/claim")
    public RewardClaimResponse claimReward(@PathVariable String rewardId) {
        return rewardClaimService.claimReward(rewardId);
    }
}
