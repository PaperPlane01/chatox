package chatox.oauth2.service;

import chatox.oauth2.api.request.UpdatePasswordRequest;
import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.EmailVerification;
import chatox.oauth2.domain.EmailVerificationType;
import chatox.oauth2.exception.EmailConfirmationIdRequiredException;
import chatox.oauth2.exception.EmailConfirmationVerificationCodeRequiredException;
import chatox.oauth2.exception.EmailMismatchException;
import chatox.oauth2.exception.EmailVerificationExpiredException;
import chatox.oauth2.exception.EmailVerificationNotFoundException;
import chatox.oauth2.exception.InvalidEmailVerificationCodeException;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.EmailVerificationRepository;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.security.CustomUserDetails;
import chatox.oauth2.service.impl.AccountServiceImpl;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class AccountServiceTests {
    @Mock
    AccountRepository accountRepository;

    @Mock
    AuthenticationFacade authenticationFacade;

    @Mock
    TimeService timeService;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    EmailVerificationRepository emailVerificationRepository;

    @InjectMocks
    AccountServiceImpl accountService;

    @Before
    public void setPasswordEncoder() {
        accountService.setPasswordEncoder(passwordEncoder);
    }

    @Test
    public void updatePassword_updatesPassword_whenCurrentUserHasNoEmail() {
        // Setup
        var account = Account.builder()
                .id("1")
                .email(null)
                .roles(Collections.emptyList())
                .passwordHash("test")
                .build();
        var userDetails = new CustomUserDetails(account);
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(userDetails.getAccountId())).thenReturn(Optional.of(account));
        when(passwordEncoder.encode("test2")).thenReturn("test2encoded");

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .password("test2")
                .repeatedPassword("test2")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);

        // Verify results
        var resultAccount = Account.builder()
                .id("1")
                .email(null)
                .passwordHash("test2encoded")
                .roles(Collections.emptyList())
                .build();
        verify(accountRepository, times(1)).save(resultAccount);
    }

    @Test
    public void updatePassword_updatesPassword_whenCurrentUserHasEmail() {
        // Setup
        var now = ZonedDateTime.now();
        var minuteAgo = now.minusMinutes(1L);
        var twentyNineMinutesAfter = now.plusMinutes(29L);
        var account = Account.builder()
                .id("1")
                .roles(Collections.emptyList())
                .email("test@gmail.com")
                .passwordHash("test1")
                .build();
        var userDetails = new CustomUserDetails(account);
        var emailVerification = EmailVerification.builder()
                .id("1")
                .createdAt(minuteAgo)
                .expiresAt(twentyNineMinutesAfter)
                .type(EmailVerificationType.CONFIRM_PASSWORD_RESET)
                .verificationCodeHash("emailVerificationHash")
                .email("test@gmail.com")
                .build();
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(emailVerificationRepository.findById(emailVerification.getId())).thenReturn(Optional.of(emailVerification));
        when(timeService.now()).thenReturn(now);
        when(passwordEncoder.matches("emailVerificationCode", "emailVerificationHash")).thenReturn(true);
        when(passwordEncoder.encode("test2")).thenReturn("test2encoded");

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationId("1")
                .emailConfirmationVerificationCode("emailVerificationCode")
                .password("test2")
                .repeatedPassword("test2")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);

        // Verify result
        var resultAccount = Account.builder()
                .id("1")
                .roles(Collections.emptyList())
                .email("test@gmail.com")
                .passwordHash("test2encoded")
                .build();
        verify(emailVerificationRepository, times(1)).findById("1");
        verify(accountRepository, times(1)).save(resultAccount);
    }

    @Test(expected = EmailConfirmationIdRequiredException.class)
    public void updatePassword_throwsException_whenCurrentUserHasEmailAndEmailVerificationIdNotProvided() {
        // Setup
        var account = Account.builder()
                .id("1")
                .email("test@gmail.com")
                .roles(Collections.emptyList())
                .build();
        var userDetails = new CustomUserDetails(account);
        when(accountRepository.findById("1")).thenReturn(Optional.of(account));
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .password("test2")
                .repeatedPassword("test2")
                .emailConfirmationId(null)
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailConfirmationVerificationCodeRequiredException.class)
    public void updatePassword_throwsException_whenCurrentUserHasEmailAndVerificationCodeNotProvided() {
        // Setup
        var account = Account.builder()
                .id("1")
                .email("test@gmail.com")
                .roles(Collections.emptyList())
                .build();
        var userDetails = new CustomUserDetails(account);
        when(accountRepository.findById("1")).thenReturn(Optional.of(account));
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationId("1")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailVerificationNotFoundException.class)
    public void updatePassword_throwsException_whenEmailVerificationNotFound() {
        // Setup
        var account = Account.builder()
                .id("1")
                .email("test@gmail.com")
                .roles(Collections.emptyList())
                .build();
        var userDetails = new CustomUserDetails(account);
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(emailVerificationRepository.findById("1")).thenReturn(Optional.empty());

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationId("1")
                .emailConfirmationVerificationCode("code")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailVerificationExpiredException.class)
    public void updatePassword_throwsException_whenEmailVerificationHasExpired() {
        // Setup
        var now = ZonedDateTime.now();
        var thirtyMinutesAgo = now.minusMinutes(30L);
        var hourAgo = now.minusHours(1L);
        var account = Account.builder()
                .id("1")
                .email("test@gmail.com")
                .roles(Collections.emptyList())
                .build();
        var emailVerification = EmailVerification.builder()
                .id("1")
                .createdAt(hourAgo)
                .expiresAt(thirtyMinutesAgo)
                .type(EmailVerificationType.CONFIRM_PASSWORD_RESET)
                .verificationCodeHash("emailVerificationHash")
                .email("test@gmail.com")
                .build();
        var userDetails = new CustomUserDetails(account);
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(emailVerificationRepository.findById("1")).thenReturn(Optional.of(emailVerification));
        when(timeService.now()).thenReturn(now);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationId("1")
                .emailConfirmationVerificationCode("code")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailMismatchException.class)
    public void updatePassword_throwsException_whenCurrentUserHasDifferentEmailThanSpecifiedInEmailVerification() {
        // Setup
        var now = ZonedDateTime.now();
        var minuteAgo = now.minusMinutes(1L);
        var twentyNineMinutesAfter = now.plusMinutes(29L);
        var account = Account.builder()
                .id("1")
                .roles(Collections.emptyList())
                .email("test@gmail.com")
                .passwordHash("test1")
                .build();
        var userDetails = new CustomUserDetails(account);
        var emailVerification = EmailVerification.builder()
                .id("1")
                .createdAt(minuteAgo)
                .expiresAt(twentyNineMinutesAfter)
                .type(EmailVerificationType.CONFIRM_PASSWORD_RESET)
                .verificationCodeHash("emailVerificationHash")
                .email("different_email@gmail.com")
                .build();
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(emailVerificationRepository.findById("1")).thenReturn(Optional.of(emailVerification));
        when(timeService.now()).thenReturn(now);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationId("1")
                .emailConfirmationVerificationCode("code")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = InvalidEmailVerificationCodeException.class)
    public void updatePassword_throwsException_whenVerificationCodeIsInvalid() {
        // Setup
        var now = ZonedDateTime.now();
        var minuteAgo = now.minusMinutes(1L);
        var twentyNineMinutesAfter = now.plusMinutes(29L);
        var account = Account.builder()
                .id("1")
                .roles(Collections.emptyList())
                .email("test@gmail.com")
                .passwordHash("test1")
                .build();
        var userDetails = new CustomUserDetails(account);
        var emailVerification = EmailVerification.builder()
                .id("1")
                .createdAt(minuteAgo)
                .expiresAt(twentyNineMinutesAfter)
                .type(EmailVerificationType.CONFIRM_PASSWORD_RESET)
                .verificationCodeHash("emailVerificationHash")
                .email("test@gmail.com")
                .build();
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(emailVerificationRepository.findById(emailVerification.getId())).thenReturn(Optional.of(emailVerification));
        when(timeService.now()).thenReturn(now);
        when(passwordEncoder.matches("emailVerificationCode", "emailVerificationHash")).thenReturn(false);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationId("1")
                .emailConfirmationVerificationCode("emailVerificationCode")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }
}
