package com.novalearn.core.user;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.core.user.enums.UserStatus;
import com.novalearn.core.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    public AdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminProperties adminProperties
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminProperties = adminProperties;
    }

    @Override
    public void run(String... args) {

        String adminEmail = adminProperties.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User();
        admin.setFirstName(adminProperties.getFirstName());
        admin.setLastName(adminProperties.getLastName());
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminProperties.getPassword()));
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setEmailVerified(true);

        userRepository.save(admin);

        System.out.println("Admin inicial creado: " + adminEmail);
    }
}