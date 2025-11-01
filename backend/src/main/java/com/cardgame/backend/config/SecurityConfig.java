package com.cardgame.backend.config;

import com.cardgame.backend.entity.LoginType;
import com.cardgame.backend.filter.JwtAuthFilter;
import com.cardgame.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private static final String[] baseGameAllowedUrls= {"/api/game/auth/google","/api/game/health","/api/game/auth/login","/api/game/auth/signup"};
    private final GoogleProperties googleProperties;

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository,PasswordEncoder passwordEncoder) {
        return username -> userRepository.findByEmail(username)
                .map(user -> User
                        .withUsername(user.getEmail())
                        .password(LoginType.LOCAL.equals(user.getLoginType()) ? user.getPassword() : passwordEncoder.encode(googleProperties.getDummyPassword()) )
                        .authorities("USER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                .cors(cors -> cors.configure(http))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(baseGameAllowedUrls).permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
