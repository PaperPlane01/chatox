package chatox.oauth2.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String name;
    private String secretHash;

    @ManyToMany(fetch = FetchType.EAGER)
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

    @ManyToMany(fetch = FetchType.EAGER)
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

    public RegisteredClient toRegisteredClient() {
        var tokenSettings = TokenSettings.builder()
                .accessTokenTimeToLive(Duration.of(accessTokenValidity, ChronoUnit.MINUTES))
                .accessTokenFormat(OAuth2TokenFormat.REFERENCE)
                .reuseRefreshTokens(true);

        if (refreshTokenValidity != null) {
            tokenSettings.refreshTokenTimeToLive(Duration.of(refreshTokenValidity, ChronoUnit.MINUTES));
        }

        return RegisteredClient
                .withId(id)
                .clientId(id)
                .clientIdIssuedAt(createdAt.toInstant())
                .clientName(name)
                .clientSecret(secretHash)
                .clientAuthenticationMethods(methods -> {
                    methods.add(ClientAuthenticationMethod.CLIENT_SECRET_BASIC);
                    methods.add(ClientAuthenticationMethod.CLIENT_SECRET_POST);
                })
                .clientSettings(ClientSettings.builder().build())
                .authorizationGrantTypes(grantTypes -> grantTypes.addAll(authorizedGrantTypes.stream()
                        .map(AuthorizedGrantType::toAuthorizationGrantType)
                        .toList()
                ))
                .scopes(scopes -> scopes.addAll(scope.stream().map(Scope::getName).toList()))
                .tokenSettings(tokenSettings.build())
                .build();
    }
}
