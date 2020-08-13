package chatox.oauth2.service.impl;

import chatox.oauth2.api.request.CreateAccountRequest;
import chatox.oauth2.api.request.CreateAnonymousAccountRequest;
import chatox.oauth2.api.request.UpdatePasswordRequest;
import chatox.oauth2.api.response.AccountResponse;
import chatox.oauth2.api.response.CreateAccountResponse;
import chatox.oauth2.api.response.UsernameAvailabilityResponse;
import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.Client;
import chatox.oauth2.domain.Role;
import chatox.oauth2.exception.AccountNotFoundException;
import chatox.oauth2.exception.ClientNotFoundException;
import chatox.oauth2.exception.EmailConfirmationIdRequiredException;
import chatox.oauth2.exception.EmailConfirmationVerificationCodeRequiredException;
import chatox.oauth2.exception.EmailHasAlreadyBeenTakenException;
import chatox.oauth2.exception.EmailMismatchException;
import chatox.oauth2.exception.EmailVerificationExpiredException;
import chatox.oauth2.exception.EmailVerificationNotFoundException;
import chatox.oauth2.exception.InvalidEmailVerificationCodeException;
import chatox.oauth2.mapper.AccountMapper;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.ClientRepository;
import chatox.oauth2.respository.EmailVerificationRepository;
import chatox.oauth2.respository.UserRoleRepository;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.security.CustomClientDetails;
import chatox.oauth2.security.CustomUserDetails;
import chatox.oauth2.service.AccountService;
import chatox.oauth2.service.TimeService;
import chatox.oauth2.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.util.OAuth2Utils;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.security.oauth2.provider.token.store.JdbcTokenStore;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final ClientRepository clientRepository;
    private final UserRoleRepository userRoleRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final AccountMapper accountMapper;
    private final AuthenticationFacade authenticationFacade;
    private final TimeService timeService;

    private JdbcTokenStore tokenStore;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public void setTokenStore(JdbcTokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public CreateAccountResponse createAccount(CreateAccountRequest createAccountRequest) {
        var client = findClientById(createAccountRequest.getClientId());

        if (Util.allNotNull(
                createAccountRequest.getEmail(),
                createAccountRequest.getEmailVerificationConfirmationCode(),
                createAccountRequest.getEmailVerificationId())) {
            if (accountRepository.existsByEmail(createAccountRequest.getEmail())) {
                throw new EmailHasAlreadyBeenTakenException(String.format(
                        "Email %s has already been taken", createAccountRequest.getEmail()
                ));
            }

            var emailVerification = emailVerificationRepository.findById(createAccountRequest.getEmailVerificationId())
                    .orElseThrow(() -> new EmailVerificationNotFoundException(
                            String.format(
                                    "Could not find email verification with id %s",
                                    createAccountRequest.getEmailVerificationId()
                            )
                    ));

            if (!emailVerification.getEmail().equals(createAccountRequest.getEmail())) {
                throw new EmailMismatchException(
                        "Email provided in request does not match with email in email verification with the specified id"
                );
            }

            if (!passwordEncoder.matches(
                    createAccountRequest.getEmailVerificationConfirmationCode(),
                    emailVerification.getVerificationCodeHash())) {
                throw new InvalidEmailVerificationCodeException("Provided email verification code is invalid");
            }

            if (ZonedDateTime.now().isAfter(emailVerification.getExpiresAt())) {
                throw new EmailVerificationExpiredException("This email verification code has expired");
            }
        }

        var account = Account.builder()
                .id(createAccountRequest.getId())
                .enabled(true)
                .locked(false)
                .roles(new ArrayList<>(Arrays.asList(userRoleRepository.findByRole(Role.ROLE_USER))))
                .passwordHash(passwordEncoder.encode(createAccountRequest.getPassword()))
                .username(createAccountRequest.getUsername())
                .userIds(new ArrayList<>(Arrays.asList(createAccountRequest.getUserId())))
                .email(createAccountRequest.getEmail())
                .build();

        accountRepository.save(account);

        var accessToken = createTokenForRegisteredUser(new CustomUserDetails(account), new CustomClientDetails(client));
        var refreshToken = accessToken.getRefreshToken();

        return CreateAccountResponse.builder()
                .account(accountMapper.toAccountResponse(account))
                .accessToken(accessToken.getValue())
                .refreshToken(refreshToken.getValue())
                .build();
    }

    @Override
    public CreateAccountResponse createAnonymousAccount(CreateAnonymousAccountRequest createAnonymousAccountRequest) {
        var client = findClientById(createAnonymousAccountRequest.getClientId());

        var account = Account.builder()
                .id(createAnonymousAccountRequest.getId())
                .enabled(true)
                .locked(false)
                .roles(new ArrayList<>(Arrays.asList(userRoleRepository.findByRole(Role.ROLE_ANONYMOUS_USER))))
                .passwordHash(null)
                .username("account-" + UUID.randomUUID().toString())
                .userIds(new ArrayList<>(Arrays.asList(createAnonymousAccountRequest.getUserId())))
                .build();

        accountRepository.save(account);

        var accessToken = createTokenForRegisteredUser(new CustomUserDetails(account), new CustomClientDetails(client));
        var refreshToken = accessToken.getRefreshToken();

        return CreateAccountResponse.builder()
                .account(accountMapper.toAccountResponse(account))
                .accessToken(accessToken.getValue())
                .refreshToken(refreshToken.getValue())
                .build();
    }

    private OAuth2AccessToken createTokenForRegisteredUser(UserDetails userDetails, ClientDetails clientDetails) {
        HashMap<String, String> authorizationParameters = new LinkedHashMap<>();
        authorizationParameters.put(OAuth2Utils.SCOPE, convertScopeToString(clientDetails.getScope()));
        authorizationParameters.put(OAuth2Utils.CLIENT_ID, clientDetails.getClientId());
        authorizationParameters.put(OAuth2Utils.GRANT_TYPE, "implicit");

        String redirectUri = null;

        if (clientDetails.getRegisteredRedirectUri() != null
                && !clientDetails.getRegisteredRedirectUri().isEmpty()) {
            redirectUri = (new ArrayList<>(clientDetails.getRegisteredRedirectUri())).get(0);
        }
        OAuth2Request oAuth2Request = new OAuth2Request(
                authorizationParameters,
                clientDetails.getClientId(),
                userDetails.getAuthorities(),
                true,
                clientDetails.getScope(),
                clientDetails.getResourceIds(),
                redirectUri,
                clientDetails.getAuthorizedGrantTypes(),
                new HashMap<>()
        );
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken
                = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        OAuth2Authentication oAuth2Authentication = new OAuth2Authentication(oAuth2Request,
                usernamePasswordAuthenticationToken);
        DefaultTokenServices defaultTokenServices = new DefaultTokenServices();
        defaultTokenServices.setSupportRefreshToken(true);
        defaultTokenServices.setTokenStore(tokenStore);
        defaultTokenServices.setAccessTokenValiditySeconds(clientDetails.getAccessTokenValiditySeconds());
        defaultTokenServices.setRefreshTokenValiditySeconds(clientDetails.getRefreshTokenValiditySeconds());
        return defaultTokenServices.createAccessToken(oAuth2Authentication);
    }

    private String convertScopeToString(Set<String> scope) {
        StringBuilder stringBuilder = new StringBuilder();
        List<String> scopeList = new ArrayList<>(scope);

        for (int index = 0; index < scopeList.size(); index++) {
            stringBuilder.append(scopeList.get(index));

            if (index != scopeList.size() - 1) {
                stringBuilder.append(" ");
            }
        }

        return stringBuilder.toString();
    }

    @Override
    public AccountResponse findAccountById(String id) {
        return accountMapper.toAccountResponse(findById(id));
    }

    @Override
    public UsernameAvailabilityResponse isUsernameAvailable(String username) {
        return UsernameAvailabilityResponse.builder()
                .available(accountRepository.findByUsername(username).isEmpty())
                .build();
    }

    @Override
    public void lockAccount(String id) {
        var account = findById(id);
        account.setLocked(true);
        accountRepository.save(account);
    }

    @Override
    public void unlockAccount(String id) {
        var account = findById(id);
        account.setLocked(false);
        accountRepository.save(account);
    }

    @Override
    public void updateCurrentAccountPassword(UpdatePasswordRequest updatePasswordRequest) {
        var currentUserDetails = authenticationFacade.getCurrentUserDetails();
        var currentAccount = accountRepository.findById(currentUserDetails.getAccountId()).get();

        if (currentAccount.getEmail() != null) {
            if (updatePasswordRequest.getEmailConfirmationId() == null) {
                throw new EmailConfirmationIdRequiredException(
                        "This account has email, so emailConfirmationId is required"
                );
            }

            if (updatePasswordRequest.getEmailConfirmationVerificationCode() == null) {
                throw new EmailConfirmationVerificationCodeRequiredException(
                        "This account has email, so emailConfirmationVerificationCode is required"
                );
            }

            var emailVerification = emailVerificationRepository.findById(updatePasswordRequest.getEmailConfirmationId())
                    .orElseThrow(() -> new EmailVerificationNotFoundException(
                            "Could not find email confirmation with provided id"
                    ));

            if (timeService.now().isAfter(emailVerification.getExpiresAt())) {
                throw new EmailVerificationExpiredException("This email confirmation has expired");
            }

            if (!emailVerification.getEmail().equals(currentAccount.getEmail())) {
                throw new EmailMismatchException();
            }

            if (!passwordEncoder.matches(updatePasswordRequest.getEmailConfirmationVerificationCode(), emailVerification.getVerificationCodeHash())) {
                throw new InvalidEmailVerificationCodeException("Provided email verification code is invalid");
            }
        }

        currentAccount.setPasswordHash(passwordEncoder.encode(updatePasswordRequest.getPassword()));
        accountRepository.save(currentAccount);
    }

    @Override
    public void addUserToAccount(String accountId, String userId) {
        var account = findById(accountId);
        account.getUserIds().add(userId);
        accountRepository.save(account);
    }

    @Override
    public void removeUserFromAccount(String accountId, String userId) {
        var account = findById(accountId);
        account.setUserIds(account.getUserIds().stream().filter(id -> !id.equals(userId)).collect(Collectors.toList()));
        accountRepository.save(account);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return new CustomUserDetails(
                accountRepository.findByUsername(username)
                        .orElseThrow(() -> new UsernameNotFoundException("Bad credentials"))
        );
    }

    private Account findById(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Could not find account with id " + id));
    }

    private Client findClientById(String id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException("Could not find client with id " + id));
    }
}
