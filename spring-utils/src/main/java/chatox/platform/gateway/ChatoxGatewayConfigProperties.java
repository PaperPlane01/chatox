package chatox.platform.gateway;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties("chatox.gateway")
@Getter
@Setter
public class ChatoxGatewayConfigProperties {
    private String url;
}
