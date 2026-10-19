package org.example.locaspace.model;

import jakarta.persistence.*;
import lombok.*;
import org.example.locaspace.model.enums.LieuType;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Entity @Table(name = "lieux")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SQLDelete(sql = "UPDATE lieux SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
public class Lieu {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    @Column(length = 1000)
    private String description;
    @Enumerated(EnumType.STRING)
    private LieuType type;
    private BigDecimal prix;
    private String adresse;
    private boolean valide;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private String city;
    private String neighborhood;

    @Builder.Default
    private Boolean active = true;

    private Double latitude;
    private Double longitude;

    @Column(length = 1000)
    private String houseRules;
    private String checkInTime;
    private String checkOutTime;
    private Integer minimumNights;

    @Builder.Default
    private boolean deleted = false;

    @OneToMany(mappedBy = "lieu", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    private List<LieuPhoto> photos = new ArrayList<>();

    @OneToMany(mappedBy = "lieu", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    private List<LieuAmenity> amenities = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;


    @OneToMany(mappedBy = "lieu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reservation> reservations;


    @OneToMany(mappedBy = "lieu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Avis> avis;

    /**
     * The photo URLs in display order. Kept as the public representation of the
     * owned {@link LieuPhoto} children so the REST API remains an array of strings.
     */
    public List<String> getPhotoUrls() {
        if (photos == null) {
            return new ArrayList<>();
        }
        return photos.stream().map(LieuPhoto::getUrl).collect(Collectors.toList());
    }

    /** Replaces all photo children, preserving order and renumbering positions sequentially. */
    public void replacePhotos(List<String> urls) {
        if (photos == null) {
            photos = new ArrayList<>();
        }
        photos.clear();
        if (urls == null) {
            return;
        }
        int position = 0;
        for (String url : urls) {
            if (url == null || url.isBlank()) {
                continue;
            }
            LieuPhoto photo = new LieuPhoto(url, position++);
            photo.setLieu(this);
            photos.add(photo);
        }
    }

    /**
     * Reorders existing photos according to {@code orderedUrls}. Only known URLs are
     * honoured; any photo that is omitted by the client is appended at the end so no
     * existing value is silently discarded, and positions are renumbered sequentially.
     */
    public void reorderPhotos(List<String> orderedUrls) {
        List<String> existing = getPhotoUrls();
        LinkedHashSet<String> ordered = new LinkedHashSet<>();
        if (orderedUrls != null) {
            for (String url : orderedUrls) {
                if (url != null && existing.contains(url)) {
                    ordered.add(url);
                }
            }
        }
        ordered.addAll(existing);
        replacePhotos(new ArrayList<>(ordered));
    }

    /** The amenity names in display order. */
    public List<String> getAmenityNames() {
        if (amenities == null) {
            return new ArrayList<>();
        }
        return amenities.stream().map(LieuAmenity::getName).collect(Collectors.toList());
    }

    /** Replaces all amenity children, preserving order and renumbering positions sequentially. */
    public void replaceAmenities(List<String> names) {
        if (amenities == null) {
            amenities = new ArrayList<>();
        }
        amenities.clear();
        if (names == null) {
            return;
        }
        int position = 0;
        for (String name : names) {
            if (name == null || name.isBlank()) {
                continue;
            }
            LieuAmenity amenity = new LieuAmenity(name, position++);
            amenity.setLieu(this);
            amenities.add(amenity);
        }
    }
}
