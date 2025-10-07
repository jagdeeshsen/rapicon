package com.example.rapicon.Service;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Repository.DesignRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DesignService{

    @Autowired
    private DesignRepo designRepository;


    public Design createDesign(Design design) {
        Design savedDesign = designRepository.save(design);
        System.out.println("Design created with id: {}"+ savedDesign.getId());
        return savedDesign;
    }


    public Design updateDesign(Design design) {
        //design.setUpdatedAt(LocalDateTime.now());
        Design updatedDesign = designRepository.save(design);
        System.out.println("Design updated with id: {}"+ updatedDesign.getId());
        return updatedDesign;
    }

    public List<Design> getDesigns(Long id){
        return designRepository.findByVendorId(id);
    }

    public void deleteDesign(Long id) {
        if (designRepository.existsById(id)) {
            designRepository.deleteById(id);
            System.out.println("Design deleted with id: {}"+ id);
        } else {
            throw new RuntimeException("Design not found with ID: " + id);
        }
    }


    public List<Design> findDesignsByStatus(Status status) {
        return designRepository.findByStatus(status);
    }

    public Design updateDesignStatus(Long id, Status status) {
        Optional<Design> design= designRepository.findById(id);

        if(design.isEmpty()){
            throw new RuntimeException("Design not found: "+ id);
        }

        Design originalDesign= design.get();
        originalDesign.setStatus(status);

        Design updatedDesign = designRepository.save(originalDesign);
        System.out.println("Design status updated to {} for id: {}"+ status+ id);

        return updatedDesign;
    }

    public Design getDesignById(Long id) {
        return  designRepository.getDesignById(id);
    }

    public List<Design> getAllDesigns(){
        return designRepository.findAll();
    }

    public Optional<Design> findDesignById(Long id){
        return designRepository.findById(id);
    }
}
