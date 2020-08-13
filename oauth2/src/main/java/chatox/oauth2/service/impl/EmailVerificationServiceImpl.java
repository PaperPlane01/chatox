package chatox.oauth2.service.impl;

import chatox.oauth2.api.request.CheckEmailVerificationCodeValidityRequest;
import chatox.oauth2.api.request.SendVerificationEmailRequest;
import chatox.oauth2.api.response.EmailAvailabilityResponse;
import chatox.oauth2.api.response.EmailVerificationCodeValidityResponse;
import chatox.oauth2.api.response.EmailVerificationResponse;
import chatox.oauth2.domain.EmailVerification;
import chatox.oauth2.domain.EmailVerificationType;
import chatox.oauth2.exception.EmailHasAlreadyBeenTakenException;
import chatox.oauth2.exception.EmailVerificationExpiredException;
import chatox.oauth2.exception.EmailVerificationNotFoundException;
import chatox.oauth2.mapper.EmailVerificationMapper;
import chatox.oauth2.respository.AccountRepository;
import chatox.oauth2.respository.EmailVerificationRepository;
import chatox.oauth2.security.AuthenticationFacade;
import chatox.oauth2.service.EmailVerificationService;
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
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private final EmailVerificationRepository emailVerificationRepository;
    private final AccountRepository accountRepository;
    private final EmailVerificationMapper emailVerificationMapper;
    private final PasswordEncoder passwordEncoder;
    private final TemplateEngine templateEngine;
    private final JavaMailSender javaMailSender;
    private final AuthenticationFacade authenticationFacade;
    private final EmailPropertiesProvider emailPropertiesProvider;

    @Value("${spring.mail.full-email}")
    private String chatoxEmail;

    @Override
    public EmailVerificationResponse sendVerificationEmail(SendVerificationEmailRequest sendVerificationEmailRequest) {
        if (sendVerificationEmailRequest.getType().equals(EmailVerificationType.CONFIRM_EMAIL)
                && accountRepository.existsByEmail(sendVerificationEmailRequest.getEmail())) {
            throw new EmailHasAlreadyBeenTakenException(
                    String.format("Email %s has already been taken", sendVerificationEmailRequest.getEmail())
            );
        }

        if (sendVerificationEmailRequest.getType().equals(EmailVerificationType.CONFIRM_EMAIL)
                && emailVerificationRepository.existsByEmailAndExpiresAtBeforeAndCompletedAtNull(
                sendVerificationEmailRequest.getEmail(), ZonedDateTime.now().plusDays(1L)
        )) {
            throw new EmailHasAlreadyBeenTakenException(
                    String.format("Email %s has already been taken", sendVerificationEmailRequest.getEmail())
            );
        }

        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime expiresAt = emailPropertiesProvider.getExpirationDate(
                sendVerificationEmailRequest.getType(),
                now
        );
        String email;

        if (emailPropertiesProvider.getEmailSourceStrategy(sendVerificationEmailRequest.getType()).equals(EmailSourceStrategy.USE_CURRENT_USER_EMAIL)) {
            email = authenticationFacade.getCurrentUserDetails().getEmail();
        } else {
            email = sendVerificationEmailRequest.getEmail();
        }

        String verificationCode = RandomStringUtils.randomAlphanumeric(5).toUpperCase();

        EmailVerification emailVerification = EmailVerification.builder()
                .email(email)
                .createdAt(now)
                .expiresAt(expiresAt)
                .verificationCodeHash(passwordEncoder.encode(verificationCode))
                .type(sendVerificationEmailRequest.getType())
                .build();
        emailVerificationRepository.save(emailVerification);

        Context context = new Context();
        context.setVariable("emailConfirmationCode", verificationCode);
        context.setVariable("emailConfirmationCodeExpirationDate", Date.from(emailVerification.getExpiresAt().toInstant()));

        String templateName = emailPropertiesProvider.getThymeleafTemplate(emailVerification.getType(), sendVerificationEmailRequest.getLanguage());
        String emailText = templateEngine.process(templateName, context);

        MimeMessagePreparator mimeMessagePreparator = mimeMessage -> {
            mimeMessage.setContent(emailText, "text/html; charset=utf-8");
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true);
            mimeMessageHelper.setFrom(chatoxEmail);
            mimeMessageHelper.setTo(email);
            mimeMessageHelper.setSubject(
                    emailPropertiesProvider.getSubject(
                            emailVerification.getType(),
                            sendVerificationEmailRequest.getLanguage()
                    )
            );
            mimeMessageHelper.setText(emailText, true);
        };

        javaMailSender.send(mimeMessagePreparator);

        return emailVerificationMapper.toEmailVerificationResponse(emailVerification);
    }

    @Override
    public EmailAvailabilityResponse checkEmailAvailability(String email) {
        boolean available = !accountRepository.existsByEmail(email);

        if (available) {
            available = !emailVerificationRepository.existsByEmailAndExpiresAtBeforeAndCompletedAtNull(
                    email,
                    ZonedDateTime.now().plusDays(1L)
            );
        }

        return EmailAvailabilityResponse.builder().available(available).build();
    }

    @Override
    public EmailVerificationCodeValidityResponse checkEmailVerificationCode(String emailVerificationId, CheckEmailVerificationCodeValidityRequest checkEmailVerificationCodeValidityRequest) {
        EmailVerification emailVerification = emailVerificationRepository.findById(emailVerificationId)
                .orElseThrow(() -> new EmailVerificationNotFoundException(
                        String.format("Could not find email verification with id %s", emailVerificationId)
                ));

        if (emailVerification.getExpiresAt().isBefore(ZonedDateTime.now())) {
            throw new EmailVerificationExpiredException();
        }

        boolean valid = passwordEncoder.matches(
                checkEmailVerificationCodeValidityRequest.getVerificationCode(),
                emailVerification.getVerificationCodeHash()
        );

        return EmailVerificationCodeValidityResponse.builder().valid(valid).build();
    }
}
