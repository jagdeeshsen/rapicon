package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class Floor {

    private Long id;
    private String name;
    private String type;
    private String bedrooms;
    private String bathrooms;
    private String kitchen;
    private String hall;
    private String other;
    private String businessUnits;
    private String unitDetails;
}
