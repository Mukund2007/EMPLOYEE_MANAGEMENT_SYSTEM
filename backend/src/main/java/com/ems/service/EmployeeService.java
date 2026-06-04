package com.ems.service;

import com.ems.dto.EmployeeDto;
import com.ems.dto.EmployeeStatsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface EmployeeService {
    Page<EmployeeDto> getAllEmployees(Pageable pageable);
    EmployeeDto getEmployeeById(Long id);
    EmployeeDto addEmployee(EmployeeDto employeeDto);
    EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto);
    void deleteEmployee(Long id);
    
    List<EmployeeDto> getEmployeesByDepartment(String department);
    List<EmployeeDto> getEmployeesBySalaryRange(Double min, Double max);
    List<EmployeeDto> searchEmployeesByName(String name);
    EmployeeStatsDto getEmployeeStats();
    EmployeeDto getEmployeeByUsername(String username);
}
