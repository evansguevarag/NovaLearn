package com.novalearn.config.security;

import com.novalearn.core.auth.jwt.JwtAuthenticationFilter;
import com.novalearn.core.user.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final CorsConfigurationSource corsConfigurationSource;

        public SecurityConfig(
                JwtAuthenticationFilter jwtAuthenticationFilter,
                CorsConfigurationSource corsConfigurationSource
        ) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.corsConfigurationSource = corsConfigurationSource;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                return http
                        .csrf(AbstractHttpConfigurer::disable)
                        .cors(cors -> cors.configurationSource(corsConfigurationSource))
                        .formLogin(AbstractHttpConfigurer::disable)
                        .httpBasic(AbstractHttpConfigurer::disable)
                        .logout(AbstractHttpConfigurer::disable)
                        .sessionManagement(session ->
                                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                        )
                        .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/api/v1/auth/**").permitAll()
                                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                                .requestMatchers("/", "/api/v1/public/**").permitAll()
                                .requestMatchers("/api/v1/certificates/code/**").permitAll()

                                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                                .requestMatchers("/api/v1/certificates/admin/**").hasRole("ADMIN")
                                .requestMatchers("/api/v1/instructor/**").hasAnyRole("ADMIN", "INSTRUCTOR")
                                .requestMatchers("/api/v1/student/**").hasAnyRole("ADMIN", "STUDENT")
                                .requestMatchers("/api/v1/certificates/student/**").hasRole("STUDENT")
                                .requestMatchers("/api/v1/certificates/enrollment/**").hasAnyRole("ADMIN", "STUDENT")

                                .anyRequest().authenticated()
                        )
                        .addFilterBefore(
                                jwtAuthenticationFilter,
                                UsernamePasswordAuthenticationFilter.class
                        )
                        .build();
        }

        @Bean
        public UserDetailsService userDetailsService(UserRepository userRepository) {
                return email -> userRepository.findByEmail(email)
                        .map(user -> org.springframework.security.core.userdetails.User
                                .withUsername(user.getEmail())
                                .password(user.getPassword())
                                .roles(user.getRole().name())
                                .build()
                        )
                        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
