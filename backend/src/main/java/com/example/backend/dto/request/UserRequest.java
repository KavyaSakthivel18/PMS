package com.example.backend.dto.request;

import com.example.backend.enums.UserRole;
import lombok.Data;

@Data
public class UserRequest {

    private String name;
    private String email;
    private UserRole role;
    private String companyName;

}
