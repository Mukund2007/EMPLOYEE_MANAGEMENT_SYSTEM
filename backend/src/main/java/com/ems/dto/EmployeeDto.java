package com.ems.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {

    private Long id;

    @NotBlank(message = "Employee name is required")
    @Size(min = 2, max = 100, message = "Employee name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Employee email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Employee phone number is required")
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 digits")
    private String phone;

    @NotBlank(message = "Employee department is required")
    private String department;

    @NotNull(message = "Salary is required")
    @Positive(message = "Salary must be a positive number")
    private Double salary;

    @NotNull(message = "Join date is required")
    private LocalDate joinDate;

    private String position;

    private String username;

    // Read-only auditing fields populated from entity lifecycle
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
