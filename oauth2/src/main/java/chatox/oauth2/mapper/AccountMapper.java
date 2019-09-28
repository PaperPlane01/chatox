package chatox.oauth2.mapper;

import chatox.oauth2.api.response.AccountResponse;
import chatox.oauth2.domain.Account;
import chatox.oauth2.domain.UserRole;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class AccountMapper {

    @BeanMapping(resultType = AccountResponse.class)
    @Mapping(source = "roles", target = "roles", ignore = true)
    public abstract AccountResponse toAccountResponse(Account account);

    @AfterMapping
    protected void mapRoles(Account account, @MappingTarget AccountResponse accountResponse) {
        accountResponse.setRoles(account.getRoles().stream().map(UserRole::getRole).collect(Collectors.toList()));
    }
}
