package chatox.wallet.service.impl;

import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.exception.BalanceNotFoundException;
import chatox.wallet.mapper.BalanceMapper;
import chatox.wallet.model.Balance;
import chatox.wallet.model.Currency;
import chatox.wallet.model.User;
import chatox.wallet.repository.BalanceRepository;
import chatox.wallet.security.AuthenticationHolder;
import chatox.wallet.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BalanceServiceImpl implements BalanceService {
    private final BalanceRepository balanceRepository;
    private final BalanceMapper balanceMapper;
    private final AuthenticationHolder<User> authenticationHolder;

    @Override
    public List<BalanceResponse> getBalanceOfCurrentUser() {
        var userId = authenticationHolder.requireCurrentUserDetails().getId();

        return balanceRepository.findByUserId(userId)
                .stream()
                .map(balanceMapper::toBalanceResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Balance getBalanceOfCurrentUser(Currency currency) {
        return getBalanceOfCurrentUser(currency, true);
    }

    @Override
    public Balance getBalanceOfCurrentUser(Currency currency, boolean createIfAbsent) {
        var userId = authenticationHolder.requireCurrentUserDetails().getId();
        var balance = balanceRepository.findByUserIdAndCurrency(userId, currency);

        if (balance.isPresent()) {
            return balance.get();
        }

        if (!createIfAbsent) {
            throw new BalanceNotFoundException(userId, currency);
        }

        return createNewBalance(authenticationHolder.requireCurrentUser(), currency);
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
