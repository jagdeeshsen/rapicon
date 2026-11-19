package com.example.rapicon.PromoCode.service;

import com.example.rapicon.CustomExceptions.AIPlanAlreadyExistsException;
import com.example.rapicon.CustomExceptions.ResourceNotFoundException;
import com.example.rapicon.PromoCode.dto.AiPlanRequest;
import com.example.rapicon.PromoCode.entity.AiPlans;
import com.example.rapicon.PromoCode.repository.AiPlanRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiPlanService {

    private final AiPlanRepo aiPlanRepo;

    public AiPlanService(AiPlanRepo aiPlanRepo) {
        this.aiPlanRepo = aiPlanRepo;
    }

    public String createAIPlan(AiPlanRequest request){
        try{
            boolean isPresent = aiPlanRepo.existsByName(request.getName());

            if(isPresent){
                throw new AIPlanAlreadyExistsException(request.getName()+" Plan already exists. Try with different name");
            }

            AiPlans plan = new AiPlans();

            plan.setName(request.getName());
            plan.setPrice(request.getPrice());
            plan.setDescription(request.getDescription());
            plan.setIncludes(request.getIncludes());

            aiPlanRepo.save(plan);
            return "AI Payment Plan created successfully.";
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }

    public AiPlans getByName(String name){
        return aiPlanRepo.findByName(name);
    }

    public AiPlans getById(Long id){
        return aiPlanRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI Plan not found with id: " + id));
    }

    public List<AiPlans> getAllPlans(){
        return aiPlanRepo.findAll();
    }

    public String deleteAIPlans(Long id){
        AiPlans plan = getById(id);
        aiPlanRepo.delete(plan);
        return "AI Plan deleted successfully";
    }
}
