package chatox.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(indexes = {
        @Index(name = "user_id_index", columnList = "user_id"),
        @Index(name = "user_id_and_currency_index", columnList = "user_id, currency")
})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Balance {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "FK_balance_user"))
    private User user;

    @Enumerated(EnumType.STRING)
    private Currency currency;
    private BigDecimal amount;
    private ZonedDateTime createdAt;
    private ZonedDateTime lastChange;
}
