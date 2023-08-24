package chatox.wallet.mapper;

import chatox.wallet.api.response.RewardClaimResponse;
import chatox.wallet.model.RewardClaim;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RewardClaimMapper {

    @BeanMapping(resultType = RewardClaimResponse.class)
    @Mapping(source = "reward.currency", target = "currency")
    RewardClaimResponse toRewardClaimResponse(RewardClaim rewardClaim);
}
