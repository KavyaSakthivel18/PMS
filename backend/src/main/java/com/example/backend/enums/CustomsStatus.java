package com.example.backend.enums;

public enum CustomsStatus {
    PENDING,
    UNDER_REVIEW,
    CLEARED,
    REJECTED,
    HELD;
    
    public boolean allowsMovement() {
        return this == CLEARED;
    }

    public boolean isTerminal() {
        return this == CLEARED || this == REJECTED;
    }
}