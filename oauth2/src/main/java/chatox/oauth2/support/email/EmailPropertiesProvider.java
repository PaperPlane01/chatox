package chatox.oauth2.support.email;

import chatox.oauth2.domain.EmailConfirmationCodeType;
import chatox.oauth2.domain.Language;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmailPropertiesProvider {
    private Map<EmailConfirmationCodeType, EmailProperties> propertiesMap;

    public ZonedDateTime getExpirationDate(EmailConfirmationCodeType emailConfirmationCodeType) {
        return getExpirationDate(emailConfirmationCodeType, ZonedDateTime.now());
    }

    public ZonedDateTime getExpirationDate(EmailConfirmationCodeType emailConfirmationCodeType, ZonedDateTime now) {
        var emailProperties = propertiesMap.get(emailConfirmationCodeType);
        var amountToAdd = emailProperties.getExpirationAmount();
        var chronoUnit = emailProperties.getExpirationChronoUnit();

        return now.plus(amountToAdd, chronoUnit);
    }

    public String getSubject(EmailConfirmationCodeType emailConfirmationCodeType, Language language) {
        return propertiesMap.get(emailConfirmationCodeType).getSubjectsMap().get(language);
    }

    public String getThymeleafTemplate(EmailConfirmationCodeType emailConfirmationCodeType, Language language) {
        var emailProperties = propertiesMap.get(emailConfirmationCodeType);

        return String.format("%s_%s.html", emailProperties.getTemplateBaseName(), language.getPrimaryAliasLowerCase());
    }

    public EmailSourceStrategy getEmailSourceStrategy(EmailConfirmationCodeType emailConfirmationCodeType) {
        return propertiesMap.get(emailConfirmationCodeType).getEmailSourceStrategy();
    }

    public boolean requiresCheckingAccountExistence(EmailConfirmationCodeType emailConfirmationCodeType) {
        return propertiesMap.get(emailConfirmationCodeType).isRequiresCheckingAccountExistence();
    }

    @PostConstruct
    void initializeProperties() {
        propertiesMap = new HashMap<>();
        propertiesMap.put(
                EmailConfirmationCodeType.CONFIRM_EMAIL,
                EmailProperties.builder()
                        .subjectsMap(
                                Map.of(
                                        Language.EN, "Confirm your e-mail",
                                        Language.RU, "Подтверждение e-mail"
                                )
                        )
                        .emailSourceStrategy(EmailSourceStrategy.USE_REQUEST_BODY_EMAIL)
                        .templateBaseName("email/email-confirmation/emailConfirmation")
                        .expirationAmount(1L)
                        .expirationChronoUnit(ChronoUnit.DAYS)
                        .requiresCheckingAccountExistence(false)
                        .build()
        );
        propertiesMap.put(
                EmailConfirmationCodeType.CONFIRM_PASSWORD_RESET,
                EmailProperties.builder()
                        .subjectsMap(
                                Map.of(
                                        Language.EN, "Confirm changing password",
                                        Language.RU, "Подтердите смену пароля"
                                )
                        )
                        .emailSourceStrategy(EmailSourceStrategy.USE_CURRENT_USER_EMAIL)
                        .templateBaseName("email/password-reset/passwordReset")
                        .expirationAmount(30L)
                        .expirationChronoUnit(ChronoUnit.MINUTES)
                        .requiresCheckingAccountExistence(false)
                        .build()
        );
        propertiesMap.put(
                EmailConfirmationCodeType.CONFIRM_PASSWORD_RECOVERY,
                EmailProperties.builder()
                        .subjectsMap(
                                Map.of(
                                        Language.EN, "Password recovery",
                                        Language.RU, "Восстановление пароля"
                                )
                        )
                        .emailSourceStrategy(EmailSourceStrategy.USE_REQUEST_BODY_EMAIL)
                        .templateBaseName("email/password-recovery/passwordRecovery")
                        .expirationAmount(1L)
                        .expirationChronoUnit(ChronoUnit.HOURS)
                        .requiresCheckingAccountExistence(true)
                        .build()
        );
    }
}
