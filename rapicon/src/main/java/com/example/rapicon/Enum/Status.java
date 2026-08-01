package com.example.rapicon.Enum;

import lombok.Getter;

@Getter
public enum Status {
    PENDING("Pending Review"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    SUSPENDED("Suspended"),
    DEACTIVATE("Deactivate"),
    DRAFT("Draft");

    private final String displayName;

    Status(String displayName) {
        this.displayName = displayName;
    }
}
