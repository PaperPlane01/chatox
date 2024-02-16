package chatox.wallet.service;

import chatox.platform.pagination.PaginationRequest;
import chatox.wallet.api.request.CreateRewardRequest;
import chatox.wallet.api.request.UpdateRewardRequest;
import chatox.wallet.api.response.CurrentUserRewardResponse;
import chatox.wallet.api.response.RewardResponse;
import chatox.wallet.model.Reward;
import chatox.wallet.repository.RewardRepository;

import java.util.List;

public interface RewardService {
    List<RewardResponse> getAllRewards(PaginationRequest paginationRequest);
    List<RewardResponse> getActiveRewards(PaginationRequest paginationRequest);
    RewardResponse createReward(CreateRewardRequest createRewardRequest);
    RewardResponse updateReward(String id, UpdateRewardRequest updateRewardRequest);
    List<CurrentUserRewardResponse> getAvailableRewardsForCurrentUser();
    Reward requireRewardById(String id);
    Reward requireActiveRewardById(String id);
}
