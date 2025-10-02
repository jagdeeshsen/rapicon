package com.example.rapicon.Models;

public enum Status {
    PENDING("Pending Review"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    SUSPENDED("Suspended"),
    DRAFT("Draft");

    private final String displayName;

    Status(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }

    public boolean isActive() {
        return this == APPROVED;
    }

    public boolean isPending() {
        return this == PENDING;
    }

    public boolean isRejected() {
        return this == REJECTED;
    }
}
