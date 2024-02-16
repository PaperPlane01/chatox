package chatox.wallet.mapper;

import chatox.platform.security.jwt.JwtPayload;
import chatox.platform.security.web.AuthenticationHolder;
import chatox.wallet.api.response.CurrentUserRewardResponse;
import chatox.wallet.api.response.RewardResponse;
import chatox.wallet.model.Reward;
import chatox.wallet.model.RewardClaim;
import chatox.wallet.model.User;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.ZonedDateTime;
import java.util.Map;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public abstract class RewardMapper {
    @Autowired
    private AuthenticationHolder<User> authenticationHolder;

    @BeanMapping(resultType = RewardResponse.class)
    public abstract RewardResponse toRewardResponse(Reward reward);

    @BeanMapping(resultType = CurrentUserRewardResponse.class)
    @Mapping(source = "lastClaim", target = "lastClaim")
    public abstract CurrentUserRewardResponse toCurrentUserRewardResponse(Reward reward, ZonedDateTime lastClaim);

    @AfterMapping
    protected void removeProperties(@MappingTarget RewardResponse.RewardResponseBuilder rewardResponse) {
        if (!authenticationHolder.getCurrentUserDetails().map(JwtPayload::isAdmin).orElse(false)) {
            rewardResponse.createdBy(null);
            rewardResponse.updatedBy(null);
            rewardResponse.createdAt(null);
            rewardResponse.updatedAt(null);
        }
    }
}
