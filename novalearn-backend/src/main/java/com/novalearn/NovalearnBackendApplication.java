package com.novalearn;

import com.novalearn.core.auth.jwt.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class NovalearnBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NovalearnBackendApplication.class, args);
    }
}
