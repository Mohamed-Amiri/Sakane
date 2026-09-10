package org.example.locaspace.controller;

import jakarta.validation.Valid;
import org.example.locaspace.dto.auth.JwtResponse;
import org.example.locaspace.dto.auth.LoginRequest;
import org.example.locaspace.dto.auth.RegisterRequest;
import org.example.locaspace.exception.BadRequestException;
import org.example.locaspace.model.User;
import org.example.locaspace.model.enums.Role;
import org.example.locaspace.repository.UserRepository;
import org.example.locaspace.security.JwtUtils;
import org.example.locaspace.security.UserDetailsServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsServiceImpl.UserPrincipal userDetails =
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());

        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new BadRequestException("User not found"));

        String roleName = user.getRole() != null ? user.getRole().name() : Role.LOCATAIRE.name();

        JwtResponse response = new JwtResponse(
            jwt,
            userDetails.getId(),
            userDetails.getUsername(),
            user.getNom(),
            roles
        );
        response.setFrontendRole(roleName);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {

        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        Role backendRole = parseRole(signUpRequest.getRole());

        User user = User.builder()
            .nom(signUpRequest.getNom())
            .email(signUpRequest.getEmail())
            .motDePasse(encoder.encode(signUpRequest.getPassword()))
            .role(backendRole)
            .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    private Role parseRole(String role) {
        if (role == null) {
            return Role.LOCATAIRE;
        }

        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Role.LOCATAIRE;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser() {
        return ResponseEntity.ok("User logged out successfully!");
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (jwtUtils.validateJwtToken(token)) {
                String email = jwtUtils.getUserNameFromJwtToken(token);
                User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadRequestException("User not found"));

                List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = List.of(
                    new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                );

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, authorities);

                String newJwt = jwtUtils.generateJwtToken(authentication);

                return ResponseEntity.ok(new JwtRefreshResponse(newJwt));
            }

            return ResponseEntity.badRequest().body("Token is invalid");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Token refresh failed");
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (jwtUtils.validateJwtToken(token)) {
                return ResponseEntity.ok("Token is valid");
            }

            return ResponseEntity.badRequest().body("Token is invalid");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Token validation failed");
        }
    }

    public static class JwtRefreshResponse {
        private String accessToken;
        private String tokenType = "Bearer";

        public JwtRefreshResponse(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getTokenType() {
            return tokenType;
        }

        public void setTokenType(String tokenType) {
            this.tokenType = tokenType;
        }
    }
}
