package org.example.locaspace.controller;

import org.example.locaspace.dto.lieu.LieuResponse;
import org.example.locaspace.mapper.EntityMapper;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.User;
import org.example.locaspace.security.UserDetailsServiceImpl;
import org.example.locaspace.service.FavoriteService;
import org.example.locaspace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
@PreAuthorize("isAuthenticated()")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private UserService userService;

    @Autowired
    private EntityMapper entityMapper;

    @GetMapping
    public ResponseEntity<List<LieuResponse>> getFavorites(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        List<Lieu> favorites = favoriteService.getFavoritesByUser(currentUser);
        List<LieuResponse> responses = favorites.stream()
                .map(entityMapper::toLieuResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        List<Long> ids = favoriteService.getFavoriteIdsByUser(currentUser);
        return ResponseEntity.ok(ids);
    }

    @PostMapping("/{lieuId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long lieuId, Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        favoriteService.addFavorite(currentUser, lieuId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{lieuId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long lieuId, Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        favoriteService.removeFavorite(currentUser, lieuId);
        return ResponseEntity.noContent().build();
    }
}
