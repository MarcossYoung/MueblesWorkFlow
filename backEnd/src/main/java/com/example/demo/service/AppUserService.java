package com.example.demo.service;

import com.example.demo.exceptions.UserAlreadyExistsException;
import com.example.demo.model.AppUser;
import com.example.demo.model.AppUserRole;
import com.example.demo.repository.UserRepo;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.*;


@Service
public class AppUserService {
    Authentication auth;
    private static final long EXPIRATION_TIME = 86400000;
    @Value("${jwt.secret}")
    private String secretKey;
    @Autowired
    private final UserRepo appUserRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public AppUserService(AuthenticationManager authenticationManager,
                          JwtTokenUtil jwtTokenUtil,
                          UserRepo appUserRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> loginUser(String username, String password) {
        try {
            // Authenticate using Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // Fetch user from DB
            AppUser foundUser = appUserRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

            // Set security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate token
            String token = jwtTokenUtil.generateToken(foundUser.getUsername());

            // Build and return response
            Map<String, Object> response = new HashMap<>();
            response.put("username", foundUser.getUsername());
            response.put("id", foundUser.getId());
            response.put("role", foundUser.getAppUserRole());
            response.put("token", token);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Invalid username or password", e);
        }
    }




    public AppUser registerUser(AppUser registration) {
        if (appUserRepository.existsByUsername(registration.getUsername())) {
            throw new UserAlreadyExistsException("Usuario ya existe");
        }

        AppUser user = new AppUser();
        user.setUsername(registration.getUsername());
        user.setPassword(passwordEncoder.encode(registration.getPassword()));
        user.setAppUserRole(registration.getAppUserRole());

        return appUserRepository.save(user);
    }

    public AppUser getUserById(Long id) {
        return appUserRepository.findById(id).orElse(null);
    }

    public Optional<AppUser> findByUsername(String username){ return  appUserRepository.findByUsername(username); }


    public String generateToken(AppUser user) {
        byte[] secretKeyBytes = Base64.getDecoder().decode(secretKey);
        Key key = new SecretKeySpec(secretKeyBytes, SignatureAlgorithm.HS256.getJcaName());

        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        return appUserRepository.findByUsername(username).orElse(null);
    }

    public AppUser getFirstUser() {
        return appUserRepository.findAll().stream().findFirst().orElse(null);
    }

    public boolean delete(Long id) {
        Optional<AppUser> category = appUserRepository.findById(id);
        if (category.isPresent()) {
            appUserRepository.delete(category.get());
            return true;
        }
        throw new RuntimeException("Product with ID " + id + " not found");
    }

    public long countUsers() {
        return appUserRepository.count();
    }
}
