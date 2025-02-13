package chatox.oauth2.controller;

import chatox.oauth2.api.request.CreateScopeRequest;
import chatox.oauth2.service.ScopeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/oauth2/scopes")
@RequiredArgsConstructor
public class ScopeController {
    private final ScopeService scopeService;

    @GetMapping
    public List<String> findAllScopes() {
        return scopeService.getAllScopes();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public void createScope(@RequestBody @Valid CreateScopeRequest createScopeRequest) {
        scopeService.createScope(createScopeRequest);
    }
}
