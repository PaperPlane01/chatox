package chatox.oauth2.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    @Autowired
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         Jackson2JsonMessageConverter jackson2JsonMessageConverter) {
        var rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter);
        return rabbitTemplate;
    }

    @Bean
    @Autowired
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public TopicExchange globalBanEvents() {
        return new TopicExchange("global.ban.events");
    }

    @Bean
    public Queue globalBanCreatedQueue() {
        return new Queue("oauth2_service_global_ban_created");
    }

    @Bean
    public Queue globalBanUpdatedQueue() {
        return new Queue("oauth2_service_global_ban_updated");
    }

    @Bean
    public Binding globalBanCreatedBinding() {
        return BindingBuilder
                .bind(globalBanCreatedQueue())
                .to(globalBanEvents())
                .with("global.ban.created.#");
    }

    @Bean
    public Binding globalBanUpdatedBinding() {
        return BindingBuilder
                .bind(globalBanUpdatedQueue())
                .to(globalBanEvents())
                .with("global.ban.updated.#");
    }
}
