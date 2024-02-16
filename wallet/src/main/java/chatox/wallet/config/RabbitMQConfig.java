package chatox.wallet.config;

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
                                         Jackson2JsonMessageConverter messageConverter) {
        var rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }

    @Bean
    @Autowired
    public Jackson2JsonMessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public TopicExchange userEvents() {
        return new TopicExchange("user.events");
    }

    @Bean
    public Queue userCreatedQueue() {
        return new Queue("wallet_service_user_created");
    }

    @Bean
    public Queue userUpdatedQueue() {
        return new Queue("wallet_service_user_updated");
    }

    @Bean
    public Binding userCreatedBinding() {
        return BindingBuilder
                .bind(userCreatedQueue())
                .to(userEvents())
                .with("user.created.#");
    }

    @Bean
    public Binding userUpdatedBinding() {
        return BindingBuilder
                .bind(userUpdatedQueue())
                .to(userEvents())
                .with("user.updated.#");
    }

    @Bean
    public TopicExchange balanceEvents() {
        return new TopicExchange("balance.events");
    }

    @Bean
    public TopicExchange userInteractionEvents() {
        return new TopicExchange("user.interactions.events");
    }

    @Bean
    public Queue userInteractionCreated() {
        return new Queue("wallet_service_user_interaction_created");
    }

    @Bean
    public Binding userInteractionCreatedBinding() {
        return BindingBuilder
                .bind(userInteractionCreated())
                .to(userInteractionEvents())
                .with("user.interaction.created.#");
    }
}
