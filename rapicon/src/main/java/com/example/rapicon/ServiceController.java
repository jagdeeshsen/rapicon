package com.example.rapicon;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

   /* @Autowired
    private ServiceRepository repo;

    @GetMapping
    public List<Service> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public Service create(@RequestBody Service s) {
        return repo.save(s);
    }*/
}
