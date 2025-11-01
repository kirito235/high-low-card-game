package com.cardgame.backend.controller;

import com.cardgame.backend.dto.JwtResponse;
import com.cardgame.backend.dto.LoginRequest;
import com.cardgame.backend.service.AuthService;
import com.cardgame.backend.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/game/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GoogleAuthService googleAuthService;
    private final AuthService authService;

    @PostMapping("/google")
    public Map<String, String> googleLogin(@RequestBody Map<String, String> request) {
        String idToken = request.get("token");
        String jwt = googleAuthService.verifyGoogleTokenAndCreateJwt(idToken);
        return Map.of("jwt", jwt);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
