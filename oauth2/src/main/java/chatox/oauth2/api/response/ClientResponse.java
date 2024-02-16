package chatox.oauth2.api.response;

import chatox.oauth2.domain.GrantType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClientResponse {
    private String id;
    private String name;
    private List<String> scope;
    private List<GrantType> authorizedGrantTypes;
    private Integer accessTokenValidity;
    private Integer refreshTokenValidity;
    private String redirectUri;
}
