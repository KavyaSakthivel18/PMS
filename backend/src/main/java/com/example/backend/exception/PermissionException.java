package com.example.backend.exception;

public class PermissionException extends BaseException {
    public PermissionException(String message) {
        super(message, "PERMISSION_DENIED");
    }
    
    public PermissionException(String message, Throwable cause) {
        super(message, cause);
    }
}
