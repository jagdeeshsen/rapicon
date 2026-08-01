package com.example.rapicon.DTO;

import com.example.rapicon.Enum.Status;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class DesignStatusUpdateRequest {

    private Status status;

    @NotBlank
    private String reason;
}
