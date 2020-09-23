package chatox.oauth2.controller;

import chatox.oauth2.service.ScopeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/oauth/scopes")
@RequiredArgsConstructor
public class ScopeController {
    private final ScopeService scopeService;

    @GetMapping
    public List<String> findAllScopes() {
        return scopeService.getAllScopes();
    }
}
