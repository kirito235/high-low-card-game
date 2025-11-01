package com.cardgame.backend.service;

import com.cardgame.backend.dto.JwtResponse;
import com.cardgame.backend.dto.SignupRequest;
import com.cardgame.backend.entity.User;
import com.cardgame.backend.exception.GoogleAuthenticationException;
import com.cardgame.backend.repo.UserRepository;
import com.cardgame.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtTokenUtil;

    public JwtResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new GoogleAuthenticationException("Email already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        String token = jwtTokenUtil.generateToken(user.getEmail());
        return new JwtResponse(token);
    }
}
