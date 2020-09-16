package chatox.oauth2.service.impl;

import chatox.oauth2.api.request.CheckEmailConfirmationCodeValidityRequest;
import chatox.oauth2.api.request.CreateEmailConfirmationCodeRequest;
import chatox.oauth2.api.response.EmailAvailabilityResponse;
import chatox.oauth2.api.response.EmailConfirmationCodeValidityResponse;
import chatox.oauth2.api.response.EmailConfirmationCodeResponse;
import chatox.oauth2.domain.EmailConfirmationCode;
import chatox.oauth2.domain.EmailConfirmationCodeType;
import chatox.oauth2.exception.AccountNotFoundException;
import chatox.oauth2.exception.EmailHasAlreadyBeenTakenException;
import chatox.oauth2.exception.metadata.EmailConfirmationCodeExpiredException;
import chatox.oauth2.exception.EmailConfirmationCodeNotFoundException;
import chatox.oauth2.mapper.EmailConfirmationCodeMapper;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.EmailConfirmationCodeRepository;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.service.EmailConfirmationCodeService;
import chatox.oauth2.support.email.EmailPropertiesProvider;
import chatox.oauth2.support.email.EmailSourceStrategy;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.sql.Date;
import java.time.ZonedDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class EmailConfirmationCodeServiceImpl implements EmailConfirmationCodeService {
    private final EmailConfirmationCodeRepository emailConfirmationCodeRepository;
    private final AccountRepository accountRepository;
    private final EmailConfirmationCodeMapper emailVerificationMapper;
    private final PasswordEncoder passwordEncoder;
    private final TemplateEngine templateEngine;
    private final JavaMailSender javaMailSender;
    private final AuthenticationFacade authenticationFacade;
    private final EmailPropertiesProvider emailPropertiesProvider;

    @Value("${spring.mail.full-email}")
    private String chatoxEmail;

    @Override
    public EmailConfirmationCodeResponse sendEmailConfirmationCode(CreateEmailConfirmationCodeRequest createEmailConfirmationCodeRequest) {
        if (createEmailConfirmationCodeRequest.getType().equals(EmailConfirmationCodeType.CONFIRM_EMAIL)
                && accountRepository.existsByEmail(createEmailConfirmationCodeRequest.getEmail())) {
            throw new EmailHasAlreadyBeenTakenException(
                    String.format("Email %s has already been taken", createEmailConfirmationCodeRequest.getEmail())
            );
        }

        if (createEmailConfirmationCodeRequest.getType().equals(EmailConfirmationCodeType.CONFIRM_EMAIL)
                && emailConfirmationCodeRepository.existsByEmailAndExpiresAtBeforeAndCompletedAtNull(
                createEmailConfirmationCodeRequest.getEmail(), ZonedDateTime.now().plusDays(1L)
        )) {
            throw new EmailHasAlreadyBeenTakenException(
                    String.format("Email %s has already been taken", createEmailConfirmationCodeRequest.getEmail())
            );
        }

        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime expiresAt = emailPropertiesProvider.getExpirationDate(
                createEmailConfirmationCodeRequest.getType(),
                now
        );
        String email;

        if (emailPropertiesProvider.getEmailSourceStrategy(createEmailConfirmationCodeRequest.getType()).equals(EmailSourceStrategy.USE_CURRENT_USER_EMAIL)) {
            email = authenticationFacade.getCurrentUserDetails().getEmail();
        } else {
            email = createEmailConfirmationCodeRequest.getEmail();
        }

        if (emailPropertiesProvider.requiresCheckingAccountExistence(createEmailConfirmationCodeRequest.getType())) {
            if (!accountRepository.existsByEmail(email)) {
                throw new AccountNotFoundException("Could not find account associated with this email");
            }
        }

        String confirmationCode = RandomStringUtils.randomAlphanumeric(5).toUpperCase();

        EmailConfirmationCode emailConfirmationCode = EmailConfirmationCode.builder()
                .email(email)
                .createdAt(now)
                .expiresAt(expiresAt)
                .confirmationCodeHash(passwordEncoder.encode(confirmationCode))
                .type(createEmailConfirmationCodeRequest.getType())
                .build();
        emailConfirmationCodeRepository.save(emailConfirmationCode);

        Context context = new Context();
        context.setVariable("emailConfirmationCode", confirmationCode);
        context.setVariable("emailConfirmationCodeExpirationDate", Date.from(emailConfirmationCode.getExpiresAt().toInstant()));

        String templateName = emailPropertiesProvider.getThymeleafTemplate(emailConfirmationCode.getType(), createEmailConfirmationCodeRequest.getLanguage());
        String emailText = templateEngine.process(templateName, context);

        MimeMessagePreparator mimeMessagePreparator = mimeMessage -> {
            mimeMessage.setContent(emailText, "text/html; charset=utf-8");
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true);
            mimeMessageHelper.setFrom(chatoxEmail);
            mimeMessageHelper.setTo(email);
            mimeMessageHelper.setSubject(
                    emailPropertiesProvider.getSubject(
                            emailConfirmationCode.getType(),
                            createEmailConfirmationCodeRequest.getLanguage()
                    )
            );
            mimeMessageHelper.setText(emailText, true);
        };

        javaMailSender.send(mimeMessagePreparator);

        return emailVerificationMapper.toEmailVerificationResponse(emailConfirmationCode);
    }

    @Override
    public EmailAvailabilityResponse checkEmailAvailability(String email) {
        boolean available = !accountRepository.existsByEmail(email);

        if (available) {
            available = !emailConfirmationCodeRepository.existsByEmailAndExpiresAtBeforeAndCompletedAtNull(
                    email,
                    ZonedDateTime.now().plusDays(1L)
            );
        }

        return EmailAvailabilityResponse.builder().available(available).build();
    }

    @Override
    public EmailConfirmationCodeValidityResponse checkEmailConfirmationCode(String emailConfirmationCodeId, CheckEmailConfirmationCodeValidityRequest checkEmailVerificationCodeValidityRequest) {
        EmailConfirmationCode emailConfirmationCode = emailConfirmationCodeRepository.findById(emailConfirmationCodeId)
                .orElseThrow(() -> new EmailConfirmationCodeNotFoundException(
                        String.format("Could not find email verification with id %s", emailConfirmationCodeId)
                ));

        if (emailConfirmationCode.getExpiresAt().isBefore(ZonedDateTime.now())) {
            throw new EmailConfirmationCodeExpiredException("This email confirmation code has expired");
        }

        boolean valid = passwordEncoder.matches(
                checkEmailVerificationCodeValidityRequest.getConfirmationCode(),
                emailConfirmationCode.getConfirmationCodeHash()
        );

        return EmailConfirmationCodeValidityResponse.builder().valid(valid).build();
    }
}
