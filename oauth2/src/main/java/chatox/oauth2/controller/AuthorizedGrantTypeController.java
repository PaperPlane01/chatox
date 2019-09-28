package chatox.oauth2.controller;

import chatox.oauth2.service.AuthorizedGrantTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AuthorizedGrantTypeController {
    private final AuthorizedGrantTypeService authorizedGrantTypeService;

    @GetMapping("/oauth/authorizedGrantType")
    public List<String> findAllAuthorizedGrantTypes() {
        return authorizedGrantTypeService.getAllAuthorizedGrantTypes();
    }
}
