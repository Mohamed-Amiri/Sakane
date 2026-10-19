package org.example.locaspace.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "lieu_amenities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LieuAmenity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lieu_id", nullable = false)
    private Lieu lieu;

    @Column(name = "amenity", nullable = false)
    private String name;

    @Column(nullable = false)
    private int position;

    public LieuAmenity(String name, int position) {
        this.name = name;
        this.position = position;
    }
}