package org.example.locaspace.dto.lieu;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public class LieuRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String titre;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 1000, message = "Description must be between 20 and 1000 characters")
    private String description;

    @NotBlank(message = "Type is required")
    @Pattern(
        regexp = "(?i)^(appartement|maison|villa|studio|loft|chambre|apartment|office|event_space|event-space|event space|house|room|chalet|bureau)$",
        message = "Type must be one of: Appartement, Maison, Villa, Studio, Loft, Chambre"
    )
    private String type;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "10.0", message = "Price must be at least 10 EUR")
    @DecimalMax(value = "10000.0", message = "Price cannot exceed 10000 EUR")
    private BigDecimal prix;

    @NotBlank(message = "Address is required")
    @Size(min = 10, max = 200, message = "Address must be between 10 and 200 characters")
    private String adresse;

    @Size(max = 10, message = "Maximum 10 photos allowed")
    private List<String> photos;

    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private List<String> amenities;
    private String city;
    private String neighborhood;
    private Boolean valide;
    private Boolean active;
    private Double latitude;
    private Double longitude;
    private String houseRules;
    private String checkInTime;
    private String checkOutTime;
    private Integer minimumNights;

    public LieuRequest() {
    }

    public LieuRequest(String titre, String description, String type, BigDecimal prix, String adresse, List<String> photos) {
        this.titre = titre;
        this.description = description;
        this.type = type;
        this.prix = prix;
        this.adresse = adresse;
        this.photos = photos;
    }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getPrix() { return prix; }
    public void setPrix(BigDecimal prix) { this.prix = prix; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }
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
    public Boolean getValide() { return valide; }
    public void setValide(Boolean valide) { this.valide = valide; }
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
