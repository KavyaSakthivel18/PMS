🚢 Port Freight & Container Logistics Management System Overview

The Port Freight & Container Logistics Management System is a Full Stack Application used to manage container operations at seaports.

It helps track containers from the time they arrive at the port until they are delivered. The system also manages vessels, bookings, customs clearance, container movement, and fee calculation.

The goal is to reduce manual work, improve tracking, and automate logistics operations.

System Architecture

The system follows a layered architecture:

Client → Controller → Service → Repository → Database

Client

Applications like Postman or Frontend UI send requests to the system.

Controller Layer

Receives API requests and sends responses to the client.

Service Layer

Contains the business logic of the system.

Repository Layer

Communicates with the database.

Database

Stores all system data such as users, containers, vessels, and bookings.

Modules Explanation User Management

This module manages all users in the system.

Different users have different roles such as:

Admin Shipping Line Freight Forwarder Customs Officer Trucking Company Warehouse Operator

Each role has different permissions and responsibilities in the system.

Vessel Management

This module manages ships that arrive at the port.

It allows the system to:

Register vessels Schedule vessel arrivals and departures Track vessel status Container Management

This module handles container details and tracks their status.

Each container has information like:

Container number Container type Weight Current status

Containers move through different stages from arrival to delivery.

Booking Module

This module manages container transport bookings.

It allows freight forwarders to:

Book containers for transport Assign shipping lines Track booking details Customs Clearance Module

Before containers leave the port, they must pass customs clearance.

This module allows customs officers to:

Review declarations Approve containers Hold containers for inspection Reject containers if needed Movement Tracking Module

This module tracks where the container is at every stage.

Each movement is recorded with:

Container ID Location Time of movement

This helps in tracking the full history of the container.

Fee Calculation Module

Ports charge fees for storing containers.

This module calculates:

Storage fees – cost for storing containers at the port Demurrage fees – charged when containers stay longer than allowed Detention fees – charged when containers are returned late

The system automatically calculates these fees and generates invoices.

Container Lifecycle

A container moves through different stages in the system:

ARRIVED → YARD_STORAGE → CUSTOMS_HOLD → CLEARED → GATE_OUT → IN_TRANSIT → DELIVERED → EXPORT_READY → LOADED → DEPARTED

This lifecycle helps track the container from arrival to final shipment or delivery.

Database

The system stores data in tables such as:

users – information about system users vessels – vessel details containers – container details bookings – booking information customs_declarations – customs clearance data movement_logs – container movement history port_storage_fees – calculated storage fees Conclusion

The Port Freight & Container Logistics Management System helps ports manage container operations efficiently by providing tracking, automation, and better logistics management. 🚀
