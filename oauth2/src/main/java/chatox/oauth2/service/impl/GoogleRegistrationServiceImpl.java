package chatox.oauth2.service.impl;

import chatox.oauth2.api.request.LoginWithGoogleRequest;
import chatox.oauth2.api.response.ExternalAccountDetailsResponse;
import chatox.oauth2.api.response.LoginWithGoogleResponse;
import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.AccountRegistrationType;
import chatox.oauth2.domain.Role;
import chatox.oauth2.exception.GoogleAccountRetrievalException;
import chatox.oauth2.mapper.AccountMapper;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.UserRoleRepository;
import chatox.oauth2.security.CustomUserDetails;
import chatox.oauth2.security.token.TokenGeneratorHelper;
import chatox.oauth2.service.ClientService;
import chatox.oauth2.service.GoogleRegistrationService;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson.JacksonFactory;
import com.google.api.services.oauth2.Oauth2;
import com.google.api.services.oauth2.model.Userinfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class GoogleRegistrationServiceImpl implements GoogleRegistrationService {
    private final AccountRepository accountRepository;
    private final UserRoleRepository userRoleRepository;
    private final ClientService clientService;
    private final PasswordEncoder passwordEncoder;
    private final TokenGeneratorHelper tokenGeneratorHelper;
    private final AccountMapper accountMapper;

    @Override
    public LoginWithGoogleResponse loginWithGoogle(LoginWithGoogleRequest loginWithGoogleRequest) {
        log.debug("Registerring user with google account");
        var clientDetails = clientService.findById(loginWithGoogleRequest.getClientId());

        if (!passwordEncoder.matches(loginWithGoogleRequest.getClientSecret(), clientDetails.getClientSecret())) {
            log.debug("Client credentials are invalid");
            throw new BadCredentialsException("Bad credentials");
        }

        var googleCredential = new GoogleCredential().setAccessToken(loginWithGoogleRequest.getGoogleAccessToken());
        googleCredential.setAccessToken(loginWithGoogleRequest.getGoogleAccessToken());
        var oauth2 = new Oauth2.Builder(
                new NetHttpTransport(),
                new JacksonFactory(),
                googleCredential
        )
                .build();

        try {
            var userInfo = oauth2.userinfo().get().execute();
            var existingAccount = accountRepository.findByExternalAccountIdAndType(userInfo.getId(), AccountRegistrationType.GOOGLE);
            Account account;
            String userId;
            var externalAccountDetails = ExternalAccountDetailsResponse.builder()
                    .firstName(userInfo.getName())
                    .avatarUri(userInfo.getPicture())
                    .build();
            var newAccountCreated = false;

            if (existingAccount.isEmpty()) {
                log.debug("Creating new account based on google info");
                account = createGoogleAccount(userInfo, loginWithGoogleRequest.getAccountId(), loginWithGoogleRequest.getUserId());
                newAccountCreated = true;
                userId = loginWithGoogleRequest.getUserId();
            } else {
                log.debug("Google account has already been registered");
                account = existingAccount.get();
                userId = account.getUserIds().get(0);
            }

            var tokenPair = tokenGeneratorHelper.generateTokenPair(new CustomUserDetails(account), clientDetails);

            return LoginWithGoogleResponse.builder()
                    .accessToken(tokenPair.getAccessToken())
                    .refreshToken(tokenPair.getRefreshToken())
                    .account(accountMapper.toAccountResponse(account))
                    .newAccountCreated(newAccountCreated)
                    .externalAccountDetails(externalAccountDetails)
                    .userId(userId)
                    .build();
        } catch (IOException exception) {
            log.error("Error occurred when tried to log in with Google account", exception);
            throw new GoogleAccountRetrievalException("Failed to retrieve google account");
        }
    }

    private Account createGoogleAccount(Userinfo userinfo, String id, String userId) {
        var role = userRoleRepository.findByRole(Role.ROLE_USER);
        var account = Account.builder()
                .id(id)
                .externalAccountId(userinfo.getId())
                .type(AccountRegistrationType.GOOGLE)
                .enabled(true)
                .locked(false)
                .roles(List.of(role))
                .email(userinfo.getEmail())
                .userIds(List.of(userId))
                .username("google-account-" + userinfo.getId())
                .build();

        return accountRepository.save(account);
    }
}
