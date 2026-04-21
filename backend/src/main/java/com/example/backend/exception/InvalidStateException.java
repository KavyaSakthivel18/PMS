package com.example.backend.exception;

public class InvalidStateException extends BaseException {
    public InvalidStateException(String message) {
        super(message, "INVALID_STATE");
    }
    
    public InvalidStateException(String message, Throwable cause) {
        super(message, cause);
    }
}