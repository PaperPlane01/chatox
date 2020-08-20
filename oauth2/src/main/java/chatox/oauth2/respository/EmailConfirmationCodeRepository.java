package chatox.oauth2.respository;

import chatox.oauth2.domain.EmailConfirmationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.ZonedDateTime;
import java.util.Optional;

public interface EmailConfirmationCodeRepository extends JpaRepository<EmailConfirmationCode, String> {
    EmailConfirmationCode save(EmailConfirmationCode emailVerification);
    Optional<EmailConfirmationCode> findById(EmailConfirmationCode emailVerification);
    boolean existsByEmailAndCreatedAtAfterAndCompletedAtNull(String email, ZonedDateTime completedAtAfter);
    boolean existsByEmailAndExpiresAtBeforeAndCompletedAtNull(String email, ZonedDateTime completedAtBefore);
}
