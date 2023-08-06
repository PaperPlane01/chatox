package chatox.wallet.mapper;

import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.model.Balance;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BalanceMapper {

    @BeanMapping(resultType = BalanceResponse.class)
    BalanceResponse toBalanceResponse(Balance balance);
}
