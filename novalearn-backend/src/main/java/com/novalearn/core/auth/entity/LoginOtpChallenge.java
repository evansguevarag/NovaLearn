package com.novalearn.core.auth.entity;

import com.novalearn.core.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "auth_login_otps")
public class LoginOtpChallenge {

    private static final int MAX_ATTEMPTS = 5;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "challenge_id", nullable = false, unique = true)
    private String challengeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "consumed_at")
    private LocalDateTime consumedAt;

    @Column(name = "attempts", nullable = false)
    private int attempts;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected LoginOtpChallenge() {
    }

    public LoginOtpChallenge(
            String challengeId,
            User user,
            String codeHash,
            LocalDateTime expiresAt
    ) {
        this.challengeId = challengeId;
        this.user = user;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
    }

    public String getChallengeId() {
        return challengeId;
    }

    public User getUser() {
        return user;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public boolean isUsable(LocalDateTime now) {
        return consumedAt == null &&
                expiresAt.isAfter(now) &&
                attempts < MAX_ATTEMPTS;
    }

    public void registerFailedAttempt() {
        attempts++;
    }

    public void consume(LocalDateTime now) {
        consumedAt = now;
    }

    public void expire(LocalDateTime now) {
        if (consumedAt == null) {
            consumedAt = now;
        }
    }
}
