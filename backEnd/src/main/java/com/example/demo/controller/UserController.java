package com.example.demo.controller;

import com.example.demo.exceptions.UserAlreadyExistsException;
import com.example.demo.model.AppUser;
import com.example.demo.service.AppUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private AppUserService appUserService;

  @PostMapping("/registro")
  public ResponseEntity<?> registro(@RequestBody AppUser user) {
      try {
          AppUser regUser = appUserService.registerUser(user);
          return ResponseEntity.status(HttpStatus.CREATED).body(regUser);
      } catch (Exception e) {
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                  .body("Error: " + e.getMessage());
      }
  }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AppUser user) {
        try {
            Map<String, Object> response = appUserService.loginUser(user.getUsername(), user.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<AppUser> getUser(@PathVariable Long id) {


        System.out.println(appUserService.getUserById(id));
        return ResponseEntity.ok(appUserService.getUserById(id));
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Controller is working!");
    }
    }