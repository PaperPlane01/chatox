package chatox.wallet.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BalanceChangeData {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    private BalanceChange balanceChange;

    @Enumerated(EnumType.STRING)
    private BalanceChangeDataKey key;
    private String value;

    public static Map<BalanceChangeDataKey, String> asMap(List<BalanceChangeData> balanceChangeData) {
        return balanceChangeData
                .stream()
                .collect(Collectors.toMap(
                        BalanceChangeData::getKey,
                        BalanceChangeData::getValue
                ));
    }
}
