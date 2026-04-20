package com.example.backend.service.serviceImpl;

import com.example.backend.dto.request.BookingRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Container;
import com.example.backend.entity.User;
import com.example.backend.entity.VesselSchedule;
import com.example.backend.enums.ContainerStatus;
import com.example.backend.enums.UserRole;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.ContainerRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VesselScheduleRepository;
import com.example.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ContainerRepository containerRepository;
    private final UserRepository userRepository;
    private final VesselScheduleRepository vesselScheduleRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {

        // Fetch and validate container
        Container container = containerRepository.findById(request.getContainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Container not found with id: " + request.getContainerId()));

        // Container must have arrived before booking
        if (container.getStatus() == null ||
                (!container.getStatus().equals(ContainerStatus.ARRIVED) &&
                 !container.getStatus().equals(ContainerStatus.YARD_STORAGE))) {
            throw new ValidationException("Container must be in ARRIVED or YARD_STORAGE status to create a booking. Current status: " + container.getStatus());
        }

        // Validate freight forwarder
        User freightForwarder = userRepository.findById(request.getFreightForwarderId())
                .orElseThrow(() -> new ResourceNotFoundException("Freight Forwarder not found with id: " + request.getFreightForwarderId()));

        if (!freightForwarder.getRole().equals(UserRole.FREIGHT_FORWARDER)) {
            throw new ValidationException("User with id " + request.getFreightForwarderId() + " is not a FREIGHT_FORWARDER");
        }

        // Validate shipping line
        User shippingLine = userRepository.findById(request.getShippingLineId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipping Line not found with id: " + request.getShippingLineId()));

        if (!shippingLine.getRole().equals(UserRole.SHIPPING_LINE)) {
            throw new ValidationException("User with id " + request.getShippingLineId() + " is not a SHIPPING_LINE");
        }

        // Validate vessel schedule
        VesselSchedule vesselSchedule = vesselScheduleRepository.findById(request.getVesselScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vessel Schedule not found with id: " + request.getVesselScheduleId()));

        // Build and save booking
        Booking booking = Booking.builder()
                .container(container)
                .freightForwarder(freightForwarder)
                .shippingLine(shippingLine)
                .vesselSchedule(vesselSchedule)
                .containerStatus(container.getStatus())
                .bookingDate(LocalDateTime.now())
                .pickUpDate(request.getPickUpDate())
                .deliveryDate(request.getDeliveryDate())
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByFreightForwarder(Long freightForwarderId) {
        // Validate freight forwarder exists
        userRepository.findById(freightForwarderId)
                .orElseThrow(() -> new ResourceNotFoundException("Freight Forwarder not found with id: " + freightForwarderId));

        return bookingRepository.findByFreightForwarderId(freightForwarderId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Mapper ──────────────────────────────────────────────────────────────

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .containerId(booking.getContainer().getId())
                .containerNumber(booking.getContainer().getContainerNumber())
                .freightForwarderId(booking.getFreightForwarder().getId())
                .freightForwarderName(booking.getFreightForwarder().getName())
                .shippingLineId(booking.getShippingLine().getId())
                .shippingLineName(booking.getShippingLine().getCompanyName())
                .vesselScheduleId(booking.getVesselSchedule().getId())
                .vesselName(booking.getVesselSchedule().getVessel().getVesselName())
                .containerStatus(booking.getContainerStatus())
                .bookingDate(booking.getBookingDate())
                .pickUpDate(booking.getPickUpDate())
                .deliveryDate(booking.getDeliveryDate())
                .build();
    }
}