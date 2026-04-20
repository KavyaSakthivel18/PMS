package com.example.backend.controller;

import com.example.backend.dto.request.ContainerRequest;
import com.example.backend.dto.response.ContainerResponse;
import com.example.backend.enums.ContainerStatus;
import com.example.backend.service.ContainerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/containers")
@RequiredArgsConstructor
public class ContainerController {

    private final ContainerService containerService;

    @PostMapping
    public ResponseEntity<ContainerResponse> registerContainer(@Valid @RequestBody ContainerRequest request) {
        return new ResponseEntity<>(containerService.registerContainer(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ContainerResponse>> getAllContainers() {
        return ResponseEntity.ok(containerService.getAllContainers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContainerResponse> getContainerById(@PathVariable Long id) {
        return ResponseEntity.ok(containerService.getContainerById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ContainerResponse> updateContainerStatus(
            @PathVariable Long id,
            @RequestParam ContainerStatus status) {
        return ResponseEntity.ok(containerService.updateContainerStatus(id, status));
    }
}
