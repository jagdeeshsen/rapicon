package com.example.rapicon.CustomExceptions;

public class PromoAlreadyUsedException extends RuntimeException{
    public PromoAlreadyUsedException(String m){
        super(m);
    }
}
