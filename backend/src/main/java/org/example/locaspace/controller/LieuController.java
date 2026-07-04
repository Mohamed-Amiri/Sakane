package org.example.locaspace.controller;

import jakarta.validation.Valid;
import org.example.locaspace.dto.lieu.CalendarBlockRequest;
import org.example.locaspace.dto.lieu.LieuRequest;
import org.example.locaspace.dto.lieu.LieuResponse;
import org.example.locaspace.dto.lieu.AvailabilityResponse;
import org.example.locaspace.exception.BadRequestException;
import org.example.locaspace.exception.ResourceNotFoundException;
import org.example.locaspace.exception.UnauthorizedException;
import org.example.locaspace.mapper.EntityMapper;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.User;
import org.example.locaspace.model.enums.LieuType;
import org.example.locaspace.security.UserDetailsServiceImpl;
import org.example.locaspace.service.LieuService;
import org.example.locaspace.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lieux")
public class LieuController {

    private final LieuService lieuService;
    private final UserService userService;
    private final EntityMapper entityMapper;
    private final org.example.locaspace.service.PhotoStorageService photoStorageService;
    private final org.example.locaspace.service.CalendarService calendarService;

    public LieuController(LieuService lieuService,
                          UserService userService,
                          EntityMapper entityMapper,
                          org.example.locaspace.service.PhotoStorageService photoStorageService,
                          org.example.locaspace.service.CalendarService calendarService) {
        this.lieuService = lieuService;
        this.userService = userService;
        this.entityMapper = entityMapper;
        this.photoStorageService = photoStorageService;
        this.calendarService = calendarService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<LieuResponse> addLieu(@Valid @RequestBody LieuRequest lieuRequest,
                                                Authentication authentication) {

        UserDetailsServiceImpl.UserPrincipal userPrincipal =
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        Lieu lieu = Lieu.builder()
            .titre(lieuRequest.getTitre())
            .description(lieuRequest.getDescription())
            .type(parseLieuType(lieuRequest.getType()))
            .prix(lieuRequest.getPrix())
            .adresse(lieuRequest.getAdresse())
            .photos(lieuRequest.getPhotos())
            .owner(currentUser)
            .valide(true)
            .build();

        Lieu savedLieu = lieuService.createLieu(lieu);
        LieuResponse response = entityMapper.toLieuResponse(savedLieu);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<LieuResponse>> listLieux(@PageableDefault(size = 12) Pageable pageable) {
        Page<Lieu> lieux = lieuService.getAllValidatedLieux(pageable);
        Page<LieuResponse> responses = lieux.map(entityMapper::toLieuResponse);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/properties/{id}/calendar")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<List<org.example.locaspace.model.CalendarEvent>> getCalendar(
            @PathVariable Long id,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate) {
        java.time.LocalDate start = java.time.LocalDate.parse(startDate.substring(0, 10));
        java.time.LocalDate end = java.time.LocalDate.parse(endDate.substring(0, 10));
        return ResponseEntity.ok(calendarService.getEvents(id, start, end));
    }

    @PostMapping("/properties/{id}/calendar/block")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<org.example.locaspace.model.CalendarEvent> blockDates(
            @PathVariable Long id,
            @Valid @RequestBody CalendarBlockRequest request) {
        return ResponseEntity.ok(calendarService.blockDates(id, request.getStartDate(), request.getEndDate(), request.getTitle()));
    }

    @DeleteMapping("/calendar/events/{eventId}")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        calendarService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/photos")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<List<String>> uploadPhotos(@PathVariable Long id,
                                                     @RequestParam("photos") List<MultipartFile> photos,
                                                     Authentication authentication) throws java.io.IOException {

        UserDetailsServiceImpl.UserPrincipal userPrincipal =
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        Lieu lieu = lieuService.getLieuById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lieu", "id", id));
        if (!lieu.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You don't have permission to upload photos for this lieu");
        }

        List<String> urls = photoStorageService.storePropertyPhotos(id, photos);
        List<String> merged = new java.util.ArrayList<>();
        if (lieu.getPhotos() != null) {
            merged.addAll(lieu.getPhotos());
        }
        merged.addAll(urls);
        lieu.setPhotos(merged);
        lieuService.createLieu(lieu);

        return ResponseEntity.ok(urls);
    }

    @DeleteMapping("/{id}/photos")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long id,
                                            @RequestParam("url") String url,
                                            Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal =
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        Lieu lieu = lieuService.getLieuById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lieu", "id", id));
        if (!lieu.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You don't have permission to delete photos for this lieu");
        }

        if (lieu.getPhotos() != null) {
            java.util.List<String> updated = new java.util.ArrayList<>(lieu.getPhotos());
            updated.remove(url);
            lieu.setPhotos(updated);
            lieuService.createLieu(lieu);
        }
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/photos/order")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<Void> reorderPhotos(@PathVariable Long id,
                                              @RequestBody java.util.List<String> orderedUrls,
                                              Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal =
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        Lieu lieu = lieuService.getLieuById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lieu", "id", id));
        if (!lieu.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You don't have permission to reorder photos for this lieu");
        }

        lieu.setPhotos(orderedUrls);
        lieuService.createLieu(lieu);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LieuResponse> getLieu(@PathVariable Long id) {
        Lieu lieu = lieuService.getLieuById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lieu", "id", id));

        LieuResponse response = entityMapper.toLieuResponse(lieu);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<AvailabilityResponse> getAvailability(
            @PathVariable Long id,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate) {
        java.time.LocalDate start = java.time.LocalDate.parse(startDate.substring(0, 10));
        java.time.LocalDate end = java.time.LocalDate.parse(endDate.substring(0, 10));
        return ResponseEntity.ok(lieuService.getAvailability(id, start, end));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<LieuResponse> updateLieu(@PathVariable Long id,
                                                   @Valid @RequestBody LieuRequest lieuRequest,
                                                   Authentication authentication) {

        UserDetailsServiceImpl.UserPrincipal userPrincipal =
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        Lieu updatedLieu = Lieu.builder()
            .titre(lieuRequest.getTitre())
            .description(lieuRequest.getDescription())
            .type(parseLieuType(lieuRequest.getType()))
            .prix(lieuRequest.getPrix())
            .adresse(lieuRequest.getAdresse())
            .photos(lieuRequest.getPhotos())
            .build();

        Lieu savedLieu = lieuService.updateLieu(id, updatedLieu, currentUser);
        if (savedLieu == null) {
            throw new UnauthorizedException("You don't have permission to update this lieu");
        }

        LieuResponse response = entityMapper.toLieuResponse(savedLieu);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<Void> deleteLieu(@PathVariable Long id, Authentication authentication) {

        UserDetailsServiceImpl.UserPrincipal userPrincipal =
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        boolean deleted = lieuService.deleteLieu(id, currentUser);
        if (!deleted) {
            throw new UnauthorizedException("You don't have permission to delete this lieu");
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<LieuResponse>> searchLieux(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String city,
            @PageableDefault(size = 12) Pageable pageable) {

        Page<Lieu> lieux;
        LieuType lieuType = type != null && !type.isBlank() ? parseLieuType(type) : null;

        if (keyword != null && !keyword.trim().isEmpty()) {
            lieux = lieuService.searchLieux(keyword, pageable);
        } else if (type != null || minPrice != null || maxPrice != null || city != null) {
            lieux = lieuService.searchLieuxWithFilters(lieuType, minPrice, maxPrice, city, pageable);
        } else {
            lieux = lieuService.getAllValidatedLieux(pageable);
        }

        Page<LieuResponse> responses = lieux.map(entityMapper::toLieuResponse);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Page<LieuResponse>> getLieuxByType(@PathVariable String type,
                                                             @PageableDefault(size = 12) Pageable pageable) {
        LieuType lieuType = parseLieuType(type);
        Page<Lieu> lieux = lieuService.getLieuxByType(lieuType, pageable);
        Page<LieuResponse> responses = lieux.map(entityMapper::toLieuResponse);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<Page<LieuResponse>> getLieuxByCity(@PathVariable String city,
                                                             @PageableDefault(size = 12) Pageable pageable) {
        Page<Lieu> lieux = lieuService.getLieuxByCity(city, pageable);
        Page<LieuResponse> responses = lieux.map(entityMapper::toLieuResponse);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/price")
    public ResponseEntity<Page<LieuResponse>> getLieuxByPriceRange(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max,
            @PageableDefault(size = 12) Pageable pageable) {

        Page<Lieu> lieux = lieuService.getLieuxByPriceRange(min, max, pageable);
        Page<LieuResponse> responses = lieux.map(entityMapper::toLieuResponse);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PROPRIETAIRE')")
    public ResponseEntity<List<LieuResponse>> getMyLieux(Authentication authentication) {

        UserDetailsServiceImpl.UserPrincipal userPrincipal =
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        List<Lieu> lieux = lieuService.getLieuxByOwner(currentUser);
        List<LieuResponse> responses = lieux.stream()
            .map(entityMapper::toLieuResponse)
            .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    private LieuType parseLieuType(String rawType) {
        if (rawType == null || rawType.isBlank()) {
            throw new BadRequestException("Type is required");
        }

        String normalized = rawType.trim().toUpperCase()
            .replace('-', '_')
            .replace(' ', '_');

        switch (normalized) {
            case "APPARTEMENT":
            case "APARTMENT":
                return LieuType.APPARTEMENT;
            case "MAISON":
            case "HOUSE":
                return LieuType.MAISON;
            case "VILLA":
                return LieuType.VILLA;
            case "STUDIO":
                return LieuType.STUDIO;
            case "LOFT":
                return LieuType.LOFT;
            case "CHAMBRE":
            case "ROOM":
            case "CHALET":
                return LieuType.CHAMBRE;
            case "OFFICE":
            case "BUREAU":
                return LieuType.OFFICE;
            case "EVENT_SPACE":
            case "EVENTSPACE":
            case "SALLE_EVENEMENT":
            case "EVENEMENT":
                return LieuType.EVENT_SPACE;
            default:
                throw new BadRequestException("Invalid lieu type: " + rawType);
        }
    }
}
