package com.example.backend.exception;

public class CustomsNotClearedException extends RuntimeException {

    public CustomsNotClearedException(String message) {
        super(message);
    }

}