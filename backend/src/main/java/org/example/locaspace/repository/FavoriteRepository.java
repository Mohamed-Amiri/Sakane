package org.example.locaspace.repository;

import org.example.locaspace.model.Favorite;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    
    Favorite findByUserAndLieu(User user, Lieu lieu);
    
    boolean existsByUserAndLieu(User user, Lieu lieu);
    
    void deleteByUserAndLieu(User user, Lieu lieu);
}
