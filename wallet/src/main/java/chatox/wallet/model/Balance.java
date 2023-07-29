package chatox.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
        @Index(name = "user_id_index", columnList = "userId"),
        @Index(name = "user_id_and_currency_index", columnList = "userId, currency")
})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Balance {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn
    private User user;

    @Enumerated(EnumType.STRING)
    private Currency currency;
    private BigDecimal amount;
    private ZonedDateTime createdAt;
    private ZonedDateTime lastChange;
}
