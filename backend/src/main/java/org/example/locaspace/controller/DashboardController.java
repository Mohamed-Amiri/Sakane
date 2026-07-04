package org.example.locaspace.controller;

import org.example.locaspace.dto.dashboard.OwnerDashboardStats;
import org.example.locaspace.model.User;
import org.example.locaspace.security.UserDetailsServiceImpl;
import org.example.locaspace.service.DashboardService;
import org.example.locaspace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner/dashboard")
@PreAuthorize("hasRole('PROPRIETAIRE')")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<OwnerDashboardStats> getStats(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        User currentUser = userService.getUserById(userPrincipal.getId());

        OwnerDashboardStats stats = dashboardService.getOwnerDashboardStats(currentUser);
        return ResponseEntity.ok(stats);
    }
}
