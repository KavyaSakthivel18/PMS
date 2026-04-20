package com.example.backend.repository;

import com.example.backend.entity.Container;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContainerRepository extends JpaRepository<Container, Long> {
    Optional<Container> findByContainerNumber(String containerNumber);
}
