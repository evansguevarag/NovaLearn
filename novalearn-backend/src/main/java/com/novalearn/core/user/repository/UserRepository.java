package com.novalearn.core.user.repository;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(UserRole role);

    List<User> findTop10ByOrderByCreatedAtDesc();
}