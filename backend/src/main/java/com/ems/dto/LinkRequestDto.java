package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkRequestDto {
    private Long id;
    private String username;
    private String message;
    private String status;
    private LocalDateTime createdAt;
}
