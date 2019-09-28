package chatox.oauth2.service.impl;

import chatox.oauth2.domain.Scope;
import chatox.oauth2.respository.ScopeRepository;
import chatox.oauth2.service.ScopeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ScopeServiceImpl implements ScopeService {
    private final ScopeRepository scopeRepository;

    @Override
    public List<String> getAllScopes() {
        return scopeRepository.findAll()
                .stream()
                .map(Scope::getName)
                .filter(name -> !name.startsWith("internal"))
                .collect(Collectors.toList());
    }
}
