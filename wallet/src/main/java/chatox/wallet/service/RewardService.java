package chatox.wallet.service;

import chatox.wallet.api.request.CreateRewardRequest;
import chatox.wallet.api.response.CurrentUserRewardResponse;
import chatox.wallet.api.response.RewardResponse;

import java.util.List;

public interface RewardService {
    RewardResponse createReward(CreateRewardRequest createRewardRequest);
    List<CurrentUserRewardResponse> getAvailableRewardsForCurrentUser();
}
