package chatox.oauth2.controller;

import chatox.oauth2.api.request.RevokeTokenRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.DefaultOAuth2RefreshToken;
import org.springframework.security.oauth2.provider.token.store.JdbcTokenStore;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequiredArgsConstructor
public class TokenRevocationController {
    private final JdbcTokenStore jdbcTokenStore;

    @DeleteMapping("/oauth/token/revoke")
    public ResponseEntity<?> revokeToken(@RequestBody @Valid RevokeTokenRequest revokeTokenRequest) {
        jdbcTokenStore.removeAccessToken(new DefaultOAuth2AccessToken(revokeTokenRequest.getAccessToken()));

        if (!StringUtils.isEmpty(revokeTokenRequest.getRefreshToken())) {
            jdbcTokenStore.removeRefreshToken(new DefaultOAuth2RefreshToken(revokeTokenRequest.getRefreshToken()));
        }

        return ResponseEntity.noContent().build();
    }
}
