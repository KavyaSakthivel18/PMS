package com.example.backend.exception;

public class DuplicateException extends BaseException {
    public DuplicateException(String message) {
        super(message, "DUPLICATE_RESOURCE");
    }
    
    public DuplicateException(String message, Throwable cause) {
        super(message, cause);
    }
}
