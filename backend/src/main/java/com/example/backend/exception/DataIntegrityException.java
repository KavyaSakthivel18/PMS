package com.example.backend.exception;

public class DataIntegrityException extends BaseException {
    public DataIntegrityException(String message) {
        super(message, "DATA_INTEGRITY_ERROR");
    }
    
    public DataIntegrityException(String message, Throwable cause) {
        super(message, cause);
    }
}
