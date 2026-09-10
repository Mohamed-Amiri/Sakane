package org.example.locaspace.controller;

import org.example.locaspace.dto.reservation.ReservationResponse;
import org.example.locaspace.dto.user.UserResponse;
import org.example.locaspace.mapper.EntityMapper;
import org.example.locaspace.model.Reservation;
import org.example.locaspace.model.User;
import org.example.locaspace.security.UserDetailsServiceImpl;
import org.example.locaspace.service.ReservationService;
import org.example.locaspace.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final ReservationService reservationService;
    private final EntityMapper entityMapper;

    public UserController(UserService userService,
                          ReservationService reservationService,
                          EntityMapper entityMapper) {
        this.userService = userService;
        this.reservationService = reservationService;
        this.entityMapper = entityMapper;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(entityMapper.toUserResponse(user));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody User updatedUser, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        // Prevent privilege escalation in self-service profile updates.
        updatedUser.setRole(null);

        User user = userService.updateUser(currentUser.getId(), updatedUser);
        return ResponseEntity.ok(entityMapper.toUserResponse(user));
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteProfile(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        userService.deleteUser(currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/reservations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        List<Reservation> reservations = reservationService.getReservationsByTenant(currentUser);
        List<ReservationResponse> responses = reservations.stream()
            .map(entityMapper::toReservationResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal principal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        return userService.getUserById(principal.getId());
    }
}
