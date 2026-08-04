package com.example.rapicon.DTO;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class DesignChangeRequest {

    @NotBlank
    private String reason;
}
