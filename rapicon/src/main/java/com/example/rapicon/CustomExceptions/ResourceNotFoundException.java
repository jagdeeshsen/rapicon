package com.example.rapicon.CustomExceptions;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String m){
        super(m);
    }
}
