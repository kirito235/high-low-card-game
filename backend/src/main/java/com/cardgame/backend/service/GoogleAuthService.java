package com.cardgame.backend.service;

import com.cardgame.backend.config.GoogleProperties;
import com.cardgame.backend.exception.GoogleAuthenticationException;
import com.cardgame.backend.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final GoogleProperties properties;
    private final JwtUtil jwtUtil;

    public String verifyGoogleTokenAndCreateJwt(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(properties.getClientId()))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new GoogleAuthenticationException("Invalid ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            // Optional: save/find user in DB here
            var key = Keys.hmacShaKeyFor(properties.getClientSecret().getBytes(StandardCharsets.UTF_8));
            return   Jwts.builder()
                    .setSubject(email)
                    .claim("name", name)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            throw new GoogleAuthenticationException("Google authentication failed", e);
        }
    }
}
