package com.example.backend.service;

import com.example.backend.dto.request.ContainerRequest;
import com.example.backend.dto.response.ContainerResponse;
import com.example.backend.enums.ContainerStatus;

import java.util.List;

public interface ContainerService {
    ContainerResponse registerContainer(ContainerRequest request);
    List<ContainerResponse> getAllContainers();
    ContainerResponse getContainerById(Long id);
    ContainerResponse updateContainerStatus(Long id, ContainerStatus newStatus);
}
