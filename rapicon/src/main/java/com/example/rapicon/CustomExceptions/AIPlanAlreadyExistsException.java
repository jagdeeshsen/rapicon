package com.example.rapicon.CustomExceptions;

public class AIPlanAlreadyExistsException extends RuntimeException {
    public AIPlanAlreadyExistsException(String m){
        super(m);
    }
}
