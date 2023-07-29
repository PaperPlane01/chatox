package chatox.wallet.service;

import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.model.Balance;
import chatox.wallet.model.Currency;

import java.util.List;

public interface BalanceService {
    List<BalanceResponse> getBalanceOfCurrentUser();
    Balance getBalanceOfCurrentUser(Currency currency);
    Balance getBalanceOfCurrentUser(Currency currency, boolean createIfAbsent);
}
