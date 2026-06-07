package com.novalearn;

import com.novalearn.config.cloudinary.CloudinaryProperties;
import com.novalearn.core.auth.jwt.JwtProperties;
import com.novalearn.core.user.AdminProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
        JwtProperties.class,
        AdminProperties.class,
        CloudinaryProperties.class
})
public class NovalearnBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NovalearnBackendApplication.class, args);
    }
}