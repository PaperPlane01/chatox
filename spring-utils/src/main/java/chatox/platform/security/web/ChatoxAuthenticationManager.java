package chatox.platform.security.web;

import chatox.platform.security.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@RequiredArgsConstructor
public class ChatoxAuthenticationManager implements AuthenticationManager {
    private final JwtDecoder jwtDecoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        try {
            var jwt = jwtDecoder.decode(((BearerTokenAuthenticationToken) authentication).getToken());
            var jwtAuthenticationToken = new JwtAuthenticationToken(jwt);

            return new JwtAuthentication(jwtAuthenticationToken);
        } catch (JwtException exception) {
            throw new BadCredentialsException("Bad credentials");
        }
    }
}
