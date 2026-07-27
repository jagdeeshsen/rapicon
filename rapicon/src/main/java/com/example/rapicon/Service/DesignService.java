package com.example.rapicon.Service;

import com.example.rapicon.CustomExceptions.ResourceNotFoundException;
import com.example.rapicon.Models.Design;
import com.example.rapicon.Enum.Status;
import com.example.rapicon.Repository.DesignRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DesignService{

    @Autowired
    private DesignRepo designRepository;


    public Design createDesign(Design design) {

        design.setCreatedAt(LocalDateTime.now());
        design.setUpdatedAt(LocalDateTime.now());

        return designRepository.save(design);
    }


    public Design updateDesign(Design design) {
        return designRepository.save(design);
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
            throw new ResourceNotFoundException("Design not found with id :" + id );
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

    public Page<Design> findAllPagination(int page, int size){
        Pageable pageable = PageRequest.of(page,size);
        return designRepository.findAll(pageable);
    }

    public Optional<Design> findDesignById(Long id){
        return designRepository.findById(id);
    }

    @Transactional
    public void deactivateVendorDesigns(Long vendorId) {

        designRepository.updateStatusByVendorId(
                vendorId,
                Status.DEACTIVATE
        );
    }
}
