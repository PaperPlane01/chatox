package chatox.wallet.mapper;

import chatox.wallet.api.response.ImageMetadata;
import chatox.wallet.api.response.UploadResponse;
import chatox.wallet.model.Upload;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UploadMapper {

    @BeanMapping(resultType = UploadResponse.class)
    UploadResponse<ImageMetadata> toUploadResponse(Upload<ImageMetadata> upload);
}
