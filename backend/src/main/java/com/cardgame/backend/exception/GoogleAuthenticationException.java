package com.cardgame.backend.exception;

public class GoogleAuthenticationException extends RuntimeException {

    public GoogleAuthenticationException(String message) {
        super(message);
    }

    public GoogleAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
