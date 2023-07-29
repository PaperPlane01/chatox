package chatox.wallet.model;

import chatox.wallet.api.response.ImageMetadata;
import chatox.wallet.api.response.UploadResponse;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;

import java.time.ZonedDateTime;

@Entity
@Table(name = "user_entity")
@Cache(region = "userCache", usage = CacheConcurrencyStrategy.READ_WRITE)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    private String slug;
    private String firstName;
    private String lastName;
    private ZonedDateTime createdAt;
    private String accountId;
    private boolean deleted;
    private ZonedDateTime dateOfBirth;
    private String email;
    private String bio;

    @Type(JsonBinaryType.class)
    private UploadResponse<ImageMetadata> avatar;

    private String externalAvatarUri;
}
