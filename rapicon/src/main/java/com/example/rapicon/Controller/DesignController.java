package com.example.rapicon.Controller;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Models.User;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.DesignService;
import com.example.rapicon.Service.S3Service;
import com.example.rapicon.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.security.PublicKey;
import java.util.*;

@RestController
@RequestMapping("/api/designs")
@CrossOrigin(origins = "*")
public class DesignController {

    @Autowired
    private UserService userService;

    @Autowired
    private DesignService designService;


    @Autowired
    private S3Service s3Service;

    // List of allowed file extensions
    private final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".pdf", ".dwg", ".jpg", ".jpeg", ".png", ".zip"
    );



    // --------------------------------- VENDOR END POINTS------------------------------------//

    @PostMapping("/upload")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, Object>> createDesign( @RequestParam("title") String title,
                                                             @RequestParam("designType") String designType,
                                                             @RequestParam("price") BigDecimal price,
                                                             @RequestParam("bedrooms") Integer bedrooms,
                                                             @RequestParam("bathrooms") Integer bathrooms,
                                                             @RequestParam("floors") Integer floors,
                                                             @RequestParam("area") Double area,
                                                             @RequestParam("description") String description,
                                                             @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
                                                            @AuthenticationPrincipal UserDetailsImpl userDetails)
    {
        Map<String, Object> response = new HashMap<>();

        try {
            User vendor= userService.findByUserName(userDetails.getUsername());
            if(vendor==null){
                System.out.println("vendor not found");
            }


            // Validate file
            if (imageFile==null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No file uploaded"));
            }

            // Check file size (50MB limit)
            if (imageFile.getSize() > 50 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size exceeds 50MB limit"));
            }

            // Check file extension
            String originalFileName = imageFile.getOriginalFilename();
            if (originalFileName == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid file name"));
            }

            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
            if (!ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File type not allowed. Allowed types: " + ALLOWED_EXTENSIONS));
            }

            // Upload file to S3
            String imageUrl = s3Service.uploadFile(imageFile, "designs");

            // Format area
            String formattedArea = (area != null) ? area + " sq ft" : "Not specified";

            // Create Design object
            Design design = new Design();
            design.setTitle(title);
            design.setDescription(description);
            design.setPrice(price);
            design.setDesignType(Design.DesignType.valueOf(designType));
            design.setBedrooms(bedrooms);
            design.setBathrooms(bathrooms);
            design.setFloors(floors);
            design.setStatus(Status.PENDING);
            design.setArea(area);
            design.setVendor(vendor);
            design.setImageUrl(imageUrl);

            Design savedDesign= designService.createDesign(design);
            System.out.println("Design created: " + savedDesign);

            response.put("success", true);
            response.put("message", "Design uploaded successfully");
            response.put("design", savedDesign);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error uploading design: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error uploading design");
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> updateDesignByVendor(@RequestParam("id") Long id,
                                                  @RequestParam("title") String title,
                                                  @RequestParam("designType") String designType,
                                                  @RequestParam("price") BigDecimal price,
                                                  @RequestParam("bedrooms") Integer bedrooms,
                                                  @RequestParam("bathrooms") Integer bathrooms,
                                                  @RequestParam("floors") Integer floors,
                                                  @RequestParam("area") Double area,
                                                  @RequestParam("description") String description,
                                                  @RequestPart(value = "imageFile", required = false) MultipartFile file) throws IOException {
        try{
            Optional<Design> optionalDesign= designService.findDesignById(id);
            if(optionalDesign.isEmpty()){
                ResponseEntity.status(HttpStatus.NOT_FOUND).body("Design not found");
            }

            Design design= optionalDesign.get();

            // set the design
            design.setTitle(title);
            design.setDesignType(Design.DesignType.valueOf(designType));
            design.setPrice(price);
            design.setArea(area);
            design.setFloors(floors);
            design.setDescription(description);
            design.setBathrooms(bathrooms);
            design.setBedrooms(bedrooms);

            // Validate file
            if (file==null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No file uploaded"));
            }

            // Check file size (50MB limit)
            if (file.getSize() > 50 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size exceeds 50MB limit"));
            }

            String url= s3Service.uploadFile(file,"designs");
            design.setImageUrl(url);
            return ResponseEntity.ok(designService.updateDesign(design));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating design: "+ e.getMessage());
        }
    }



    @GetMapping("/fetch")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<Design>> getMyDesigns(@AuthenticationPrincipal UserDetailsImpl userDetails){

        try{
            User vendor= userService.findByUserName(userDetails.getUsername());
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

}
