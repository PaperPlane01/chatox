package chatox.oauth2.respository;

import chatox.oauth2.domain.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.ZonedDateTime;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {
    EmailVerification save(EmailVerification emailVerification);
    Optional<EmailVerification> findById(EmailVerification emailVerification);
    boolean existsByEmailAndCreatedAtAfterAndCompletedAtNull(String email, ZonedDateTime completedAtAfter);
    boolean existsByEmailAndExpiresAtBeforeAndCompletedAtNull(String email, ZonedDateTime completedAtBefore);
}
