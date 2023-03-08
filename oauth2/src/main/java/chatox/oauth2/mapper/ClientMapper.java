package chatox.oauth2.mapper;

import chatox.oauth2.api.response.ClientResponse;
import chatox.oauth2.domain.AuthorizedGrantType;
import chatox.oauth2.domain.Client;
import chatox.oauth2.domain.Scope;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class ClientMapper {

    @BeanMapping(resultType = ClientResponse.class)
    @Mappings({
            @Mapping(target = "authorizedGrantTypes", ignore = true),
            @Mapping(target = "scope", ignore = true)
    })
    public abstract ClientResponse toClientResponse(Client client);

    @AfterMapping
    protected void mapRemainingFieldsOfClientResponse(Client client, @MappingTarget ClientResponse.ClientResponseBuilder clientResponse) {
        clientResponse.authorizedGrantTypes(
                client.getAuthorizedGrantTypes().stream().map(AuthorizedGrantType::getName).collect(Collectors.toList())
        );
        clientResponse.scope(client.getScope().stream().map(Scope::getName).collect(Collectors.toList()));
    }
}
