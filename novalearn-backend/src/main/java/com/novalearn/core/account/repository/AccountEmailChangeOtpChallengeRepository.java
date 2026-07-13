package com.novalearn.core.account.repository;

import com.novalearn.core.account.entity.AccountEmailChangeOtpChallenge;
import com.novalearn.core.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountEmailChangeOtpChallengeRepository
        extends JpaRepository<AccountEmailChangeOtpChallenge, Long> {

    Optional<AccountEmailChangeOtpChallenge> findByChallengeId(
            String challengeId
    );

    List<AccountEmailChangeOtpChallenge> findByUserAndConsumedAtIsNull(
            User user
    );
}
