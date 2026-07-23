package com.example.rapicon.CustomExceptions;

public class AccountInactiveException extends RuntimeException{

    public AccountInactiveException(String m){
        super(m);
    }
}
