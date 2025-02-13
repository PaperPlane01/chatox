package chatox.platform.upload;

import java.util.List;
import java.util.stream.Stream;

public enum UploadType {
    IMAGE,
    GIF,
    AUDIO,
    VIDEO,
    FILE,
    VOICE_MESSAGE,
    IMAGE_STICKER,
    WEBP_STICKER,
    LOTTIE_STICKER,
    VIDEO_STICKER;

    public static final List<UploadType> STICKER_UPLOAD_TYPES = List.of(
            IMAGE_STICKER,
            WEBP_STICKER,
            LOTTIE_STICKER,
            VIDEO_STICKER
    );

    public static UploadType fromString(String stringValue) {
        return Stream.of(UploadType.values())
                .filter(uploadType -> uploadType.name().equalsIgnoreCase(stringValue.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid upload type " + stringValue));
    }

    public static boolean isStickerUploadType(UploadType uploadType) {
        return STICKER_UPLOAD_TYPES.contains(uploadType);
    }
}
