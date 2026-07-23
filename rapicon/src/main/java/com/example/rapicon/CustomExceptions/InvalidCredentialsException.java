package com.example.rapicon.CustomExceptions;

public class InvalidCredentialsException extends RuntimeException{

    public InvalidCredentialsException(String m){
        super(m);
    }
}
