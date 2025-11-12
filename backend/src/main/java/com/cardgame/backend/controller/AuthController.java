package com.cardgame.backend.controller;

import com.cardgame.backend.dto.*;
import com.cardgame.backend.model.AuthProvider;
import com.cardgame.backend.model.PasswordResetToken;
import com.cardgame.backend.model.User;
import com.cardgame.backend.repository.PasswordResetTokenRepository;
import com.cardgame.backend.repository.UserRepository;
import com.cardgame.backend.security.JwtUtils;
import com.cardgame.backend.security.UserDetailsImpl;
import com.cardgame.backend.service.EmailService;
import com.cardgame.backend.service.EmailService.*;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@CrossOrigin(
        origins = { "http://localhost:3000", "https://higherlowercardgame.onrender.com" },
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.isGuest()
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user account
        User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword())
        );

        user.setProvider(AuthProvider.LOCAL);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/guest")
    public ResponseEntity<?> loginAsGuest() {
        // Create a temporary guest user with UUID
        String guestUsername = "Guest_" + UUID.randomUUID().toString().substring(0, 8);
        String guestEmail = guestUsername + "@guest.temp";

        User guestUser = new User(guestUsername, guestEmail, null);
        guestUser.setGuest(true);
        guestUser.setProvider(AuthProvider.GUEST);
        userRepository.save(guestUser);

        // Generate JWT for guest
        String jwt = jwtUtils.generateTokenFromUsername(guestUsername);

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                guestUser.getId(),
                guestUser.getUsername(),
                guestUser.getEmail(),
                true
        ));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return ResponseEntity.ok(new JwtResponse(
                    null, // Don't send token again
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    userDetails.isGuest()
            ));
        }
        return ResponseEntity.status(401).body(new MessageResponse("Invalid or expired token"));
    }

    @Autowired
    private EmailService emailService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || user.isGuest()) {
            return ResponseEntity.ok(new MessageResponse(
                    "If that email exists, we've sent password reset instructions."));
        }

        String token = UUID.randomUUID().toString();

        passwordResetTokenRepository.findByUser(user).ifPresent(existingToken ->
                passwordResetTokenRepository.delete(existingToken)
        );

        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        passwordResetTokenRepository.save(resetToken);

        // ✅ SEND EMAIL
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return ResponseEntity.ok(new MessageResponse(
                "If that email exists, we've sent password reset instructions."));
    }

    // ✅ NEW: Reset Password
    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElse(null);

        if (resetToken == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid reset token!"));
        }

        if (resetToken.isExpired()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Reset token has expired!"));
        }

        if (resetToken.isUsed()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Reset token has already been used!"));
        }

        // Update password
        User user = resetToken.getUser();
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
    }


}