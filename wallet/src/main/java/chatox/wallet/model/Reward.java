package chatox.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import java.time.temporal.ChronoUnit;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Reward {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_reward_created_by"))
    private User createdBy;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_reward_updated_by"))
    private User updatedBy;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_reward_rewarded_user"))
    private User rewardedUser;

    private boolean claimed;

    @Enumerated(EnumType.STRING)
    private Currency currency;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private ZonedDateTime periodStart;
    private ZonedDateTime periodEnd;
    private BigDecimal minRewardValue;
    private BigDecimal maxRewardValue;
    private boolean useIntegersOnly;

    @Enumerated(EnumType.STRING)
    private ChronoUnit recurringPeriodUnit;
    private Integer recurringPeriodValue;
    private boolean active;
    private String name;
}
