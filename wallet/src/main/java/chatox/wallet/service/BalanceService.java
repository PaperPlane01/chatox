package chatox.wallet.service;

import chatox.platform.pagination.PaginationRequest;
import chatox.wallet.api.request.CreateBalanceChangeRequest;
import chatox.wallet.api.response.BalanceChangeResponse;
import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.event.UserInteractionCreated;
import chatox.wallet.model.Balance;
import chatox.wallet.model.BalanceChange;
import chatox.wallet.model.Currency;
import chatox.wallet.model.RewardClaim;

import java.math.BigDecimal;
import java.util.List;

public interface BalanceService {
    List<BalanceResponse> getBalanceOfCurrentUser();
    List<BalanceResponse> getBalanceOfUser(String userId);
    Balance getBalanceOfCurrentUser(Currency currency);
    Balance getBalanceOfCurrentUser(Currency currency, boolean createIfAbsent);
    Balance applyBalanceChange(Balance balance, BalanceChange balanceChange);
    void updateBalance(Balance balance, RewardClaim rewardClaim);
    void updateBalance(Balance balance, UserInteractionCreated userInteractionCreated);
    List<BalanceChangeResponse> getBalanceHistoryOfCurrentUser(Currency currency, PaginationRequest paginationRequest);
    BalanceResponse updateBalance(CreateBalanceChangeRequest createBalanceChangeRequest);
}
