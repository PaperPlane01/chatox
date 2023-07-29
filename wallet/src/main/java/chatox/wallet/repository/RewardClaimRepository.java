package chatox.wallet.repository;

import chatox.wallet.model.RewardClaim;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardClaimRepository extends JpaRepository<RewardClaim, String> {

}
