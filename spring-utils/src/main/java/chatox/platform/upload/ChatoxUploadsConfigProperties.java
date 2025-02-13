package chatox.platform.upload;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties("chatox.uploads")
@Getter
@Setter
public class ChatoxUploadsConfigProperties {
    private String images;
    private String audios;
    private String files;
    private String videos;
    private String imageStickers;
    private String webpStickers;
    private String videoStickers;
    private String lottieStickers;

    public String getUploadUrl(UploadType uploadType, String uploadName) {
        return getUploadUrl(uploadType) + "/" + uploadName;
    }

    public String getUploadUrl(UploadType uploadType) {
        switch (uploadType) {
            case IMAGE, GIF -> {
                return images;
            }
            case AUDIO, VOICE_MESSAGE -> {
                return audios;
            }
            case VIDEO -> {
                return videos;
            }
            case IMAGE_STICKER -> {
                return imageStickers;
            }
            case WEBP_STICKER -> {
                return webpStickers;
            }
            case VIDEO_STICKER -> {
                return videoStickers;
            }
            case LOTTIE_STICKER -> {
                return lottieStickers;
            }
            default -> {
                return files;
            }
        }
    }
}
