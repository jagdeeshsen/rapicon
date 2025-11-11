package com.example.rapicon.Service;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Repository.DesignRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DesignService{

    @Autowired
    private DesignRepo designRepository;


    public Design createDesign(Design design) {

        design.setCreatedAt(LocalDateTime.now());
        design.setUpdatedAt(LocalDateTime.now());

        Design savedDesign= designRepository.save(design);
        return savedDesign;
    }


    public Design updateDesign(Design design) {
        Design updatedDesign= designRepository.save(design);
        return updatedDesign;
    }

    public List<Design> getDesigns(Long id){

        return designRepository.findByVendorId(id);
    }

    public String deleteDesign(Long id) {
        if (designRepository.existsById(id)) {
            designRepository.deleteById(id);
        } else {
            throw new RuntimeException("Design not found with ID: " + id);
        }
        return "Design Deleted Successfully.";
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
