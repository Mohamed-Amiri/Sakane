package org.example.locaspace.service;

import org.example.locaspace.model.Avis;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.User;
import org.example.locaspace.repository.AvisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AvisService {

    private final AvisRepository avisRepository;

    @Autowired
    public AvisService(AvisRepository avisRepository) {
        this.avisRepository = avisRepository;
    }

    // Create a new review
    public Avis createAvis(Avis avis) {
        return avisRepository.save(avis);
    }

    // Get review by ID
    public Optional<Avis> getAvisById(Long id) {
        return avisRepository.findById(id);
    }

    // Get all reviews for a place
    public List<Avis> getAvisForLieu(Lieu lieu) {
        return avisRepository.findByLieuOrderByIdDesc(lieu);
    }

    // Get all reviews by a user
    public List<Avis> getAvisByUser(User user) {
        return avisRepository.findByAuteur(user);
    }

    // Update a review
    public Avis updateAvis(Avis avis) {
        return avisRepository.save(avis);
    }

    // Delete a review
    public void deleteAvis(Long id) {
        avisRepository.deleteById(id);
    }

    // Check if user has already reviewed a place
    public boolean hasUserReviewedPlace(User user, Lieu lieu) {
        return avisRepository.findByAuteurAndLieu(user, lieu).isPresent();
    }

    // Get average rating for a place
    public Double getAverageRatingForLieu(Lieu lieu) {
        return avisRepository.findAverageNoteByLieu(lieu);
    }

    // Get review count for a place
    public Long getReviewCountForLieu(Lieu lieu) {
        return avisRepository.countByLieu(lieu);
    }

    // Get reviews with minimum rating
    public List<Avis> getAvisWithMinimumRating(int minRating) {
        return avisRepository.findByNoteGreaterThanEqual(minRating);
    }

    // Get reviews for places owned by a user
    public List<Avis> getAvisForOwnerPlaces(User owner) {
        return avisRepository.findByLieuOwner(owner);
    }

    // Get user's review count
    public Long getUserReviewCount(User user) {
        return avisRepository.countByAuteur(user);
    }
}