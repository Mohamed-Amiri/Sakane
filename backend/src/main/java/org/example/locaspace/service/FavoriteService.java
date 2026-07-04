package org.example.locaspace.service;

import org.example.locaspace.model.Favorite;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.User;
import org.example.locaspace.repository.FavoriteRepository;
import org.example.locaspace.repository.LieuRepository;
import org.example.locaspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private LieuRepository lieuRepository;

    public List<Lieu> getFavoritesByUser(User user) {
        return favoriteRepository.findByUser(user).stream()
                .map(Favorite::getLieu)
                .collect(Collectors.toList());
    }

    public List<Long> getFavoriteIdsByUser(User user) {
        return favoriteRepository.findByUser(user).stream()
                .map(f -> f.getLieu().getId())
                .collect(Collectors.toList());
    }

    public void addFavorite(User user, Long lieuId) {
        Lieu lieu = lieuRepository.findById(lieuId).orElseThrow(() -> new IllegalArgumentException("Lieu non trouvé"));
        if (!favoriteRepository.existsByUserAndLieu(user, lieu)) {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .lieu(lieu)
                    .build();
            favoriteRepository.save(favorite);
        }
    }

    public void removeFavorite(User user, Long lieuId) {
        Lieu lieu = lieuRepository.findById(lieuId).orElseThrow(() -> new IllegalArgumentException("Lieu non trouvé"));
        favoriteRepository.deleteByUserAndLieu(user, lieu);
    }
}
