package chatox.wallet.mapper;

import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.event.BalanceUpdated;
import chatox.wallet.model.Balance;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BalanceMapper {

    @BeanMapping(resultType = BalanceResponse.class)
    BalanceResponse toBalanceResponse(Balance balance);

    @BeanMapping(resultType = BalanceUpdated.class)
    @Mapping(source = "user.id", target = "userId")
    BalanceUpdated toBalanceUpdated(Balance balance);
}
