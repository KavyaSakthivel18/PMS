package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementListResponse {
    
    private java.util.List<MovementLogResponse> movements;
    
    private Long totalCount;
    
    private Integer pageNumber;
    
    private Integer pageSize;
    
    private Integer totalPages;
}