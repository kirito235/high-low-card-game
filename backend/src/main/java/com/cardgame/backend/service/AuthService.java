package com.cardgame.backend.service;

import com.cardgame.backend.dto.JwtResponse;
import com.cardgame.backend.dto.LoginRequest;
import com.cardgame.backend.dto.SignupRequest;
import com.cardgame.backend.entity.LoginType;
import com.cardgame.backend.entity.User;
import com.cardgame.backend.exception.UserException;
import com.cardgame.backend.repo.UserRepository;
import com.cardgame.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtTokenUtil;

    public JwtResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new UserException("Email already registered");
        }
        log.info("Generating token for user: {}",request.username());
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        var savedUser = userRepository.save(user);
        log.info("Saved user info with login type: {}",user.getLoginType());
        var token = getToken(savedUser.getEmail(),savedUser.getUsername());

        return new JwtResponse(token);
    }
    public JwtResponse login(LoginRequest request) {
        var user = userRepository.findByEmail(request.email())
                .orElse(null);

        if (user == null ||  !LoginType.LOCAL.equals(user.getLoginType()) || !passwordEncoder.matches(request.password(), user.getPassword()) ) {
            throw new UserException("Invalid credentials");
        }
        var token = getToken(user.getEmail(), user.getUsername());

        return new JwtResponse(token);
    }


    private String getToken(String email,String username) {
        var token = jwtTokenUtil.generateToken(email, username);
        log.info("token generated for user: {}",username);
        return token;
    }

}
