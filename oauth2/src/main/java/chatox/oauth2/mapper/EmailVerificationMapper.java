package chatox.oauth2.mapper;

import chatox.oauth2.api.response.EmailVerificationResponse;
import chatox.oauth2.domain.EmailVerification;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmailVerificationMapper {

    @BeanMapping(resultType = EmailVerificationResponse.class)
    EmailVerificationResponse toEmailVerificationResponse(EmailVerification emailVerification);
}
