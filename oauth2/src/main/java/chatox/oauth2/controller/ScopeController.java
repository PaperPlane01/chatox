package chatox.oauth2.controller;

import chatox.oauth2.service.ScopeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ScopeController {
    private final ScopeService scopeService;

    @GetMapping("/oauth/scope")
    public List<String> findAllScopes() {
        return scopeService.getAllScopes();
    }
}
