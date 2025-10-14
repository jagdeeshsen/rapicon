package com.example.rapicon.Controller;

import com.example.rapicon.Models.CartItem;
import com.example.rapicon.Service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;

    @PostMapping("/addItem")
    public ResponseEntity<CartItem> createCartItem(@RequestBody CartItem cartItem){
       try{
           cartItem.setAdded_at(new Timestamp(System.currentTimeMillis()));
           cartItem.setUpdated_at(new Timestamp(System.currentTimeMillis()));
           cartItemService.saveItem(cartItem);
           return ResponseEntity.ok(cartItem);
       }catch (Exception e){
           return ResponseEntity.badRequest().build();
       }
    }

    @GetMapping("/items")
    public ResponseEntity<List<CartItem>> getItemsByUser(@RequestParam("user_id") Long id){
        List<CartItem> items= cartItemService.getItemByUser(id);
        return ResponseEntity.ok(items);
    }

    @DeleteMapping("/delete")
    public String deleteItem(@RequestParam("id") Long id){
        cartItemService.deleteCartItem(id);
        return "Item deleted successfully";
    }
}
