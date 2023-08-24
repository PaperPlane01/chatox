package chatox.wallet.controller;

import chatox.platform.pagination.PaginationRequest;
import chatox.platform.pagination.annotation.PaginationConfig;
import chatox.platform.pagination.annotation.SortBy;
import chatox.platform.pagination.annotation.SortDirection;
import chatox.wallet.api.request.CreateBalanceChangeRequest;
import chatox.wallet.api.response.BalanceChangeResponse;
import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.model.Currency;
import chatox.wallet.service.BalanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/balance")
@RequiredArgsConstructor
public class BalanceController {
    private final BalanceService balanceService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping
    public List<BalanceResponse> getBalanceOfCurrentUser() {
        return balanceService.getBalanceOfCurrentUser();
    }

    @PreAuthorize("hasAuthority('SCOPE_internal_get_balance')")
    @GetMapping(params = "userId")
    public List<BalanceResponse> getBalancesOfUser(@RequestParam String userId) {
        return balanceService.getBalanceOfUser(userId);
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping
    public BalanceResponse updateBalance(@RequestBody @Valid CreateBalanceChangeRequest createBalanceChangeRequest) {
        return balanceService.updateBalance(createBalanceChangeRequest);
    }

    @PreAuthorize("hasRole('USER')")
    @PaginationConfig(
            sortBy = @SortBy(defaultValue = "date", allowed = {"date", "amount"}),
            sortingDirection = @SortDirection(defaultValue = "desc")
    )
    @GetMapping("/history/{currency}")
    public List<BalanceChangeResponse> getBalanceHistoryOfCurrentUser(@PathVariable Currency currency,
                                                                      PaginationRequest paginationRequest) {
        return balanceService.getBalanceHistoryOfCurrentUser(currency, paginationRequest);
    }
}
