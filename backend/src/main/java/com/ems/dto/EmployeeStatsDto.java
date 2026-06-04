package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeStatsDto {
    private long totalEmployees;
    private double totalPayroll;
    private double averageSalary;
    private Map<String, Long> departmentCounts;
    private double highestSalary;
    private double lowestSalary;
    private LocalDate newestJoinDate;
    private LocalDate oldestJoinDate;
}
