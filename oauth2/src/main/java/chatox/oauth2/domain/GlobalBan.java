package chatox.oauth2.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.time.ZonedDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GlobalBan {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn
    private Account bannedAccount;

    private boolean permanent;
    private ZonedDateTime expiresAt;
    private boolean canceled;
    private ZonedDateTime canceledAt;
    private ZonedDateTime updatedAt;

    private String bannedUserId;
}
