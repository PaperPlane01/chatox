package chatox.oauth2.controller;

import chatox.oauth2.api.request.CreateAccountRequest;
import chatox.oauth2.api.request.CreateAnonymousAccountRequest;
import chatox.oauth2.api.request.UpdatePasswordRequest;
import chatox.oauth2.api.response.AccountResponse;
import chatox.oauth2.api.response.CreateAccountResponse;
import chatox.oauth2.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/oauth/account")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @PreAuthorize("#oauth2.hasScope('internal_create_account')")
    @PostMapping
    public CreateAccountResponse createAccount(@RequestBody @Valid CreateAccountRequest createAccountRequest) {
        return accountService.createAccount(createAccountRequest);
    }

    @PreAuthorize("#oauth2.hasScope('internal_create_account')")
    @PostMapping("/anonymous")
    public CreateAccountResponse createAnonymousAccount(@RequestBody @Valid CreateAnonymousAccountRequest createAnonymousAccountRequest) {
        return accountService.createAnonymousAccount(createAnonymousAccountRequest);
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody @Valid UpdatePasswordRequest updatePasswordRequest) {
        accountService.updateCurrentAccountPassword(updatePasswordRequest);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{id}")
    public AccountResponse findAccountById(@PathVariable String id) {
        return accountService.findAccountById(id);
    }

    @PreAuthorize("#oauth2.hasScope('internal_update_account')")
    @PutMapping("/{accountId}/users/{userId}")
    public ResponseEntity<?> addUserToAccount(@PathVariable String accountId,
                                              @PathVariable String userId) {
        accountService.addUserToAccount(accountId, userId);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PreAuthorize("#oauth2.hasScope('internal_update_account')")
    @DeleteMapping("/{accountId}/users/{userId}")
    public ResponseEntity<?> removeUserFromAccount(@PathVariable String accountId,
                                                   @PathVariable String userId) {
        accountService.removeUserFromAccount(accountId, userId);

        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/lock")
    public ResponseEntity<?> lockAccount(@PathVariable String id) {
        accountService.lockAccount(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/unlock")
    public ResponseEntity<?> unlockAccount(@PathVariable String id) {
        accountService.unlockAccount(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
