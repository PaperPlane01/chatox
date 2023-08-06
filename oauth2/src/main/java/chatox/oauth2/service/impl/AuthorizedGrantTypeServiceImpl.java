package chatox.oauth2.service.impl;

import chatox.oauth2.domain.AuthorizedGrantType;
import chatox.oauth2.domain.GrantType;
import chatox.oauth2.respository.AuthorizedGrantTypeRepository;
import chatox.oauth2.service.AuthorizedGrantTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthorizedGrantTypeServiceImpl implements AuthorizedGrantTypeService {
    private final AuthorizedGrantTypeRepository authorizedGrantTypeRepository;

    @Override
    public List<GrantType> getAllAuthorizedGrantTypes() {
        return authorizedGrantTypeRepository.findAll()
                .stream()
                .map(AuthorizedGrantType::getName)
                .collect(Collectors.toList());
    }
}
