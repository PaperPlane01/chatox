import {Env} from "env-decorator";

export class EnvConfig {
    @Env({type: "string", required: true})
    IMAGES_DIRECTORY: string;

    @Env({type: "string", required: true})
    IMAGES_THUMBNAILS_DIRECTORY: string;

    @Env({type: "number", required: false})
    IMAGE_MAX_SIZE_BYTES: number = 10485760; // 10 megabytes by default

    @Env({type: "string", required: true})
    VIDEOS_DIRECTORY: string;

    @Env({type: "number", required: false})
    VIDEO_MAX_SIZE_BYTES: number = 524288000; // 500 megabytes by default

    @Env({type: "string", required: true})
    AUDIOS_DIRECTORY: string;

    @Env({type: "number", required: false})
    AUDIO_MAX_SIZE_BYTES: number = 31457280; // 30 megabytes default

    @Env({type: "string", required: true})
    FILES_DIRECTORY: string;

    @Env({type: "number", required: false})
    FILE_MAX_SIZE_BYTES: number = 1073741824; // 1 gigabyte default

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
    EUREKA_APP_NAME: string = "uploads-service";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_IP_ADDRESS: string = "127.0.0.1";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_HOST: string = "localhost";

    @Env({type: "string", required: true})
    RABBITMQ_USERNAME: string;

    @Env({type: "string", required: true})
    RABBITMQ_PASSWORD: string;

    @Env({type: "string", required: true})
    RABBITMQ_HOST: string;

    @Env({type: "number", required: true})
    RABBITMQ_PORT: number;

    @Env({type: "string", required: false})
    JWT_PUBLIC_KEY: string = `-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----`
}
