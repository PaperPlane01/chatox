package chatox.wallet.service.impl;

import chatox.platform.security.web.AuthenticationHolder;
import chatox.wallet.exception.BalanceNotFoundException;
import chatox.wallet.mapper.BalanceChangeMapper;
import chatox.wallet.mapper.BalanceMapper;
import chatox.wallet.model.Balance;
import chatox.wallet.model.Currency;
import chatox.wallet.model.User;
import chatox.wallet.repository.BalanceChangeRepository;
import chatox.wallet.repository.BalanceRepository;
import chatox.wallet.service.UserService;
import chatox.wallet.support.BalanceChangeFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static chatox.util.test.TestObjects.balance;
import static chatox.util.test.TestObjects.balanceChangeIn;
import static chatox.util.test.TestObjects.balanceChangeOut;
import static chatox.util.test.TestObjects.balanceResponse;
import static chatox.util.test.TestObjects.jwtPayload;
import static chatox.util.test.TestObjects.user;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("BalanceServiceImpl tests")
@ExtendWith(MockitoExtension.class)
class BalanceServiceImplTests {
    @Mock
    BalanceRepository balanceRepository;

    @Mock
    BalanceChangeRepository balanceChangeRepository;

    @Mock
    BalanceChangeFactory balanceChangeFactory;

    @Mock
    BalanceMapper balanceMapper;

    @Mock
    BalanceChangeMapper balanceChangeMapper;

    @Mock
    AuthenticationHolder<User> authenticationHolder;

    @Mock
    UserService userService;

    @InjectMocks
    BalanceServiceImpl balanceService;

    @Nested
    @DisplayName("getBalanceOfCurrentUser() tests")
    class GetBalanceOfCurrentUserTests {

        @Test
        @DisplayName("It returns balances of current user")
        void getBalanceOfCurrentUser_returnsBalanceOfCurrentUser() {
            var jwtPayload = jwtPayload();
            var balance = balance();
            var balanceResponse = balanceResponse();

            when(authenticationHolder.requireCurrentUserDetails()).thenReturn(jwtPayload);
            when(balanceRepository.findByUserId(jwtPayload.getId())).thenReturn(List.of(balance));
            when(balanceMapper.toBalanceResponse(any(Balance.class))).thenReturn(balanceResponse);

            var result = balanceService.getBalanceOfCurrentUser();

            assertEquals(
                    List.of(balanceResponse),
                    result
            );
        }

        @Test
        @DisplayName("It creates missing balances for current user")
        void getBalanceOfCurrentUser_createsMissingBalances() {
            var user = user();
            var jwtPayload = jwtPayload();
            var balanceResponse = balanceResponse();

            when(authenticationHolder.requireCurrentUserDetails()).thenReturn(jwtPayload);
            when(authenticationHolder.requireCurrentUser()).thenReturn(user);
            when(balanceRepository.findByUserId(jwtPayload.getId())).thenReturn(List.of());
            when(balanceMapper.toBalanceResponse(any(Balance.class))).thenReturn(balanceResponse);

            var result = balanceService.getBalanceOfCurrentUser();

            verify(balanceRepository, times(Currency.values().length)).save(argThat(balance -> {
                assertNotNull(balance.getId());
                assertNotNull(balance.getCurrency());
                assertNotNull(balance.getCreatedAt());
                assertEquals(user, balance.getUser());
                assertEquals(balance.getAmount(), BigDecimal.ZERO);
                return true;
            }));

            assertEquals(
                    List.of(balanceResponse),
                    result
            );
        }

        @Test
        @DisplayName("It returns balance of current user for specified currency")
        void getBalanceOfCurrentUser_returnsBalanceOfCurrentUserForSpecifiedCurrency() {
            var jwtPayload = jwtPayload();
            var balance = balance();
            var userId = jwtPayload.getId();
            var currency = Currency.COIN;

            when(authenticationHolder.requireCurrentUserDetails()).thenReturn(jwtPayload);
            when(balanceRepository.findByUserIdAndCurrency(userId, currency)).thenReturn(Optional.of(balance));

            var result = balanceService.getBalanceOfCurrentUser(currency);

            assertEquals(balance, result);
        }

        @Test
        @DisplayName("It creates balance for current user with the specified currency" +
                " if balance is not found and createIfAbsent parameter is true")
        void getBalanceOfUser_createsBalance_ifCreateIfAbsentIsTrue() {
            var jwtPayload = jwtPayload();
            var user = user();
            var userId = jwtPayload.getId();
            var currency = Currency.COIN;

            when(authenticationHolder.requireCurrentUserDetails()).thenReturn(jwtPayload);
            when(authenticationHolder.requireCurrentUser()).thenReturn(user);
            when(balanceRepository.findByUserIdAndCurrency(userId, currency)).thenReturn(Optional.empty());

            assertDoesNotThrow(() -> balanceService.getBalanceOfCurrentUser(currency, true));

            verify(balanceRepository, times(Currency.values().length)).save(argThat(balance -> {
                assertNotNull(balance.getId());
                assertNotNull(balance.getCurrency());
                assertNotNull(balance.getCreatedAt());
                assertEquals(user, balance.getUser());
                assertEquals(balance.getAmount(), BigDecimal.ZERO);
                return true;
            }));
        }

        @Test
        @DisplayName("It throws BalanceNotFoundException if balance is not found and createIfAbsent parameter is false")
        void getBalanceOfUser_throwsBalanceNotFoundException_ifCreateIfAbsentIsFalse() {
            var jwtPayload = jwtPayload();
            var user = user();
            var userId = jwtPayload.getId();
            var currency = Currency.COIN;

            when(authenticationHolder.requireCurrentUserDetails()).thenReturn(jwtPayload);
            when(balanceRepository.findByUserIdAndCurrency(userId, currency)).thenReturn(Optional.empty());

            assertThrows(BalanceNotFoundException.class, () -> balanceService.getBalanceOfCurrentUser(currency, false));
        }
    }

    @Nested
    @DisplayName("getBalanceOfUser() tests")
    class GetBalanceOfUserTests {

        @Test
        @DisplayName("It returns balances of user")
        void getBalanceOfUser_returnsBalanceOfUser() {
            var user = user();
            var balance = balance();
            var balanceResponse = balanceResponse();
            var userId = user.getId();

            when(balanceRepository.findByUserId(userId)).thenReturn(List.of(balance));
            when(balanceMapper.toBalanceResponse(any(Balance.class))).thenReturn(balanceResponse);

            var result = balanceService.getBalanceOfUser(userId);

            assertEquals(
                    List.of(balanceResponse),
                    result
            );
        }

        @Test
        @DisplayName("It creates missing balances for user")
        void getBalanceOfCurrentUser_createsMissingBalances() {
            var user = user();
            var balanceResponse = balanceResponse();
            var userId = user.getId();

            when(userService.requireUserById(userId)).thenReturn(user);
            when(balanceRepository.findByUserId(userId)).thenReturn(List.of());
            when(balanceMapper.toBalanceResponse(any(Balance.class))).thenReturn(balanceResponse);

            var result = balanceService.getBalanceOfUser(userId);

            verify(balanceRepository, times(Currency.values().length)).save(argThat(balance -> {
                assertNotNull(balance.getId());
                assertNotNull(balance.getCurrency());
                assertNotNull(balance.getCreatedAt());
                assertEquals(user, balance.getUser());
                assertEquals(balance.getAmount(), BigDecimal.ZERO);
                return true;
            }));

            assertEquals(
                    List.of(balanceResponse),
                    result
            );
        }
    }

    @Nested
    @DisplayName("applyBalanceChange() tests")
    class ApplyBalanceChangeTests {

        @Test
        @DisplayName("It adds balance when direction is IN")
        void applyBalanceChange_addsBalance_ifDirectionIsIn() {
            var balanceChange = balanceChangeIn();
            var balance = balance();

            var expectedAmount = balance.getAmount().add(balanceChange.getChange());
            var result = balanceService.applyBalanceChange(balance, balanceChange);

            assertEquals(expectedAmount, result.getAmount());

            verify(balanceChangeRepository, times(1)).save(argThat(savedBalanceChange -> {
                assertEquals(expectedAmount, balanceChange.getBalanceAfter());
                return true;
            }));
            verify(balanceRepository, times(1)).save(argThat(savedBalance -> {
                assertEquals(expectedAmount, balance.getAmount());
                return true;
            }));
        }

        @Test
        @DisplayName("It subtracts balance when direction is OUT")
        void applyBalanceChange_subtractsBalance_ifDirectionIsOut() {
            var balanceChange = balanceChangeOut();
            var balance = balance();

            var expectedAmount = balance.getAmount().subtract(balanceChange.getChange());
            var result = balanceService.applyBalanceChange(balance, balanceChange);

            assertEquals(expectedAmount, result.getAmount());

            verify(balanceChangeRepository, times(1)).save(argThat(savedBalanceChange -> {
                assertEquals(expectedAmount, balanceChange.getBalanceAfter());
                return true;
            }));
            verify(balanceRepository, times(1)).save(argThat(savedBalance -> {
                assertEquals(expectedAmount, balance.getAmount());
                return true;
            }));
        }
    }
}
