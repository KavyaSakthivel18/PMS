package com.example.backend.exception;

public class BaseException extends RuntimeException {
    private final String errorCode;
    
    public BaseException(String message) {
        super(message);
        this.errorCode = "INTERNAL_ERROR";
    }
    
    public BaseException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public BaseException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "INTERNAL_ERROR";
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
