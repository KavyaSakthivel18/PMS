package com.example.backend.exception;

public class BlockedException extends BaseException {
    public BlockedException(String message) {
        super(message, "CONTAINER_BLOCKED");
    }
    
    public BlockedException(String message, Throwable cause) {
        super(message, cause);
    }
}
