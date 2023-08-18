package chatox.wallet.support;

import chatox.wallet.api.request.CreateBalanceChangeRequest;
import chatox.wallet.model.Balance;
import chatox.wallet.model.BalanceChange;
import chatox.wallet.model.BalanceChangeData;
import chatox.wallet.model.BalanceChangeDataKey;
import chatox.wallet.model.BalanceChangeDirection;
import chatox.wallet.model.BalanceChangeType;
import chatox.wallet.model.RewardClaim;
import chatox.wallet.model.User;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class BalanceChangeFactory {

    public BalanceChange createBalanceChange(Balance balance, RewardClaim rewardClaim) {
        var balanceChange = BalanceChange.builder()
                .id(UUID.randomUUID().toString())
                .change(rewardClaim.getClaimedAmount())
                .balanceBefore(balance.getAmount())
                .balance(balance)
                .date(ZonedDateTime.now())
                .type(BalanceChangeType.REWARD)
                .direction(BalanceChangeDirection.IN)
                .build();
        var balanceChangeData = List.of(
                BalanceChangeData.builder()
                        .id(UUID.randomUUID().toString())
                        .key(BalanceChangeDataKey.REWARD_CLAIM_ID)
                        .value(rewardClaim.getId())
                        .balanceChange(balanceChange)
                        .build()
        );
        balanceChange.setBalanceChangeData(balanceChangeData);

        return balanceChange;
    }

    public BalanceChange createBalanceChange(Balance balance,
                                             CreateBalanceChangeRequest createBalanceChangeRequest,
                                             User user) {
        var balanceChange = BalanceChange.builder()
                .id(UUID.randomUUID().toString())
                .change(createBalanceChangeRequest.getAmount())
                .balanceBefore(balance.getAmount())
                .balance(balance)
                .date(ZonedDateTime.now())
                .type(
                        createBalanceChangeRequest.getDirection().equals(BalanceChangeDirection.IN)
                                ? BalanceChangeType.MANUAL_ADD
                                : BalanceChangeType.MANUAL_DEDUCT
                )
                .direction(createBalanceChangeRequest.getDirection())
                .createdBy(user)
                .build();
        var balanceChangeData = List.of(
                BalanceChangeData.builder()
                        .id(UUID.randomUUID().toString())
                        .key(BalanceChangeDataKey.COMMENT)
                        .value(createBalanceChangeRequest.getComment())
                        .balanceChange(balanceChange)
                        .build()
        );
        balanceChange.setBalanceChangeData(balanceChangeData);
        return balanceChange;
    }
}
