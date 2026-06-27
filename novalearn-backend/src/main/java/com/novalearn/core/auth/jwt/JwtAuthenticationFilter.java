package com.novalearn.core.auth.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        if (
                authHeader == null ||
                !authHeader.startsWith("Bearer ")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            authenticateRequest(
                    request,
                    token
            );

            filterChain.doFilter(
                    request,
                    response
            );
        } catch (ExpiredJwtException exception) {
            writeUnauthorizedResponse(
                    response,
                    request,
                    "El token de acceso ha expirado."
            );
        } catch (JwtException | IllegalArgumentException exception) {
            writeUnauthorizedResponse(
                    response,
                    request,
                    "El token de acceso no es válido."
            );
        }
    }

    private void authenticateRequest(
            HttpServletRequest request,
            String token
    ) {
        String email =
                jwtService.extractUsername(token);

        if (
                email == null ||
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() != null
        ) {
            return;
        }

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (
                user == null ||
                !jwtService.isTokenValid(
                        token,
                        user.getEmail()
                )
        ) {
            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                        "ROLE_" + user.getRole().name()
                                )
                        )
                );

        authentication.setDetails(
                new WebAuthenticationDetailsSource()
                        .buildDetails(request)
        );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);
    }

    private void writeUnauthorizedResponse(
            HttpServletResponse response,
            HttpServletRequest request,
            String message
    ) throws IOException {

        SecurityContextHolder.clearContext();

        response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );

        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put("status", 401);
        body.put("error", "Unauthorized");
        body.put("message", message);
        body.put("path", request.getRequestURI());
        body.put("validationErrors", null);
        body.put("timestamp", LocalDateTime.now());

        objectMapper.writeValue(
                response.getOutputStream(),
                body
        );
    }
}