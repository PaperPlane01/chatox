package chatox.oauth2.security.password;

import chatox.oauth2.domain.GrantType;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.web.authentication.AuthenticationConverter;

public class PasswordGrantAuthorizationConverter implements AuthenticationConverter {
    private static final String USERNAME_PARAMETER = "username";
    private static final String PASSWORD_PARAMETER = "password";

    @Override
    public Authentication convert(HttpServletRequest request) {
        var grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE);

        if (!GrantType.password.name().equals(grantType)) {
            return null;
        }

        var clientId = request.getParameter(OAuth2ParameterNames.CLIENT_ID);
        var clientSecret = request.getParameter(OAuth2ParameterNames.CLIENT_SECRET);
        var username = request.getParameter(USERNAME_PARAMETER);
        var password = request.getParameter(PASSWORD_PARAMETER);

        return new PasswordGrantAuthenticationToken(clientId, clientSecret, username, password);
    }
}
