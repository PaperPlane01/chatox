package chatox.wallet.mapper;

import chatox.wallet.api.response.UserResponse;
import chatox.wallet.model.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @BeanMapping(resultType = UserResponse.class)
    UserResponse toUserResponse(User user);

    @BeanMapping(resultType = User.class)
    User toUser(UserResponse userResponse);
}
