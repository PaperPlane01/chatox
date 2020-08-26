package chatox.oauth2.mapper;

import chatox.oauth2.api.response.EmailConfirmationCodeResponse;
import chatox.oauth2.domain.EmailConfirmationCode;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmailConfirmationCodeMapper {

    @BeanMapping(resultType = EmailConfirmationCodeResponse.class)
    EmailConfirmationCodeResponse toEmailVerificationResponse(EmailConfirmationCode emailVerification);
}
