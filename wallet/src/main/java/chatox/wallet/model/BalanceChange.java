package chatox.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BalanceChange {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn
    private Balance balance;

    @OneToMany(fetch = FetchType.EAGER)
    private List<BalanceChangeData> balanceChangeData;

    @Enumerated(EnumType.STRING)
    private BalanceChangeType type;

    @Enumerated(EnumType.STRING)
    private BalanceChangeDirection direction;

    private BigDecimal change;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private ZonedDateTime date;
}
