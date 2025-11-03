package com.example.demo.repository;

import com.example.demo.model.AppUser;
import com.example.demo.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserRepo extends JpaRepository<AppUser, Long> {
     AppUser getById(Long id);

     Optional<AppUser> findByUsername(String username);

    Page<AppUser> findAll(Pageable pageable);


    boolean existsByUsername(String username);
}
