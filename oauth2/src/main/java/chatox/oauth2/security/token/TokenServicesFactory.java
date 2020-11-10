package chatox.oauth2.security.token;

import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.stereotype.Component;

@Component
public class TokenServicesFactory {
    public DefaultTokenServices createDefaultTokenServices() {
        return new DefaultTokenServices();
    }
}
