package com.example.rapicon.Enum;

import lombok.Getter;

@Getter
public enum Status {
    PENDING("Pending Review"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    DEACTIVATE("Deactivate"),
    CHANGES_REQUESTED("Changes_Requested");

    private final String displayName;

    Status(String displayName) {
        this.displayName = displayName;
    }
}
