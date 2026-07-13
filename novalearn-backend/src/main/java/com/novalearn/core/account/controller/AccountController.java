package com.novalearn.core.account.controller;

import com.novalearn.core.account.dto.AccountProfileResponse;
import com.novalearn.core.account.dto.ChangePasswordRequest;
import com.novalearn.core.account.dto.ConfirmEmailChangeRequest;
import com.novalearn.core.account.dto.ConfirmEmailChangeResponse;
import com.novalearn.core.account.dto.EmailChangeChallengeResponse;
import com.novalearn.core.account.dto.RequestEmailChangeRequest;
import com.novalearn.core.account.dto.UpdateAccountProfileRequest;
import com.novalearn.core.account.service.AccountService;
import com.novalearn.core.auth.dto.LogoutResponse;
import com.novalearn.core.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/profile")
    public ResponseEntity<AccountProfileResponse> getProfile(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                accountService.getProfile(user(authentication))
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<AccountProfileResponse> updateProfile(
            @Valid @RequestBody UpdateAccountProfileRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                accountService.updateProfile(
                        user(authentication),
                        request
                )
        );
    }

    @PostMapping("/email-change/request")
    public ResponseEntity<EmailChangeChallengeResponse> requestEmailChange(
            @Valid @RequestBody RequestEmailChangeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                accountService.requestEmailChange(
                        user(authentication),
                        request
                )
        );
    }

    @PostMapping("/email-change/confirm")
    public ResponseEntity<ConfirmEmailChangeResponse> confirmEmailChange(
            @Valid @RequestBody ConfirmEmailChangeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                accountService.confirmEmailChange(
                        user(authentication),
                        request
                )
        );
    }

    @PutMapping("/password")
    public ResponseEntity<LogoutResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        accountService.changePassword(
                user(authentication),
                request
        );

        return ResponseEntity.ok(
                new LogoutResponse("Contraseña actualizada correctamente")
        );
    }

    private User user(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
