package chatox.oauth2.controller;

import chatox.oauth2.api.request.CreateAccountRequest;
import chatox.oauth2.api.request.CreateAnonymousAccountRequest;
import chatox.oauth2.api.request.LoginWithGoogleRequest;
import chatox.oauth2.api.request.RecoverPasswordRequest;
import chatox.oauth2.api.request.UpdateEmailRequest;
import chatox.oauth2.api.request.UpdatePasswordRequest;
import chatox.oauth2.api.response.AccountResponse;
import chatox.oauth2.api.response.CreateAccountResponse;
import chatox.oauth2.api.response.EmailAvailabilityResponse;
import chatox.oauth2.api.response.LoginWithGoogleResponse;
import chatox.oauth2.api.response.UsernameAvailabilityResponse;
import chatox.oauth2.service.AccountService;
import chatox.oauth2.service.EmailConfirmationCodeService;
import chatox.oauth2.service.GoogleRegistrationService;
import jakarta.validation.Valid;
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

import java.util.Map;

@RestController
@RequestMapping("/oauth2/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;
    private final EmailConfirmationCodeService emailVerificationService;
    private final GoogleRegistrationService googleRegistrationService;

    @PreAuthorize("hasAuthority('SCOPE_internal_create_account')")
    @PostMapping
    public CreateAccountResponse createAccount(@RequestBody @Valid CreateAccountRequest createAccountRequest) {
        return accountService.createAccount(createAccountRequest);
    }

    @PreAuthorize("hasAuthority('SCOPE_internal_create_account')")
    @PostMapping("/anonymous")
    public CreateAccountResponse createAnonymousAccount(@RequestBody @Valid CreateAnonymousAccountRequest createAnonymousAccountRequest) {
        return accountService.createAnonymousAccount(createAnonymousAccountRequest);
    }

    @PreAuthorize("hasAuthority('SCOPE_internal_create_account')")
    @PostMapping("/google")
    public LoginWithGoogleResponse loginWithGoogle(@RequestBody @Valid LoginWithGoogleRequest loginWithGoogleRequest) {
        return googleRegistrationService.loginWithGoogle(loginWithGoogleRequest);
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody @Valid UpdatePasswordRequest updatePasswordRequest) {
        accountService.updateCurrentAccountPassword(updatePasswordRequest);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/password/recovery")
    public ResponseEntity<?> recoverPassword(@RequestBody @Valid RecoverPasswordRequest recoverPasswordRequest) {
        accountService.recoverPassword(recoverPasswordRequest);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{id}")
    public AccountResponse findAccountById(@PathVariable String id) {
        return accountService.findAccountById(id);
    }

    @GetMapping("/username/{username}/isAvailable")
    public UsernameAvailabilityResponse isUsernameAvailable(@PathVariable String username) {
        return accountService.isUsernameAvailable(username);
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/email")
    public AccountResponse updateEmail(@RequestBody @Valid UpdateEmailRequest updateEmailRequest) {
        return accountService.updateAccountEmail(updateEmailRequest);
    }

    @GetMapping("/email/{email}/isAvailable")
    public EmailAvailabilityResponse isEmailAvailable(@PathVariable String email) {
        return emailVerificationService.checkEmailAvailability(email);
    }

    @PreAuthorize("hasAuthority('SCOPE_internal_update_account')")
    @PutMapping("/{accountId}/users/{userId}")
    public ResponseEntity<?> addUserToAccount(@PathVariable String accountId,
                                              @PathVariable String userId) {
        accountService.addUserToAccount(accountId, userId);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PreAuthorize("hasAuthority('SCOPE_internal_update_account')")
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
