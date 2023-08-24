package chatox.wallet.service;

import chatox.wallet.api.response.RewardClaimResponse;

public interface RewardClaimService {
    RewardClaimResponse claimReward(String rewardId);
}
