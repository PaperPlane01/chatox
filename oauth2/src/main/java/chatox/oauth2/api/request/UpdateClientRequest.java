package chatox.oauth2.api.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateClientRequest {
    private String name;
    private String secret;
    private List<String> authorizedGrantTypes;
    private List<String> scope;
    private String redirectUri;
    private Integer accessTokenValidity;
    private Integer refreshTokenValidity;
}
