package chatox.oauth2.service.impl;

import chatox.oauth2.api.request.CreateAccountRequest;
import chatox.oauth2.api.request.CreateAnonymousAccountRequest;
import chatox.oauth2.api.request.RecoverPasswordRequest;
import chatox.oauth2.api.request.UpdatePasswordRequest;
import chatox.oauth2.api.response.AccountResponse;
import chatox.oauth2.api.response.CreateAccountResponse;
import chatox.oauth2.api.response.UsernameAvailabilityResponse;
import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.Client;
import chatox.oauth2.domain.Role;
import chatox.oauth2.exception.AccountNotFoundException;
import chatox.oauth2.exception.ClientNotFoundException;
import chatox.oauth2.exception.EmailConfirmationCodeNotFoundException;
import chatox.oauth2.exception.EmailConfirmationCodeRequiredException;
import chatox.oauth2.exception.EmailConfirmationIdRequiredException;
import chatox.oauth2.exception.EmailHasAlreadyBeenTakenException;
import chatox.oauth2.exception.metadata.EmailConfirmationCodeExpiredException;
import chatox.oauth2.exception.metadata.EmailConfirmationCodeHasAlreadyBeenUsedException;
import chatox.oauth2.exception.metadata.EmailMismatchException;
import chatox.oauth2.exception.metadata.InvalidEmailConfirmationCodeCodeException;
import chatox.oauth2.exception.metadata.InvalidPasswordException;
import chatox.oauth2.mapper.AccountMapper;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.ClientRepository;
import chatox.oauth2.respository.EmailConfirmationCodeRepository;
import chatox.oauth2.respository.GlobalBanRepository;
import chatox.oauth2.respository.UserRoleRepository;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.security.CustomClientDetails;
import chatox.oauth2.security.CustomUserDetails;
import chatox.oauth2.security.token.TokenGeneratorHelper;
import chatox.oauth2.service.AccountService;
import chatox.platform.time.TimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
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
    private final AccountMapper accountMapper;
    private final GlobalBanRepository globalBanRepository;
    private final AuthenticationFacade authenticationFacade;
    private final TimeService timeService;
    private final TokenGeneratorHelper tokenGeneratorHelper;

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

        if (emailInfoPresent) {
            if (accountRepository.existsByEmail(createAccountRequest.getEmail())) {
                throw new EmailHasAlreadyBeenTakenException(String.format(
                        "Email %s has already been taken", createAccountRequest.getEmail()
                ));
            }

            var emailConfirmationCode = emailConfirmationCodeRepository.findById(createAccountRequest.getEmailConfirmationCodeId())
                    .orElseThrow(() -> new EmailConfirmationCodeNotFoundException(
                            String.format(
                                    "Could not find email confirmation code with id %s",
                                    createAccountRequest.getEmailConfirmationCodeId()
                            )
                    ));

            if (!emailConfirmationCode.getEmail().equals(createAccountRequest.getEmail())) {
                throw new EmailMismatchException(
                        "Email provided in request does not match with email in email verification with the specified id"
                );
            }

            if (!passwordEncoder.matches(
                    createAccountRequest.getEmailConfirmationCode(),
                    emailConfirmationCode.getConfirmationCodeHash())) {
                throw new InvalidEmailConfirmationCodeCodeException("Provided email confirmation code is invalid");
            }

            if (ZonedDateTime.now().isAfter(emailConfirmationCode.getExpiresAt())) {
                throw new EmailConfirmationCodeExpiredException("This email confirmation code has expired");
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

        var tokenPair = tokenGeneratorHelper.generateTokenPair(new CustomUserDetails(account), new CustomClientDetails(client));
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
                .username("account-" + UUID.randomUUID().toString())
                .userIds(new ArrayList<>(Arrays.asList(createAnonymousAccountRequest.getUserId())))
                .build();

        accountRepository.save(account);

        var tokenPair = tokenGeneratorHelper.generateTokenPair(new CustomUserDetails(account), new CustomClientDetails(client));
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
        var currentAccount = accountRepository.findById(currentUserDetails.getAccountId()).get();

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

            var emailVerification = emailConfirmationCodeRepository.findById(updatePasswordRequest.getEmailConfirmationCodeId())
                    .orElseThrow(() -> new EmailConfirmationCodeNotFoundException(
                            "Could not find email confirmation with provided id"
                    ));

            if (emailVerification.getCompletedAt() != null) {
                throw new EmailConfirmationCodeHasAlreadyBeenUsedException("This email confirmation code has already been used");
            }

            if (timeService.now().isAfter(emailVerification.getExpiresAt())) {
                throw new EmailConfirmationCodeExpiredException("This email confirmation has expired");
            }

            if (!emailVerification.getEmail().equals(currentAccount.getEmail())) {
                throw new EmailMismatchException();
            }

            if (!passwordEncoder.matches(updatePasswordRequest.getEmailConfirmationCode(), emailVerification.getConfirmationCodeHash())) {
                throw new InvalidEmailConfirmationCodeCodeException("Provided email verification code is invalid");
            }

            emailVerification.setCompletedAt(timeService.now());
            emailConfirmationCodeRepository.save(emailVerification);
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
        var emailConfirmationCode = emailConfirmationCodeRepository.findById(recoverPasswordRequest.getEmailConfirmationCodeId())
                .orElseThrow(() -> new EmailConfirmationCodeNotFoundException("Could not find email confirmation code with id " + recoverPasswordRequest.getEmailConfirmationCodeId()));

        var now = timeService.now();

        if (emailConfirmationCode.getCompletedAt() != null) {
            throw new EmailConfirmationCodeHasAlreadyBeenUsedException("This email confirmation code has already been used");
        }

        if (emailConfirmationCode.getExpiresAt().isBefore(now)) {
            throw new EmailConfirmationCodeExpiredException(
                    "This email confirmation code has expired"
            );
        }

        if (!passwordEncoder.matches(recoverPasswordRequest.getEmailConfirmationCode(), emailConfirmationCode.getConfirmationCodeHash())) {
            throw new InvalidEmailConfirmationCodeCodeException();
        }

        var email = emailConfirmationCode.getEmail();
        var account = accountRepository.findByEmail(email)
                .orElseThrow(AccountNotFoundException::new); // Should never happen
        account.setPasswordHash(passwordEncoder.encode(recoverPasswordRequest.getPassword()));
        accountRepository.save(account);
        emailConfirmationCode.setCompletedAt(timeService.now());
        emailConfirmationCodeRepository.save(emailConfirmationCode);
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
