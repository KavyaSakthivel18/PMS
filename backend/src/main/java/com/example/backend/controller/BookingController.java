package com.example.backend.controller;

import com.example.backend.dto.request.BookingRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * POST /api/bookings
     * Create a new container movement booking.
     * Accessible by: FREIGHT_FORWARDER
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/bookings
     * Retrieve all bookings.
     * Accessible by: ADMIN, SHIPPING_LINE
     */
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /**
     * GET /api/bookings/{id}
     * Get a specific booking by ID with full details (container, vessel, forwarder).
     * Accessible by: ADMIN, FREIGHT_FORWARDER, SHIPPING_LINE
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /**
     * GET /api/bookings/freight-forwarder/{ffId}
     * Get all bookings for a specific freight forwarder.
     * Accessible by: FREIGHT_FORWARDER, ADMIN
     */
    @GetMapping("/freight-forwarder/{ffId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByFreightForwarder(@PathVariable Long ffId) {
        return ResponseEntity.ok(bookingService.getBookingsByFreightForwarder(ffId));
    }
}