package com.example.rapicon.CustomExceptions;

public class PromoExistsException extends RuntimeException{
    public PromoExistsException(String m){
        super(m);
    }
}
