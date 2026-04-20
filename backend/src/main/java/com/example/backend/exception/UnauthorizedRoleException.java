package com.example.backend.exception;

public class UnauthorizedRoleException extends RuntimeException {

    public UnauthorizedRoleException(String message) {
        super(message);
    }

}