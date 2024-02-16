import {Env, loadConfig} from "env-decorator";

class EnvConfig {
    @Env({required: true, type: "number"})
    REPORTS_SERVICE_PORT: number;

    @Env({required: true, type: "string"})
    MONGODB_HOST: string;

    @Env({required: true, type: "string"})
    MONGODB_PORT: number;

    @Env({required: true, type: "string"})
    REPORTS_SERVICE_DATABASE_NAME: string;

    @Env({required: false, type: "string"})
    REPORTS_SERVICE_EUREKA_APP_NAME: string = "reports-service";

    @Env({required: false, type: "string"})
    EUREKA_HOST: string = "localhost";

    @Env({required: false, type: "number"})
    EUREKA_PORT: number = 8081;

    @Env({required: true, type: "string"})
    REPORTS_SERVICE_CLIENT_ID: string;

    @Env({required: true, type: "string"})
    REPORTS_SERVICE_CLIENT_SECRET: string;

    @Env({required: false, type: "string"})
    API_HOST: string = "http://localhost:8080";

    @Env({required: true, type: "string"})
    RABBITMQ_USERNAME: string;

    @Env({required: true, type: "string"})
    RABBITMQ_PASSWORD: string;

    @Env({required: true, type: "string"})
    RABBITMQ_HOST: string;

    @Env({required: true, type: "number"})
    RABBITMQ_PORT: number;

    @Env({required: false, type: "string"})
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
-----END CERTIFICATE-----`;
}

export const config = loadConfig(EnvConfig);
