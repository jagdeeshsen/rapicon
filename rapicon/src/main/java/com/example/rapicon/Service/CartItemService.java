package com.example.rapicon.Service;

import com.example.rapicon.Models.CartItem;
import com.example.rapicon.Repository.CartItemRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepo cartItemRepo;

    public List<CartItem> getItemByUser(Long id){
        List<CartItem> items= cartItemRepo.findItemByUserId(id);
        return items;
    }

    public void saveItem(CartItem item){
        cartItemRepo.save(item);
    }

    public void deleteCartItem(Long id){
        cartItemRepo.deleteById(id);
    }
}
