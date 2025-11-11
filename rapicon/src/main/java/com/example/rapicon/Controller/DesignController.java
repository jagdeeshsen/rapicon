package com.example.rapicon.Controller;

import com.example.rapicon.DTO.DesignRequestDTO;
import com.example.rapicon.Models.*;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.DesignService;
import com.example.rapicon.Service.S3Service;
import com.example.rapicon.Service.UserService;
import com.example.rapicon.Service.VendorService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.security.PublicKey;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/designs")
@CrossOrigin(origins = "*")
public class DesignController {

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private DesignService designService;


    @Autowired
    private S3Service s3Service;

    // List of allowed file extensions
    private final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png"
    );
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB



    // --------------------------------- VENDOR END POINTS------------------------------------//

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> createDesign(
            @ModelAttribute DesignRequestDTO request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Map<String, Object> response = new HashMap<>();
        List<String> elevationUrls = new ArrayList<>();
        List<String> twoDPlanUrls = new ArrayList<>();

        try {
            // Get vendor
            Vendor vendor = vendorService.getVendorByUsername(userDetails.getUsername());
            if (vendor == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Vendor not found"));
            }

            List<MultipartFile> elevationFiles = request.getElevationFiles();
            List<MultipartFile> twoDPlanFiles = request.getTwoDPlanFiles();

            // ----------- Validate Elevation Files -----------
            ValidationResult elevationValidation = validateFiles(elevationFiles, "Elevation");
            if (!elevationValidation.isValid()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", elevationValidation.getErrorMessage()));
            }

            // Upload Elevation files to S3
            for (MultipartFile file : elevationFiles) {
                String imageUrl = s3Service.uploadFile(file, "designs/elevations");
                elevationUrls.add(imageUrl);
            }

            // ----------- Validate 2D Plan Files -----------
            ValidationResult planValidation = validateFiles(twoDPlanFiles, "2D Plan");
            if (!planValidation.isValid()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", planValidation.getErrorMessage()));
            }

            // Upload 2D Plan files to S3
            for (MultipartFile file : twoDPlanFiles) {
                String imageUrl = s3Service.uploadFile(file, "designs/plans");
                twoDPlanUrls.add(imageUrl);
            }

            // Create Design object
            Design design = new Design();
            design.setDesignType(request.getDesignType());
            design.setDesignCategory(request.getDesignCategory());
            design.setTotalArea(request.getTotalArea());
            design.setVendor(vendor);
            design.setPlotFacing(request.getPlotFacing());
            design.setPlotLocation(request.getPlotLocation());
            design.setParking(request.getParking());
            design.setBuiltUpArea(request.getBuiltUpArea());
            design.setLength(request.getLength());
            design.setWidth(request.getWidth());
            design.setStatus(Status.PENDING);
            design.setElevationUrls(elevationUrls);
            design.setTwoDPlanUrls(twoDPlanUrls);

            // Parse floor list
            ObjectMapper mapper = new ObjectMapper();
            List<Floor> floors = new ArrayList<>();
            if (request.getFloorList() != null && !request.getFloorList().isEmpty()) {
                try {
                    floors = mapper.readValue(request.getFloorList(),
                            new TypeReference<List<Floor>>() {});
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid floor list JSON: " + e.getMessage()));
                }
            }
            design.setFloorList(floors);

            Design savedDesign = designService.createDesign(design);

            response.put("success", true);
            response.put("message", "Design uploaded successfully");
            response.put("design", savedDesign);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error uploading design: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error uploading design: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> updateDesignByVendor(@PathVariable Long id, @ModelAttribute DesignRequestDTO request) throws IOException {
        try{
            Optional<Design> optionalDesign= designService.findDesignById(id);
            if(optionalDesign.isEmpty()){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Design not found");
            }

            Design design= optionalDesign.get();

            // set the design
            design.setDesignType(request.getDesignType());
            design.setDesignCategory(request.getDesignCategory());
            design.setLength(request.getLength());
            design.setWidth(request.getWidth());
            design.setTotalArea(request.getTotalArea());
            design.setParking(request.getParking());
            design.setPlotFacing(request.getPlotFacing());
            design.setPlotLocation(request.getPlotLocation());
            design.setBuiltUpArea(request.getBuiltUpArea());
            design.setUpdatedAt(LocalDateTime.now());

            ObjectMapper mapper = new ObjectMapper();
            List<Floor> floors = new ArrayList<>();
            if (request.getFloorList() != null && !request.getFloorList().isEmpty()) {
                floors = mapper.readValue(request.getFloorList(), new TypeReference<List<Floor>>() {});
            }
            design.setFloorList(floors);

            List<String> elevationUrls= new ArrayList<>();
            List<String> twoDPlanUrls= new ArrayList<>();

            List<MultipartFile> elevationFiles= request.getElevationFiles();
            List<MultipartFile> twoDPlanFiles= request.getTwoDPlanFiles();

            if(elevationFiles!=null && !elevationFiles.isEmpty()){
                // Upload Elevation file to S3
                for(MultipartFile file: elevationFiles){
                    // Check file extension
                    String originalFileName = file.getOriginalFilename();
                    if (originalFileName == null) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Invalid Elevation file name"));
                    }

                    String fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
                    if (!ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "File type not allowed. Allowed types: " + ALLOWED_EXTENSIONS));
                    }
                    String imageUrl = s3Service.uploadFile(file, "designs");
                    elevationUrls.add(imageUrl);
                }
                design.setElevationUrls(elevationUrls);
            }

            // Upload 2D Plan file to S3
            if(twoDPlanFiles!=null && !twoDPlanFiles.isEmpty()){
                for(MultipartFile file: twoDPlanFiles){
                    // Check file extension
                    String originalFileName = file.getOriginalFilename();
                    if (originalFileName == null) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Invalid 2D Plan file name"));
                    }

                    String fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
                    if (!ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "File type not allowed. Allowed types: " + ALLOWED_EXTENSIONS));
                    }
                    String imageUrl = s3Service.uploadFile(file, "designs");
                    twoDPlanUrls.add(imageUrl);
                }
                design.setTwoDPlanUrls(twoDPlanUrls);
            }

            Design updatedDesign= designService.updateDesign(design);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Design updated successfully.",
                    "design", updatedDesign
            ));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating design: "+ e.getMessage());
        }
    }


    @GetMapping("/fetch-designs")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<Design>> getMyDesigns(@AuthenticationPrincipal UserDetailsImpl userDetails){

        try{
            Vendor vendor= vendorService.getVendorByUsername(userDetails.getUsername());
            List<Design> myDesign= designService.getDesigns(vendor.getId());

            return ResponseEntity.ok(myDesign);
        }catch (Exception e){
            throw new RuntimeException("Error to get designs"+ e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('VENDOR')")
    public String deleteDesignByVendor(@RequestParam("id") Long id){
        designService.deleteDesign(id);
        return "Design deleted successfully";
    }

    // Helper method for file validation
    private ValidationResult validateFiles(List<MultipartFile> files, String fileType) {
        // Check if files exist
        if (files == null || files.isEmpty()) {
            return ValidationResult.error("No " + fileType + " files uploaded");
        }

        // Validate each file
        for (MultipartFile file : files) {
            // Check if file is empty
            if (file.isEmpty()) {
                return ValidationResult.error(fileType + " file is empty");
            }

            // Check file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ValidationResult.error(
                        fileType + " file '" + file.getOriginalFilename() +
                                "' exceeds 50MB limit (size: " + (file.getSize() / (1024 * 1024)) + "MB)"
                );
            }

            // Check file extension
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || originalFileName.isEmpty()) {
                return ValidationResult.error("Invalid " + fileType + " file name");
            }

            int lastDotIndex = originalFileName.lastIndexOf('.');
            if (lastDotIndex == -1) {
                return ValidationResult.error(
                        fileType + " file '" + originalFileName + "' has no extension"
                );
            }

            String fileExtension = originalFileName.substring(lastDotIndex).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
                return ValidationResult.error(
                        fileType + " file type not allowed. File: '" + originalFileName +
                                "'. Allowed types: " + ALLOWED_EXTENSIONS
                );
            }
        }

        return ValidationResult.success();
    }

    // Inner class for validation results
    private static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;

        private ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }

        public static ValidationResult success() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult error(String message) {
            return new ValidationResult(false, message);
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }

    @GetMapping("/fetch-all-designs")
    public ResponseEntity<List<Design>> getAllDesigns(){
        List<Design> designList= designService.getAllDesigns();
        return ResponseEntity.ok(designList);
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Design> updateDesignStatus(@RequestParam("id") Long id,
                                                     @RequestParam("status") String status){

        // Validate status
        if (!status.equalsIgnoreCase("approved")
                && !status.equalsIgnoreCase("pending")
                && !status.equalsIgnoreCase("rejected")) {
            return ResponseEntity.badRequest().build();
        }

        try{
            Design updateDesign= designService.updateDesignStatus(id, Status.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(updateDesign);
        }catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

    }
}
