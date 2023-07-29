package chatox.wallet.mapper;

import chatox.wallet.api.response.BalanceResponse;
import chatox.wallet.model.Balance;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;

@Mapper
public interface BalanceMapper {

    @BeanMapping(resultType = BalanceResponse.class)
    BalanceResponse toBalanceResponse(Balance balance);
}
