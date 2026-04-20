package com.example.backend.service.serviceImpl;

import com.example.backend.dto.request.ContainerRequest;
import com.example.backend.dto.response.ContainerResponse;
import com.example.backend.entity.Container;
import com.example.backend.enums.ContainerStatus;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ContainerRepository;
import com.example.backend.service.ContainerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContainerServiceImpl implements ContainerService {

    private final ContainerRepository containerRepository;

    @Override
    public ContainerResponse registerContainer(ContainerRequest request) {
        if (request.getSizeTEU() != 20 && request.getSizeTEU() != 40 && request.getSizeTEU() != 45) {
            throw new IllegalArgumentException("Invalid sizeTEU. Allowed values are 20, 40, 45.");
        }
        
        if (containerRepository.findByContainerNumber(request.getContainerNumber()).isPresent()) {
            throw new IllegalArgumentException("Container number already exists.");
        }

        Container container = Container.builder()
                .containerNumber(request.getContainerNumber().toUpperCase())
                .containerType(request.getContainerType())
                .sizeTEU(request.getSizeTEU())
                .sealNumber(request.getSealNumber())
                .cargoDescription(request.getCargoDescription())
                .weightKG(request.getWeightKG())
                .status(ContainerStatus.ARRIVED) // Arriving containers get ARRIVED
                .vesselScheduleId(request.getVesselScheduleId())
                .shippingLineId(request.getShippingLineId())
                .build();

        Container savedContainer = containerRepository.save(container);
        return mapToResponse(savedContainer);
    }

    @Override
    public List<ContainerResponse> getAllContainers() {
        return containerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ContainerResponse getContainerById(Long id) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Container not found with id: " + id));
        return mapToResponse(container);
    }

    @Override
    public ContainerResponse updateContainerStatus(Long id, ContainerStatus newStatus) {
        Container container = containerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Container not found with id: " + id));
        
        container.setStatus(newStatus);
        Container updatedContainer = containerRepository.save(container);
        return mapToResponse(updatedContainer);
    }

    private ContainerResponse mapToResponse(Container container) {
        return ContainerResponse.builder()
                .id(container.getId())
                .containerNumber(container.getContainerNumber())
                .containerType(container.getContainerType())
                .sizeTEU(container.getSizeTEU())
                .sealNumber(container.getSealNumber())
                .cargoDescription(container.getCargoDescription())
                .weightKG(container.getWeightKG())
                .status(container.getStatus())
                .vesselScheduleId(container.getVesselScheduleId())
                .shippingLineId(container.getShippingLineId())
                .build();
    }
}
