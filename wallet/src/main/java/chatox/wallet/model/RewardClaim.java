package chatox.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RewardClaim {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_reward_claim_balance"))
    private Balance balance;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_reward_claim_user"))
    private User user;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_reward_claim_reward"))
    private Reward reward;

    private ZonedDateTime createdAt;
    private BigDecimal claimedAmount;
}
