package chatox.oauth2.service;

import chatox.oauth2.api.request.CreateScopeRequest;

import java.util.List;

public interface ScopeService {
    List<String> getAllScopes();
    void createScope(CreateScopeRequest createScopeRequest);
}
