package chatox.oauth2.security.password;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.web.authentication.AuthenticationConverter;

public class PasswordGrantAuthorizationConverter implements AuthenticationConverter {

    @Override
    public Authentication convert(HttpServletRequest request) {
        var grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE);

        if (!AuthorizationGrantType.PASSWORD.getValue().equals(grantType)) {
            return null;
        }

        var clientId = request.getParameter(OAuth2ParameterNames.CLIENT_ID);
        var clientSecret = request.getParameter(OAuth2ParameterNames.CLIENT_SECRET);
        var username = request.getParameter(OAuth2ParameterNames.USERNAME);
        var password = request.getParameter(OAuth2ParameterNames.PASSWORD);

        return new PasswordGrantAuthenticationToken(clientId, clientSecret, username, password);
    }
}
