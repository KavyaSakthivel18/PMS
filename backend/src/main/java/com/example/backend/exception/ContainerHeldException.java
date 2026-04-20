package com.example.backend.exception;

public class ContainerHeldException extends RuntimeException {

    public ContainerHeldException(String message) {
        super(message);
    }

}