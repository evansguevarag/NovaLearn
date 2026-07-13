package com.novalearn.core.account.dto;

import com.novalearn.core.user.entity.User;

public class AccountProfileResponse {

    private final Long id;
    private final String firstName;
    private final String paternalLastName;
    private final String maternalLastName;
    private final String email;
    private final String role;
    private final String status;

    public AccountProfileResponse(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.paternalLastName = user.getPaternalLastName();
        this.maternalLastName = user.getMaternalLastName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.status = user.getStatus().name();
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getPaternalLastName() { return paternalLastName; }
    public String getMaternalLastName() { return maternalLastName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
}
