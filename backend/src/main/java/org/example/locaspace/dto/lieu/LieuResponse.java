package org.example.locaspace.dto.lieu;

import org.example.locaspace.dto.user.UserSummaryResponse;

import java.math.BigDecimal;
import java.util.List;

public class LieuResponse {
    private Long id;
    private String titre;
    private String description;
    private String type;
    private BigDecimal prix;
    private String adresse;
    private boolean valide;
    private List<String> photos;
    private UserSummaryResponse owner;
    private Double averageRating;
    private Long reviewCount;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private List<String> amenities;
    private String city;
    private String neighborhood;
    private Boolean active;
    private Double latitude;
    private Double longitude;
    private String houseRules;
    private String checkInTime;
    private String checkOutTime;
    private Integer minimumNights;
    
    // Constructors
    public LieuResponse() {}
    
    public LieuResponse(Long id, String titre, String description, String type, BigDecimal prix, 
                       String adresse, boolean valide, List<String> photos, UserSummaryResponse owner,
                       Double averageRating, Long reviewCount) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.type = type;
        this.prix = prix;
        this.adresse = adresse;
        this.valide = valide;
        this.photos = photos;
        this.owner = owner;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public LieuResponse(Long id, String titre, String description, String type, BigDecimal prix,
                       String adresse, boolean valide, List<String> photos, UserSummaryResponse owner,
                       Double averageRating, Long reviewCount, Integer maxGuests, Integer bedrooms,
                       Integer bathrooms, List<String> amenities, String city, String neighborhood,
                       Boolean active, Double latitude, Double longitude, String houseRules,
                       String checkInTime, String checkOutTime, Integer minimumNights) {
        this(id, titre, description, type, prix, adresse, valide, photos, owner, averageRating, reviewCount);
        this.maxGuests = maxGuests;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.amenities = amenities;
        this.city = city;
        this.neighborhood = neighborhood;
        this.active = active;
        this.latitude = latitude;
        this.longitude = longitude;
        this.houseRules = houseRules;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.minimumNights = minimumNights;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitre() {
        return titre;
    }
    
    public void setTitre(String titre) {
        this.titre = titre;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public BigDecimal getPrix() {
        return prix;
    }
    
    public void setPrix(BigDecimal prix) {
        this.prix = prix;
    }
    
    public String getAdresse() {
        return adresse;
    }
    
    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }
    
    public boolean isValide() {
        return valide;
    }
    
    public void setValide(boolean valide) {
        this.valide = valide;
    }
    
    public List<String> getPhotos() {
        return photos;
    }
    
    public void setPhotos(List<String> photos) {
        this.photos = photos;
    }
    
    public UserSummaryResponse getOwner() {
        return owner;
    }
    
    public void setOwner(UserSummaryResponse owner) {
        this.owner = owner;
    }
    
    public Double getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
    
    public Long getReviewCount() {
        return reviewCount;
    }
    
    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Integer getMaxGuests() { return maxGuests; }
    public void setMaxGuests(Integer maxGuests) { this.maxGuests = maxGuests; }
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getNeighborhood() { return neighborhood; }
    public void setNeighborhood(String neighborhood) { this.neighborhood = neighborhood; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getHouseRules() { return houseRules; }
    public void setHouseRules(String houseRules) { this.houseRules = houseRules; }
    public String getCheckInTime() { return checkInTime; }
    public void setCheckInTime(String checkInTime) { this.checkInTime = checkInTime; }
    public String getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(String checkOutTime) { this.checkOutTime = checkOutTime; }
    public Integer getMinimumNights() { return minimumNights; }
    public void setMinimumNights(Integer minimumNights) { this.minimumNights = minimumNights; }
}
