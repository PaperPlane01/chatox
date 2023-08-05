package chatox.oauth2.security;

import chatox.oauth2.security.authentication.ClientDetailsAuthentication;
import chatox.oauth2.security.authentication.UserDetailsAuthentication;
import chatox.oauth2.service.AccountService;
import chatox.oauth2.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;

@RequiredArgsConstructor
public class ChatoxAuthenticationManager implements AuthenticationManager {
    private final JdbcOAuth2AuthorizationService oAuth2AuthorizationService;
    private final ClientService clientService;
    private final AccountService accountService;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication instanceof BearerTokenAuthenticationToken token)) {
            return authentication;
        }

        var oauth2Authorization = oAuth2AuthorizationService.findByToken(
                token.getToken(),
                OAuth2TokenType.ACCESS_TOKEN
        );

        if (oauth2Authorization == null) {
            throw new BadCredentialsException("Bad credentials");
        }

        if (oauth2Authorization.getAuthorizationGrantType().equals(AuthorizationGrantType.CLIENT_CREDENTIALS)) {
            var client = clientService.findByClientId(oauth2Authorization.getRegisteredClientId());
            return new ClientDetailsAuthentication(client);
        } else {
            var account = (CustomUserDetails) accountService.loadUserByUsername(oauth2Authorization.getPrincipalName());
            return new UserDetailsAuthentication(account);
        }
    }
}
