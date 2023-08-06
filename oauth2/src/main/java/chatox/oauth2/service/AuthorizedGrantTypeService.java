package chatox.oauth2.service;

import chatox.oauth2.domain.GrantType;

import java.util.List;

public interface AuthorizedGrantTypeService {
    List<GrantType> getAllAuthorizedGrantTypes();
}
