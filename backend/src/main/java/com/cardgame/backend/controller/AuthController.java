package com.cardgame.backend.controller;

import com.cardgame.backend.dto.JwtResponse;
import com.cardgame.backend.dto.LoginRequest;
import com.cardgame.backend.dto.SignupRequest;
import com.cardgame.backend.exception.GoogleAuthenticationException;
import com.cardgame.backend.service.AuthService;
import com.cardgame.backend.service.GoogleAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/game/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GoogleAuthService googleAuthService;
    private final AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<JwtResponse> googleLogin(@RequestBody Map<String, String> request) {
        var token = request.get("token");
        if (Objects.isNull(token)){
            throw new GoogleAuthenticationException("token required to generate jwt");
        }
        String jwt = googleAuthService.verifyGoogleTokenAndCreateJwt(token);
        return ResponseEntity.ok(new JwtResponse(jwt));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<JwtResponse> signup(@Valid @RequestBody SignupRequest request) {
        JwtResponse response = authService.signup(request);
        return ResponseEntity.ok(response);
    }
}
