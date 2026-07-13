package com.novalearn.core.auth.repository;

import com.novalearn.core.auth.entity.LoginOtpChallenge;
import com.novalearn.core.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoginOtpChallengeRepository
        extends JpaRepository<LoginOtpChallenge, Long> {

    Optional<LoginOtpChallenge> findByChallengeId(String challengeId);

    List<LoginOtpChallenge> findByUserAndConsumedAtIsNull(User user);
}
