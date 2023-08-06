package chatox.oauth2.security.password;

import chatox.oauth2.security.token.TokenGeneratorHelper;
import chatox.oauth2.service.AccountService;
import chatox.oauth2.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AccessTokenAuthenticationToken;

@RequiredArgsConstructor
public class PasswordGrantAuthenticationProvider implements AuthenticationProvider {
    private final AccountService accountService;
    private final ClientService clientService;
    private final TokenGeneratorHelper tokenGeneratorHelper;
    private final JdbcOAuth2AuthorizationService oAuth2AuthorizationService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        var passwordGrantAuthenticationToken = (PasswordGrantAuthenticationToken) authentication;
        var client = clientService.findByClientId(passwordGrantAuthenticationToken.getClientId());

        if (!passwordEncoder.matches(passwordGrantAuthenticationToken.getClientSecret(), client.getClientSecret())) {
            throw new BadCredentialsException("Bad credentials");
        }

        if (!client.getAuthorizationGrantTypes().contains(AuthorizationGrantType.PASSWORD)) {
            throw new BadCredentialsException("Unsupported grant type");
        }

        var user = accountService.loadUserByUsername(passwordGrantAuthenticationToken.getUsername());

        if (!passwordEncoder.matches(passwordGrantAuthenticationToken.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Bad credentials");
        }

        var token = tokenGeneratorHelper.createToken(user, client);
        oAuth2AuthorizationService.save(token);

        return new OAuth2AccessTokenAuthenticationToken(
                client,
                authentication,
                token.getAccessToken().getToken(),
                token.getRefreshToken().getToken()
        );
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.isAssignableFrom(PasswordGrantAuthenticationToken.class);
    }
}
