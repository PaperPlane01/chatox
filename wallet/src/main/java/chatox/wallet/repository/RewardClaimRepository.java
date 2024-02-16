package chatox.wallet.repository;

import chatox.wallet.model.Reward;
import chatox.wallet.model.RewardClaim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RewardClaimRepository extends JpaRepository<RewardClaim, String> {
    Optional<RewardClaim> findTopByUserIdAndRewardOrderByCreatedAtDesc(String userId, Reward reward);
}
