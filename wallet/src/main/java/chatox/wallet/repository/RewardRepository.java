package chatox.wallet.repository;

import chatox.wallet.model.Reward;
import chatox.wallet.repository.custom.RewardCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardRepository extends JpaRepository<Reward, String>, RewardCustomRepository {
}
