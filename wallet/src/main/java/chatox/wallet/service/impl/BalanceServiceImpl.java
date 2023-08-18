package chatox.wallet.service.impl;

import chatox.platform.pagination.PaginationRequest;
import chatox.platform.security.web.AuthenticationHolder;
import chatox.wallet.api.request.CreateBalanceChangeRequest;
import chatox.wallet.api.response.BalanceChangeResponse;
import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.exception.BalanceNotFoundException;
import chatox.wallet.mapper.BalanceChangeMapper;
import chatox.wallet.mapper.BalanceMapper;
import chatox.wallet.model.Balance;
import chatox.wallet.model.BalanceChange;
import chatox.wallet.model.BalanceChangeDirection;
import chatox.wallet.model.Currency;
import chatox.wallet.model.RewardClaim;
import chatox.wallet.model.User;
import chatox.wallet.repository.BalanceChangeRepository;
import chatox.wallet.repository.BalanceRepository;
import chatox.wallet.service.BalanceService;
import chatox.wallet.service.UserService;
import chatox.wallet.support.BalanceChangeFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Stream;

@Service
@Transactional
@RequiredArgsConstructor
public class BalanceServiceImpl implements BalanceService {
    private final BalanceRepository balanceRepository;
    private final BalanceChangeRepository balanceChangeRepository;
    private final BalanceChangeFactory balanceChangeFactory;
    private final BalanceMapper balanceMapper;
    private final BalanceChangeMapper balanceChangeMapper;
    private final AuthenticationHolder<User> authenticationHolder;
    private final UserService userService;

    @Override
    public List<BalanceResponse> getBalanceOfCurrentUser() {
        var userId = authenticationHolder.requireCurrentUserDetails().getId();
        var balances = balanceRepository.findByUserId(userId);

        if (balances.size() == Currency.values().length) {
            return balances.stream()
                    .map(balanceMapper::toBalanceResponse)
                    .toList();
        }

        var user = authenticationHolder.requireCurrentUser();

        return createMissingBalances(balances, user)
                .stream()
                .map(balanceMapper::toBalanceResponse)
                .toList();
    }

    private List<Balance> createMissingBalances(List<Balance> existingBalances, User user) {
        var balances = new ArrayList<>(existingBalances);
        var exisingCurrencies = existingBalances.stream().map(Balance::getCurrency).toList();
        var missingCurrencies = Stream
                .of(Currency.values())
                .filter(currency -> !exisingCurrencies.contains(currency));
        var newBalances = new ArrayList<Balance>();

        missingCurrencies.forEach(currency -> newBalances.add(createNewBalance(user, currency)));

        balances.addAll(newBalances);

        return balances;
    }

    @Override
    public Balance getBalanceOfCurrentUser(Currency currency) {
        return getBalanceOfCurrentUser(currency, true);
    }

    @Override
    public Balance getBalanceOfCurrentUser(Currency currency, boolean createIfAbsent) {
       return getBalanceOfUser(
               authenticationHolder.requireCurrentUserDetails().getId(),
               currency,
               createIfAbsent,
               authenticationHolder::requireCurrentUser
       );
    }

    private Balance getBalanceOfUser(String userId, Currency currency, boolean createIfAbsent, Supplier<User> getUser) {
        var balance = balanceRepository.findByUserIdAndCurrency(userId, currency);

        if (balance.isPresent()) {
            return balance.get();
        }

        if (!createIfAbsent) {
            throw new BalanceNotFoundException(userId, currency);
        }

        return createNewBalance(getUser.get(), currency);
    }

    @Override
    public Balance applyBalanceChange(Balance balance, BalanceChange balanceChange) {
        if (balanceChange.getDirection().equals(BalanceChangeDirection.IN)) {
            balance.setAmount(balance.getAmount().add(balanceChange.getChange()));
        } else {
            balance.setAmount(balance.getAmount().subtract(balanceChange.getChange()));
        }

        balanceRepository.save(balance);

        balanceChange.setBalanceAfter(balance.getAmount());

        balanceChangeRepository.save(balanceChange);

        return balance;
    }

    @Override
    public void updateBalance(Balance balance, RewardClaim rewardClaim) {
        var balanceChange = balanceChangeFactory.createBalanceChange(balance, rewardClaim);
        applyBalanceChange(balance, balanceChange);
    }

    @Override
    public List<BalanceChangeResponse> getBalanceHistoryOfCurrentUser(Currency currency, PaginationRequest paginationRequest) {
        var balance = getBalanceOfCurrentUser(currency, true);

        return balanceChangeRepository.findByBalance(balance, paginationRequest.toPageRequest())
                .stream()
                .map(balanceChangeMapper::toBalanceChangeResponse)
                .toList();
    }

    @Override
    public BalanceResponse updateBalance(CreateBalanceChangeRequest createBalanceChangeRequest) {
        var currentUser = authenticationHolder.requireCurrentUser();
        var balance = getBalanceOfUser(
                createBalanceChangeRequest.getUserId(),
                createBalanceChangeRequest.getCurrency(),
                true,
                () -> userService.requireUserById(createBalanceChangeRequest.getUserId())
        );
        var balanceChange = balanceChangeFactory.createBalanceChange(balance, createBalanceChangeRequest, currentUser);

        return balanceMapper.toBalanceResponse(applyBalanceChange(balance, balanceChange));
    }

    private Balance createNewBalance(User user, Currency currency) {
        var balance = Balance.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .amount(BigDecimal.ZERO)
                .currency(currency)
                .createdAt(ZonedDateTime.now())
                .lastChange(ZonedDateTime.now())
                .build();
        balanceRepository.save(balance);
        return balance;
    }
}
