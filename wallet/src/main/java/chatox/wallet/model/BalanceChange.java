package chatox.wallet.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
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
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_balance_change_balance"))
    private Balance balance;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_foreign_key_created_by"))
    private User createdBy;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "balanceChange")
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
