package chatox.oauth2.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Client {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private String id;
    private String name;
    private String secretHash;

    @ManyToMany
    @LazyCollection(LazyCollectionOption.EXTRA)
    @JoinTable(
            name = "clientToScope",
            joinColumns = {
                    @JoinColumn(name = "clientId")
            },
            inverseJoinColumns = {
                    @JoinColumn(name = "scopeId")
            }
    )
    private List<Scope> scope;

    @ManyToMany
    @LazyCollection(LazyCollectionOption.EXTRA)
    @JoinTable(
            name = "clientToAuthorizedGrantType",
            joinColumns = {
                    @JoinColumn(name = "clientId")
            },
            inverseJoinColumns = {
                    @JoinColumn(name = "authorizedGrantTypeId")
            }
    )
    private List<AuthorizedGrantType> authorizedGrantTypes;

    @ManyToOne
    @JoinColumn(name = "ownerId")
    private Account owner;

    private ZonedDateTime createdAt;
    private boolean enabled;
    private Integer accessTokenValidity;
    private Integer refreshTokenValidity;
    private String redirectUri;
    private boolean autoApprove;
}
