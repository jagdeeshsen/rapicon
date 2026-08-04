package com.example.rapicon.Service;

import com.example.rapicon.CustomExceptions.ResourceNotFoundException;
import com.example.rapicon.DTO.DesignStatusUpdateRequest;
import com.example.rapicon.Models.Design;
import com.example.rapicon.Enum.Status;
import com.example.rapicon.Repository.DesignRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DesignService{

    final private DesignRepo designRepository;
    final private EmailService emailService;


    public Design createDesign(Design design) {

        design.setCreatedAt(LocalDateTime.now());
        design.setUpdatedAt(LocalDateTime.now());

        return designRepository.save(design);
    }


    public Design updateDesign(Design design) {
        return designRepository.save(design);
    }

    public List<Design> findByVendor(Long id){

        return designRepository.findByVendorId(id);
    }

    public String deleteDesign(Long id) {
        if (designRepository.existsById(id)) {
            designRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Design not found with ID: " + id);
        }
        return "Design Deleted Successfully.";
    }


    public List<Design> findDesignsByStatus(Status status) {
        return designRepository.findByStatus(status);
    }

    public Design updateDesignStatus(Long id, DesignStatusUpdateRequest request) {
        Design design = designRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design not found with id: " + id));

        design.setStatus(request.getStatus());
        design.setUpdatedAt(LocalDateTime.now());

        Design updatedDesign = designRepository.save(design);

        // Notify vendor for his design update status
        emailService.sendDesignUpdateEmail(design, request);

        return updatedDesign;
    }

    // DesignService.java — new method, does NOT touch design.status or call save()
    public void notifyVendorChangesRequested(Long id, String reason) {
        Design design = getDesignById(id);
        emailService.sendDesignChangesRequestedEmail(design, reason);
    }

    public Design getDesignById(Long id) {
        return  designRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design not found with id: " + id));
    }

    public Page<Design> findAllPagination(Pageable pageable){
        return designRepository.findAll(pageable);
    }

    @Transactional
    public void deactivateVendorDesigns(Long vendorId) {

        designRepository.updateStatusByVendorId(
                vendorId,
                Status.DEACTIVATE
        );
    }
}
