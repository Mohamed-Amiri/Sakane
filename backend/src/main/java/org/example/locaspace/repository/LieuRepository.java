package org.example.locaspace.repository;

import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.User;
import org.example.locaspace.model.enums.LieuType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LieuRepository extends JpaRepository<Lieu, Long>, JpaSpecificationExecutor<Lieu> {
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Lieu> findByValideTrue(Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    List<Lieu> findByOwner(User owner);
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Lieu> findByType(LieuType type, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    @Query("SELECT l FROM Lieu l WHERE l.valide = true AND l.prix BETWEEN :minPrix AND :maxPrix")
    Page<Lieu> findByPrixBetween(@Param("minPrix") BigDecimal minPrix, @Param("maxPrix") BigDecimal maxPrix, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    @Query("SELECT l FROM Lieu l WHERE l.valide = true AND LOWER(l.adresse) LIKE LOWER(CONCAT('%', :ville, '%'))")
    Page<Lieu> findByAdresseContainingIgnoreCase(@Param("ville") String ville, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    @Query("SELECT l FROM Lieu l WHERE l.valide = true AND " +
           "(LOWER(l.titre) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(l.adresse) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Lieu> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    @Override
    Page<Lieu> findAll(org.springframework.data.jpa.domain.Specification<Lieu> spec, Pageable pageable);
    
    @Query("SELECT l FROM Lieu l WHERE l.valide = true AND l.type = :type AND l.prix BETWEEN :minPrix AND :maxPrix")
    Page<Lieu> findByTypeAndPrixBetween(@Param("type") LieuType type, 
                                       @Param("minPrix") BigDecimal minPrix, 
                                       @Param("maxPrix") BigDecimal maxPrix,
                                       Pageable pageable);
    
    @Query("SELECT COUNT(l) FROM Lieu l WHERE l.owner = :owner")
    Long countByOwner(@Param("owner") User owner);
}
