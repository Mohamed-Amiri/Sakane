package org.example.locaspace.repository;

import org.example.locaspace.model.Avis;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {
    
    List<Avis> findByLieu(Lieu lieu);
    
    List<Avis> findByAuteur(User auteur);
    
    @Query("SELECT a FROM Avis a WHERE a.lieu = :lieu ORDER BY a.id DESC")
    List<Avis> findByLieuOrderByIdDesc(@Param("lieu") Lieu lieu);
    
    @Query("SELECT a FROM Avis a WHERE a.lieu.owner = :owner")
    List<Avis> findByLieuOwner(@Param("owner") User owner);

    /** Average note across all reviews for every lieu owned by :owner. */
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.lieu.owner = :owner")
    Double findAverageNoteByOwner(@Param("owner") User owner);
    
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.lieu = :lieu")
    Double findAverageNoteByLieu(@Param("lieu") Lieu lieu);
    
    @Query("SELECT COUNT(a) FROM Avis a WHERE a.lieu = :lieu")
    Long countByLieu(@Param("lieu") Lieu lieu);
    
    @Query("SELECT a FROM Avis a WHERE a.note >= :minNote")
    List<Avis> findByNoteGreaterThanEqual(@Param("minNote") int minNote);
    
    Optional<Avis> findByAuteurAndLieu(User auteur, Lieu lieu);
    
    @Query("SELECT a FROM Avis a WHERE a.lieu = :lieu AND a.note = :note")
    List<Avis> findByLieuAndNote(@Param("lieu") Lieu lieu, @Param("note") int note);
    
    @Query("SELECT COUNT(a) FROM Avis a WHERE a.auteur = :auteur")
    Long countByAuteur(@Param("auteur") User auteur);
}
