package chatox.oauth2.service.impl;

import chatox.oauth2.api.request.CreateAccountRequest;
import chatox.oauth2.api.request.CreateAnonymousAccountRequest;
import chatox.oauth2.api.request.RecoverPasswordRequest;
import chatox.oauth2.api.request.UpdateEmailRequest;
import chatox.oauth2.api.request.UpdatePasswordRequest;
import chatox.oauth2.api.response.AccountResponse;
import chatox.oauth2.api.response.CreateAccountResponse;
import chatox.oauth2.api.response.UsernameAvailabilityResponse;
import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.Client;
import chatox.oauth2.domain.EmailConfirmationCode;
import chatox.oauth2.domain.Role;
import chatox.oauth2.exception.AccountNotFoundException;
import chatox.oauth2.exception.ClientNotFoundException;
import chatox.oauth2.exception.EmailConfirmationCodeRequiredException;
import chatox.oauth2.exception.EmailConfirmationIdRequiredException;
import chatox.oauth2.exception.EmailHasAlreadyBeenTakenException;
import chatox.oauth2.exception.OldEmailMissingException;
import chatox.oauth2.exception.metadata.InvalidPasswordException;
import chatox.oauth2.mapper.AccountMapper;
import chatox.oauth2.messaging.rabbitmq.event.EmailUpdated;
import chatox.oauth2.messaging.rabbitmq.event.publisher.AccountEventsPublisher;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.ClientRepository;
import chatox.oauth2.respository.EmailConfirmationCodeRepository;
import chatox.oauth2.respository.UserRoleRepository;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.security.CustomUserDetails;
import chatox.oauth2.security.token.TokenGeneratorHelper;
import chatox.oauth2.service.AccountService;
import chatox.oauth2.service.EmailConfirmationCodeService;
import chatox.platform.time.TimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final ClientRepository clientRepository;
    private final UserRoleRepository userRoleRepository;
    private final EmailConfirmationCodeRepository emailConfirmationCodeRepository;
    private final EmailConfirmationCodeService emailConfirmationCodeService;
    private final AccountMapper accountMapper;
    private final AuthenticationFacade authenticationFacade;
    private final TimeService timeService;
    private final TokenGeneratorHelper tokenGeneratorHelper;
    private final AccountEventsPublisher accountEventsPublisher;

    private PasswordEncoder passwordEncoder;

    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public CreateAccountResponse createAccount(CreateAccountRequest createAccountRequest) {
        var client = findClientById(createAccountRequest.getClientId());

        var emailInfoPresent = Stream.of(
                createAccountRequest.getEmail(),
                createAccountRequest.getEmailConfirmationCode(),
                createAccountRequest.getEmailConfirmationCodeId()
        )
                .allMatch(Objects::nonNull);
        EmailConfirmationCode emailConfirmationCode = null;

        if (emailInfoPresent) {
            if (accountRepository.existsByEmail(createAccountRequest.getEmail())) {
                throw new EmailHasAlreadyBeenTakenException(String.format(
                        "Email %s has already been taken", createAccountRequest.getEmail()
                ));
            }

            emailConfirmationCode = emailConfirmationCodeService.requireEmailConfirmationCode(
                    createAccountRequest.getEmailConfirmationCodeId(),
                    createAccountRequest.getEmailConfirmationCode(),
                    createAccountRequest.getEmail()
            );
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

        if (emailConfirmationCode != null) {
            emailConfirmationCode.setCompletedAt(timeService.now());
            emailConfirmationCodeRepository.save(emailConfirmationCode);
        }

        var tokenPair = tokenGeneratorHelper.generateTokenPair(new CustomUserDetails(account), client.toRegisteredClient());
        var accessToken = tokenPair.getAccessToken();
        var refreshToken = tokenPair.getRefreshToken();

        return CreateAccountResponse.builder()
                .account(accountMapper.toAccountResponse(account))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
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
                .username("account-" + UUID.randomUUID())
                .userIds(new ArrayList<>(Arrays.asList(createAnonymousAccountRequest.getUserId())))
                .build();

        accountRepository.save(account);

        var tokenPair = tokenGeneratorHelper.generateTokenPair(new CustomUserDetails(account), client.toRegisteredClient());
        var accessToken = tokenPair.getAccessToken();
        var refreshToken = tokenPair.getRefreshToken();

        return CreateAccountResponse.builder()
                .account(accountMapper.toAccountResponse(account))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
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
        var currentAccount = currentUserDetails.getAccount();

        if (!passwordEncoder.matches(updatePasswordRequest.getCurrentPassword(), currentAccount.getPasswordHash())) {
            throw new InvalidPasswordException("Current user has different password");
        }

        if (currentAccount.getEmail() != null) {
            if (updatePasswordRequest.getEmailConfirmationCodeId() == null) {
                throw new EmailConfirmationIdRequiredException(
                        "This account has email, so emailConfirmationId is required"
                );
            }

            if (updatePasswordRequest.getEmailConfirmationCode() == null) {
                throw new EmailConfirmationCodeRequiredException(
                        "This account has email, so emailConfirmationVerificationCode is required"
                );
            }

            var emailConfirmationCode = emailConfirmationCodeService.requireEmailConfirmationCode(
                    updatePasswordRequest.getEmailConfirmationCodeId(),
                    updatePasswordRequest.getEmailConfirmationCode(),
                    currentAccount.getEmail()
            );

            emailConfirmationCode.setCompletedAt(timeService.now());
            emailConfirmationCodeRepository.save(emailConfirmationCode);
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
    public void recoverPassword(RecoverPasswordRequest recoverPasswordRequest) {
        var emailConfirmationCode = emailConfirmationCodeService.requireEmailConfirmationCode(
                recoverPasswordRequest.getEmailConfirmationCodeId(),
                recoverPasswordRequest.getEmailConfirmationCode()
        );
        var email = emailConfirmationCode.getEmail();
        var account = accountRepository.findByEmail(email)
                .orElseThrow(AccountNotFoundException::new); // Should never happen
        account.setPasswordHash(passwordEncoder.encode(recoverPasswordRequest.getPassword()));
        accountRepository.save(account);
        emailConfirmationCode.setCompletedAt(timeService.now());
        emailConfirmationCodeRepository.save(emailConfirmationCode);
    }

    @Override
    public AccountResponse updateAccountEmail(UpdateEmailRequest updateEmailRequest) {
        var accountId = authenticationFacade.getCurrentUserDetails().getAccountId();
        var account = findById(accountId);
        EmailConfirmationCode changeEmailConfirmationCode = null;

        if (account.getEmail() != null) {
            if (updateEmailRequest.getOldEmail() == null) {
                throw new OldEmailMissingException();
            }

            changeEmailConfirmationCode = emailConfirmationCodeService.requireEmailConfirmationCode(
                    updateEmailRequest.getChangeEmailConfirmationCodeId(),
                    updateEmailRequest.getChangeEmailConfirmationCode(),
                    account.getEmail()
            );
        }

        var newEmailConfirmationCode = emailConfirmationCodeService.requireEmailConfirmationCode(
                updateEmailRequest.getNewEmailConfirmationCodeId(),
                updateEmailRequest.getNewEmailConfirmationCode(),
                updateEmailRequest.getNewEmail()
        );

        if (changeEmailConfirmationCode != null) {
            changeEmailConfirmationCode.setCompletedAt(timeService.now());
        }

        newEmailConfirmationCode.setCompletedAt(timeService.now());

        emailConfirmationCodeRepository.saveAll(
                Stream.of(changeEmailConfirmationCode, newEmailConfirmationCode)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList())
        );

        account.setEmail(updateEmailRequest.getNewEmail());
        accountRepository.save(account);

        accountEventsPublisher.emailUpdated(new EmailUpdated(account.getId(), account.getEmail()));

        return accountMapper.toAccountResponse(account);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Bad credentials"));
        return new CustomUserDetails(account);
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
