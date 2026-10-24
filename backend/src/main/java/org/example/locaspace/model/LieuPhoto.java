package org.example.locaspace.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "lieu_photos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LieuPhoto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lieu_id", nullable = false)
    private Lieu lieu;

    @Column(name = "photo_url", nullable = false)
    private String url;

    @Column(nullable = false)
    private int position;

    public LieuPhoto(String url, int position) {
        this.url = url;
        this.position = position;
    }
}