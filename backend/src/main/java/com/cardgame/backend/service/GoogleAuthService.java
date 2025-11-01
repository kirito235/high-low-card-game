package com.cardgame.backend.service;

import com.cardgame.backend.config.GoogleProperties;
import com.cardgame.backend.entity.LoginType;
import com.cardgame.backend.entity.User;
import com.cardgame.backend.exception.GoogleAuthenticationException;
import com.cardgame.backend.exception.UserException;
import com.cardgame.backend.repo.UserRepository;
import com.cardgame.backend.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final GoogleProperties properties;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

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
            log.info("Extracted user info, username: {}, email: {}",name,email);
            if (!userRepository.existsByEmail(email)) {
                log.info("Registering new user: {}",email);
                User user = new User();
                user.setUsername(name);
                user.setEmail(email);
                user.setLoginType(LoginType.GOOGLE);
                userRepository.save(user);
            }

            return   jwtUtil.generateToken(email,name);
        } catch (Exception e) {
            throw new GoogleAuthenticationException("Google authentication failed", e);
        }
    }
}
