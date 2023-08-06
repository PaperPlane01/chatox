package chatox.wallet.repository.custom;

import chatox.wallet.model.Reward;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface RewardCustomRepository {
    List<Reward> getAvailableRewardsForUser(String userId);
    List<Reward> getActiveRewards(Pageable pageable);
    Optional<Reward> getActiveRewardById(String id);
}
