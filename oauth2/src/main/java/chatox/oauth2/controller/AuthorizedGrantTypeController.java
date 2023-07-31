package chatox.oauth2.controller;

import chatox.oauth2.domain.GrantType;
import chatox.oauth2.service.AuthorizedGrantTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/oauth/authorizedGrantTypes")
@RequiredArgsConstructor
public class AuthorizedGrantTypeController {
    private final AuthorizedGrantTypeService authorizedGrantTypeService;

    @GetMapping
    public List<GrantType> findAllAuthorizedGrantTypes() {
        return authorizedGrantTypeService.getAllAuthorizedGrantTypes();
    }
}
