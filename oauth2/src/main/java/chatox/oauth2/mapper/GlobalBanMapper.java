package chatox.oauth2.mapper;

import chatox.oauth2.domain.GlobalBan;
import chatox.oauth2.messaging.rabbitmq.event.GlobalBanCreatedOrUpdated;
import chatox.oauth2.respository.AccountRepository;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class GlobalBanMapper {
    @Autowired
    private AccountRepository accountRepository;

    @BeanMapping(resultType = GlobalBan.class)
    @Mappings({
            @Mapping(target = "bannedAccount", ignore = true),
            @Mapping(source = "bannedUser.id", target = "bannedUserId")
    })
    public abstract GlobalBan fromGlobalBanCreatedOrUpdated(GlobalBanCreatedOrUpdated globalBanCreatedOrUpdated);

    protected void afterMapping(GlobalBanCreatedOrUpdated globalBanCreatedOrUpdated,
                                @MappingTarget GlobalBan globalBan) {
        globalBan.setBannedAccount(accountRepository.findByUserIdsContains(globalBanCreatedOrUpdated.getBannedUser().getId()));
    }
}
