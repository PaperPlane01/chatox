package chatox.wallet.mapper;

import chatox.wallet.api.response.BalanceChangeResponse;
import chatox.wallet.model.BalanceChange;
import chatox.wallet.model.BalanceChangeData;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public abstract class BalanceChangeMapper {

    @BeanMapping(resultType = BalanceChangeResponse.class)
    @Mapping(source = "balanceChangeData", target = "metadata", ignore = true)
    public abstract BalanceChangeResponse toBalanceChangeResponse(BalanceChange balanceChange);

    @AfterMapping
    protected void mapMetadata(BalanceChange balanceChange,
                               @MappingTarget BalanceChangeResponse.BalanceChangeResponseBuilder balanceChangeResponse) {
        balanceChangeResponse.metadata(BalanceChangeData.asMap(balanceChange.getBalanceChangeData()));
    }
}
