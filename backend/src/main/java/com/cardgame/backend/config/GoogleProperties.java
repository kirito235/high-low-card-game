package com.cardgame.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "app.google")
@Getter
@Setter
public class GoogleProperties {
    private String clientId;
    private String clientSecret;
}
