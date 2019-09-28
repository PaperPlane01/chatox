package chatox.oauth2.service;

import chatox.oauth2.api.request.CreateAccountRequest;
import chatox.oauth2.api.request.CreateAnonymousAccountRequest;
import chatox.oauth2.api.request.UpdatePasswordRequest;
import chatox.oauth2.api.response.AccountResponse;
import chatox.oauth2.api.response.CreateAccountResponse;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface AccountService extends UserDetailsService {
    CreateAccountResponse createAccount(CreateAccountRequest createAccountRequest);
    CreateAccountResponse createAnonymousAccount(CreateAnonymousAccountRequest createAnonymousAccountRequest);
    AccountResponse findAccountById(String id);
    void lockAccount(String id);
    void unlockAccount(String id);
    void updateCurrentAccountPassword(UpdatePasswordRequest updatePasswordRequest);
    void addUserToAccount(String accountId, String userId);
    void removeUserFromAccount(String accountId, String userId);
}
