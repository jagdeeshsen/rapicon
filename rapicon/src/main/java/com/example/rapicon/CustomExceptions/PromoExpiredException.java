package com.example.rapicon.CustomExceptions;

public class PromoExpiredException extends RuntimeException {

    public PromoExpiredException(String m){
        super(m);
    }
}
