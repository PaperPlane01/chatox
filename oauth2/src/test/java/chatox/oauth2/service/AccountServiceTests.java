package chatox.oauth2.service;

import chatox.oauth2.api.request.RecoverPasswordRequest;
import chatox.oauth2.api.request.UpdatePasswordRequest;
import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.EmailConfirmationCode;
import chatox.oauth2.domain.EmailConfirmationCodeType;
import chatox.oauth2.exception.EmailConfirmationCodeRequiredException;
import chatox.oauth2.exception.EmailConfirmationIdRequiredException;
import chatox.oauth2.exception.metadata.EmailConfirmationCodeHasAlreadyBeenUsedException;
import chatox.oauth2.exception.metadata.EmailMismatchException;
import chatox.oauth2.exception.metadata.EmailConfirmationCodeExpiredException;
import chatox.oauth2.exception.EmailConfirmationCodeNotFoundException;
import chatox.oauth2.exception.metadata.InvalidEmailConfirmationCodeCodeException;
import chatox.oauth2.exception.metadata.InvalidPasswordException;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.EmailConfirmationCodeRepository;
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
    EmailConfirmationCodeRepository emailConfirmationCodeRepository;

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
                .passwordHash("currentPasswordHash")
                .build();
        var userDetails = new CustomUserDetails(account);
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(userDetails.getAccountId())).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("currentPassword", "currentPasswordHash")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newPasswordHash");

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .currentPassword("currentPassword")
                .password("newPassword")
                .repeatedPassword("newPassword")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);

        // Verify results
        var resultAccount = Account.builder()
                .id("1")
                .email(null)
                .passwordHash("newPasswordHash")
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
                .passwordHash("currentPasswordHash")
                .build();
        var userDetails = new CustomUserDetails(account);
        var emailConfirmationCode = EmailConfirmationCode.builder()
                .id("1")
                .createdAt(minuteAgo)
                .expiresAt(twentyNineMinutesAfter)
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RESET)
                .confirmationCodeHash("emailConfirmationCodeHash")
                .email("test@gmail.com")
                .build();
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("currentPassword","currentPasswordHash")).thenReturn(true);
        when(emailConfirmationCodeRepository.findById(emailConfirmationCode.getId())).thenReturn(Optional.of(emailConfirmationCode));
        when(timeService.now()).thenReturn(now);
        when(passwordEncoder.matches("emailConfirmationCodeCode", "emailConfirmationCodeHash")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newPasswordHash");

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("emailConfirmationCodeCode")
                .currentPassword("currentPassword")
                .password("newPassword")
                .repeatedPassword("newPassword")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);

        // Verify result
        var resultAccount = Account.builder()
                .id("1")
                .roles(Collections.emptyList())
                .email("test@gmail.com")
                .passwordHash("newPasswordHash")
                .build();
        verify(emailConfirmationCodeRepository, times(1)).findById("1");
        verify(accountRepository, times(1)).save(resultAccount);
    }

    @Test(expected = InvalidPasswordException.class)
    public void updatePassword_throwsException_whenSuppliedCurrentPasswordIsWrong() {
        // Setup
        var account = Account.builder()
                .id("1")
                .roles(Collections.emptyList())
                .passwordHash("currentPasswordHash")
                .build();
        var userDetails = new CustomUserDetails(account);
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("wrongPassword", "currentPasswordHash")).thenReturn(false);

        // Run the test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .currentPassword("wrongPassword")
                .password("newPassword")
                .repeatedPassword("newPassword")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailConfirmationIdRequiredException.class)
    public void updatePassword_throwsException_whenCurrentUserHasEmailAndEmailConfirmationCodeIdNotProvided() {
        // Setup
        var account = Account.builder()
                .id("1")
                .passwordHash("currentPasswordHash")
                .email("test@gmail.com")
                .roles(Collections.emptyList())
                .build();
        var userDetails = new CustomUserDetails(account);
        when(accountRepository.findById("1")).thenReturn(Optional.of(account));
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(passwordEncoder.matches("currentPassword", "currentPasswordHash")).thenReturn(true);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .currentPassword("currentPassword")
                .password("test2")
                .repeatedPassword("test2")
                .emailConfirmationCodeId(null)
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailConfirmationCodeRequiredException.class)
    public void updatePassword_throwsException_whenCurrentUserHasEmailAndEmailConfirmationCodeCodeNotProvided() {
        // Setup
        var account = Account.builder()
                .id("1")
                .passwordHash("currentPasswordHash")
                .email("test@gmail.com")
                .roles(Collections.emptyList())
                .build();
        var userDetails = new CustomUserDetails(account);
        when(accountRepository.findById("1")).thenReturn(Optional.of(account));
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(passwordEncoder.matches("currentPassword", "currentPasswordHash")).thenReturn(true);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .currentPassword("currentPassword")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailConfirmationCodeNotFoundException.class)
    public void updatePassword_throwsException_whenEmailConfirmationCodeNotFound() {
        // Setup
        var account = Account.builder()
                .id("1")
                .passwordHash("currentPasswordHash")
                .email("test@gmail.com")
                .roles(Collections.emptyList())
                .build();
        var userDetails = new CustomUserDetails(account);
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("currentPassword", "currentPasswordHash")).thenReturn(true);
        when(emailConfirmationCodeRepository.findById("1")).thenReturn(Optional.empty());

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("code")
                .currentPassword("currentPassword")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailConfirmationCodeExpiredException.class)
    public void updatePassword_throwsException_whenEmailConfirmationCodeHasExpired() {
        // Setup
        var now = ZonedDateTime.now();
        var thirtyMinutesAgo = now.minusMinutes(30L);
        var hourAgo = now.minusHours(1L);
        var account = Account.builder()
                .id("1")
                .passwordHash("currentPasswordHash")
                .email("test@gmail.com")
                .roles(Collections.emptyList())
                .build();
        var emailConfirmationCode = EmailConfirmationCode.builder()
                .id("1")
                .createdAt(hourAgo)
                .expiresAt(thirtyMinutesAgo)
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RESET)
                .confirmationCodeHash("emailConfirmationCodeHash")
                .email("test@gmail.com")
                .build();
        var userDetails = new CustomUserDetails(account);
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("currentPassword", "currentPasswordHash")).thenReturn(true);
        when(emailConfirmationCodeRepository.findById("1")).thenReturn(Optional.of(emailConfirmationCode));
        when(timeService.now()).thenReturn(now);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .currentPassword("currentPassword")
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("code")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = EmailMismatchException.class)
    public void updatePassword_throwsException_whenCurrentUserHasDifferentEmailThanSpecifiedInEmailConfirmationCode() {
        // Setup
        var now = ZonedDateTime.now();
        var minuteAgo = now.minusMinutes(1L);
        var twentyNineMinutesAfter = now.plusMinutes(29L);
        var account = Account.builder()
                .id("1")
                .passwordHash("currentPasswordHash")
                .roles(Collections.emptyList())
                .email("test@gmail.com")
                .build();
        var userDetails = new CustomUserDetails(account);
        var emailConfirmationCode = EmailConfirmationCode.builder()
                .id("1")
                .createdAt(minuteAgo)
                .expiresAt(twentyNineMinutesAfter)
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RESET)
                .confirmationCodeHash("emailConfirmationCodeHash")
                .email("different_email@gmail.com")
                .build();
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("currentPassword","currentPasswordHash")).thenReturn(true);
        when(emailConfirmationCodeRepository.findById("1")).thenReturn(Optional.of(emailConfirmationCode));
        when(timeService.now()).thenReturn(now);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("code")
                .currentPassword("currentPassword")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test(expected = InvalidEmailConfirmationCodeCodeException.class)
    public void updatePassword_throwsException_whenEmailConfirmationCodeIsInvalid() {
        // Setup
        var now = ZonedDateTime.now();
        var minuteAgo = now.minusMinutes(1L);
        var twentyNineMinutesAfter = now.plusMinutes(29L);
        var account = Account.builder()
                .id("1")
                .passwordHash("currentPasswordHash")
                .roles(Collections.emptyList())
                .email("test@gmail.com")
                .build();
        var userDetails = new CustomUserDetails(account);
        var emailConfirmationCode = EmailConfirmationCode.builder()
                .id("1")
                .createdAt(minuteAgo)
                .expiresAt(twentyNineMinutesAfter)
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RESET)
                .confirmationCodeHash("emailConfirmationCodeHash")
                .email("test@gmail.com")
                .build();
        when(authenticationFacade.getCurrentUserDetails()).thenReturn(userDetails);
        when(accountRepository.findById(account.getId())).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("currentPassword", "currentPasswordHash")).thenReturn(true);
        when(emailConfirmationCodeRepository.findById(emailConfirmationCode.getId())).thenReturn(Optional.of(emailConfirmationCode));
        when(timeService.now()).thenReturn(now);
        when(passwordEncoder.matches("emailConfirmationCodeCode", "emailConfirmationCodeHash")).thenReturn(false);

        // Run test
        var updatePasswordRequest = UpdatePasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("emailConfirmationCodeCode")
                .currentPassword("currentPassword")
                .password("test")
                .repeatedPassword("test")
                .build();
        accountService.updateCurrentAccountPassword(updatePasswordRequest);
    }

    @Test
    public void recoverPassword_recoversPassword() {
        //Setup
        var now = ZonedDateTime.now();
        var fiftyMinutesAfter = now.plusMinutes(50L);
        var emailConfirmationCode = EmailConfirmationCode
                .builder()
                .id("1")
                .email("test@gmail.com")
                .expiresAt(fiftyMinutesAfter)
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY)
                .confirmationCodeHash("confirmationCodeHash")
                .build();
        var account = Account.builder()
                .id("1")
                .email("test@gmail.com")
                .passwordHash("currentPasswordHash")
                .build();
        when(timeService.now()).thenReturn(now);
        when(emailConfirmationCodeRepository.findById("1")).thenReturn(Optional.of(emailConfirmationCode));
        when(passwordEncoder.matches("confirmationCode", "confirmationCodeHash")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newPasswordHash");
        when(accountRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(account));

        // Run test
        var recoverPasswordRequest = RecoverPasswordRequest.builder()
                .emailConfirmationCode("confirmationCode")
                .emailConfirmationCodeId("1")
                .password("newPassword")
                .repeatedPassword("newPassword")
                .build();
        accountService.recoverPassword(recoverPasswordRequest);

        // Verify results
        var resultAccount = Account.builder()
                .id("1")
                .email("test@gmail.com")
                .passwordHash("newPasswordHash")
                .build();
        var resultEmailConfirmationCode = EmailConfirmationCode.builder()
                .id("1")
                .email("test@gmail.com")
                .expiresAt(fiftyMinutesAfter)
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY)
                .confirmationCodeHash("confirmationCodeHash")
                .completedAt(now)
                .build();
        verify(accountRepository, times(1)).save(resultAccount);
        verify(emailConfirmationCodeRepository, times(1)).save(resultEmailConfirmationCode);
    }

    @Test(expected = EmailConfirmationCodeNotFoundException.class)
    public void recoverPassword_throwsException_whenEmailConfirmationCodeIsNotFound() {
        // Setup
        when(emailConfirmationCodeRepository.findById("1")).thenReturn(Optional.empty());

        //Run test
        var recoverPasswordRequest = RecoverPasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("emailConfirmationCode")
                .password("newPassword")
                .repeatedPassword("newPassword")
                .build();
        accountService.recoverPassword(recoverPasswordRequest);
    }

    @Test(expected = EmailConfirmationCodeHasAlreadyBeenUsedException.class)
    public void recoverPassword_throwsException_whenEmailConfirmationCodeHasBeenUsed() {
        // Setup
        var now = ZonedDateTime.now();
        var fiftyMinutesAgo = now.minusMinutes(50);
        var emailConfirmationCode = EmailConfirmationCode
                .builder()
                .id("1")
                .email("test@gmail.com")
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY)
                .completedAt(fiftyMinutesAgo)
                .confirmationCodeHash("confirmationCodeHash")
                .build();
        when(emailConfirmationCodeRepository.findById("1")).thenReturn(Optional.of(emailConfirmationCode));

        // Run test
        var recoverPasswordRequest = RecoverPasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("emailConfirmationCode")
                .password("newPassword")
                .repeatedPassword("newPassword")
                .build();
        accountService.recoverPassword(recoverPasswordRequest);
    }

    @Test(expected = EmailConfirmationCodeExpiredException.class)
    public void recoverPassword_throwsException_whenEmailConfirmationCodeHasExpired() {
        // Setup
        var now = ZonedDateTime.now();
        var fiftyMinutesBefore = now.minusMinutes(50L);
        var emailConfirmationCode = EmailConfirmationCode
                .builder()
                .id("1")
                .email("test@gmail.com")
                .expiresAt(fiftyMinutesBefore)
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY)
                .confirmationCodeHash("confirmationCodeHash")
                .build();
        when(emailConfirmationCodeRepository.findById("1")).thenReturn(Optional.of(emailConfirmationCode));
        when(timeService.now()).thenReturn(now);

        // Run test
        var recoverPasswordRequest = RecoverPasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("emailConfirmationCode")
                .password("newPassword")
                .repeatedPassword("newPassword")
                .build();
        accountService.recoverPassword(recoverPasswordRequest);
    }

    @Test(expected = InvalidEmailConfirmationCodeCodeException.class)
    public void recoverPassword_throwsException_whenEmailConfirmationCodeIsInvalid() {
        var now = ZonedDateTime.now();
        var fiftyMinutesAfter = now.plusMinutes(50L);
        var emailConfirmationCode = EmailConfirmationCode
                .builder()
                .id("1")
                .email("test@gmail.com")
                .expiresAt(fiftyMinutesAfter)
                .type(EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY)
                .confirmationCodeHash("confirmationCodeHash")
                .build();
        when(timeService.now()).thenReturn(now);
        when(emailConfirmationCodeRepository.findById("1")).thenReturn(Optional.of(emailConfirmationCode));
        when(passwordEncoder.matches("wrongConfirmationCode", "confirmationCodeHash")).thenReturn(false);

        // Run test
        var recoverPasswordRequest = RecoverPasswordRequest.builder()
                .emailConfirmationCodeId("1")
                .emailConfirmationCode("wrongConfirmationCode")
                .password("newPassword")
                .repeatedPassword("newPassword")
                .build();
        accountService.recoverPassword(recoverPasswordRequest);
    }
}
