package chatox.oauth2.controller;

import chatox.oauth2.api.request.RevokeTokenRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TokenRevocationController {
    private final JdbcOAuth2AuthorizationService oAuth2AuthorizationService;

    @DeleteMapping("/oauth/token/revoke")
    public ResponseEntity<?> revokeToken(@RequestBody @Valid RevokeTokenRequest revokeTokenRequest) {
        var accessToken = oAuth2AuthorizationService.findById(revokeTokenRequest.getAccessToken());

        if (accessToken != null) {
            oAuth2AuthorizationService.remove(accessToken);
        }

        return ResponseEntity.noContent().build();
    }
}
