import {Env} from "env-decorator";
import {UploadType} from "../uploads";

export class EnvConfig {
    @Env({type: "string", required: true})
    IMAGES_DIRECTORY: string;

    @Env({type: "string", required: true})
    IMAGES_THUMBNAILS_DIRECTORY: string;

    @Env({type: "number", required: false})
    IMAGE_MAX_SIZE_BYTES = 10485760; // 10 megabytes by default

    @Env({type: "string", required: true})
    VIDEOS_DIRECTORY: string;

    @Env({type: "number", required: false})
    VIDEO_MAX_SIZE_BYTES = 524288000; // 500 megabytes by default

    @Env({type: "string", required: true})
    AUDIOS_DIRECTORY: string;

    @Env({type: "number", required: false})
    AUDIO_MAX_SIZE_BYTES = 31457280; // 30 megabytes default

    @Env({type: "string", required: true})
    FILES_DIRECTORY: string;

    @Env({type: "number", required: false})
    FILE_MAX_SIZE_BYTES = 1073741824; // 1 gigabyte default

    @Env({type: "string", required: true})
    STICKERS_DIRECTORY: string;

    @Env({type: "string", required: true})
    STICKERS_THUMBNAILS_DIRECTORY: string;

    @Env({type: "number", required: false})
    WEBP_STICKER_MAX_SIZE_BYTES = 64000; // 64 kilobytes default;

    @Env({type: "string", required: true})
    LOTTIE_STICKERS_DIRECTORY: string;

    @Env({type: "number", required: false})
    LOTTIE_STICKER_MAX_SIZE_BYTES = 640000; // 640 kilobytes default

    @Env({type: "string", required: true})
    VIDEO_STICKERS_DIRECTORY: string;

    @Env({type: "number", required: false})
    VIDEO_STICKERS_MAX_SIZE_BYTES = 256000; // 256 kilobytes default

    @Env({type: "string", required: true})
    ARCHIVED_FILES_DIRECTORY: string;

    @Env({type: "string", required: true})
    FFPROBE_PATH: string;

    @Env({type: "string", required: true})
    FFMPEG_PATH: string;

    @Env({type: "string", required: true})
    MONGODB_HOST: string;

    @Env({type: "string", required: true})
    MONGODB_PORT: string;

    @Env({type: "string", required: true})
    MONGODB_DATABASE_NAME: string;

    @Env({type: "number", required: true})
    PORT: number;

    @Env({type: "string", required: true})
    EUREKA_HOST: string;

    @Env({type: "number", required: true})
    EUREKA_PORT: number;

    @Env({type: "string", required: false})
    EUREKA_APP_NAME = "uploads-service";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_IP_ADDRESS = "127.0.0.1";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_HOST = "localhost";

    @Env({type: "string", required: true})
    RABBITMQ_USERNAME: string;

    @Env({type: "string", required: true})
    RABBITMQ_PASSWORD: string;

    @Env({type: "string", required: true})
    RABBITMQ_HOST: string;

    @Env({type: "number", required: true})
    RABBITMQ_PORT: number;

    @Env({type: "string", required: true})
    API_HOST: string;

    @Env({type: "string", required: true})
    REDIS_HOST: string;

    @Env({type: "string", required: true})
    REDIS_PORT: string;

    @Env({type: "string", required: false})
    JWT_PUBLIC_KEY = `-----BEGIN CERTIFICATE-----
MIIDdTCCAl2gAwIBAgIEaWzSsDANBgkqhkiG9w0BAQsFADBrMRAwDgYDVQQGEwdV
bmtub3duMRAwDgYDVQQIEwdVbmtub3duMRAwDgYDVQQHEwdVbmtub3duMQ8wDQYD
VQQKEwZDaGF0b3gxEDAOBgNVBAsTB1Vua25vd24xEDAOBgNVBAMTB1Vua25vd24w
HhcNMTkxMDIwMTUwODAxWhcNMjAwMTE4MTUwODAxWjBrMRAwDgYDVQQGEwdVbmtu
b3duMRAwDgYDVQQIEwdVbmtub3duMRAwDgYDVQQHEwdVbmtub3duMQ8wDQYDVQQK
EwZDaGF0b3gxEDAOBgNVBAsTB1Vua25vd24xEDAOBgNVBAMTB1Vua25vd24wggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC4jCMbtvCq/on4my4XYDcFGYlL
jKP+rl6xfM2QYIlIDOu2w5hffBt/y5kK9Ie18KX+KA94v4dSAP5G0aQKrOfxYFp0
l+pWHW24XdfexzwNFC79nlGh1FOZYM2QXUJiUSjk5ytDlC6/mtpQaXxOdE8mGNgX
uq68PBXoQlNqabSwgs3a1GDv2leGR/WSQBzm6Ek6z5JZRiaQUaKbZnAw3kgDRA4J
vSbO+PtdiCpbXzfvqoJOG1iT0JiPH2QK+659Sb3f8bhUdZvaa/IeAnx27M14BZo9
9OpKEgGa7F1/TFCcLJ2jPPOrQi8jxt39jCi6qsoWn254hFfbMLtZ06GlE4ZTAgMB
AAGjITAfMB0GA1UdDgQWBBTbhW9eDywOxX9Icb0ynQ72o/ui2TANBgkqhkiG9w0B
AQsFAAOCAQEAToKrRbYiJw3WYRKs6s0WmeAW1lSApN9auI4UDGp/rKVAkkpe9hjx
1rCqIjxuBjt1Hi+ds/D56dn2/dYe8k5NrUe3wLHxDuVwKRXYxcYjB7Jq02BKvB32
IPaa2Uit2gOySFIHFiD4i75O76rYwSjhTavCwQA4tOwCuF8EnopTfi0dBVDKWK1T
uoP2v55gv3Xw79kD0wAnUlPdpMH8GT1OyPKKHkH+/hcanEO4W4goswEwLj2s7VYw
PsT6edytR9T/+rob9cvuoz2owBBTGYYAwxvscuVqM5OvXD+pNaeCwT77XoO8pCyS
WE1lrebeBEpZdw79ygRL6UuFvUg9OCW88Q==
-----END CERTIFICATE-----`;

    @Env({type: "boolean", required: false})
    ENABLE_SCHEDULED_UPLOAD_DELETION = false;

    @Env({type: "string", required: true})
    PYTHON_LOTTIE_PATH: string;

    getUploadDirectory(uploadType: UploadType): string {
        switch (uploadType) {
            case UploadType.AUDIO:
                return this.AUDIOS_DIRECTORY;
            case UploadType.IMAGE:
            case UploadType.GIF:
                return this.IMAGES_DIRECTORY;
            case UploadType.VIDEO:
                return this.VIDEOS_DIRECTORY;
            case UploadType.IMAGE_STICKER:
            case UploadType.WEBP_STICKER:
                return this.STICKERS_DIRECTORY;
            case UploadType.LOTTIE_STICKER:
                return this.LOTTIE_STICKERS_DIRECTORY;
            case UploadType.VIDEO_STICKER:
                return this.VIDEO_STICKERS_DIRECTORY;
            case UploadType.FILE:
            default:
                return this.FILES_DIRECTORY;
        }
    }
}
