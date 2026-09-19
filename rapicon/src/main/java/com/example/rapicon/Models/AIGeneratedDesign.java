package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Data
@Table(name = "AIDesigns")
@RequiredArgsConstructor
@AllArgsConstructor
public class AIGeneratedDesign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = false)
    private String sessionId;

    @Column(nullable = false)
    private List<String> fileUrls;


    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;

}
