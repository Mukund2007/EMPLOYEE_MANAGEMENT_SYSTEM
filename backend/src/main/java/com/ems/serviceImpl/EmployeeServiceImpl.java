package com.ems.serviceImpl;

import com.ems.dto.EmployeeDto;
import com.ems.dto.EmployeeStatsDto;
import com.ems.exception.ResourceNotFoundException;
import com.ems.exception.UserAlreadyExistsException;
import com.ems.model.Employee;
import com.ems.repository.EmployeeRepository;
import com.ems.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    public Page<EmployeeDto> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAllByActiveTrue(pageable)
                .map(this::mapToDto);
    }

    @Override
    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDto(employee);
    }

    @Override
    public EmployeeDto addEmployee(EmployeeDto employeeDto) {
        if (employeeRepository.existsByEmailAndActiveTrue(employeeDto.getEmail())) {
            throw new UserAlreadyExistsException("Employee with email '" + employeeDto.getEmail() + "' already exists");
        }

        Employee employee = mapToEntity(employeeDto);
        employee.setId(null);
        employee.setActive(true);
        Employee savedEmployee = employeeRepository.save(employee);
        return mapToDto(savedEmployee);
    }

    @Override
    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        Employee existingEmployee = employeeRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (!existingEmployee.getEmail().equalsIgnoreCase(employeeDto.getEmail()) &&
                employeeRepository.existsByEmailAndIdNotAndActiveTrue(employeeDto.getEmail(), id)) {
            throw new UserAlreadyExistsException("Employee with email '" + employeeDto.getEmail() + "' already exists");
        }

        existingEmployee.setName(employeeDto.getName());
        existingEmployee.setEmail(employeeDto.getEmail());
        existingEmployee.setPhone(employeeDto.getPhone());
        existingEmployee.setDepartment(employeeDto.getDepartment());
        existingEmployee.setSalary(employeeDto.getSalary());
        existingEmployee.setJoinDate(employeeDto.getJoinDate());

        String position = employeeDto.getPosition();
        if (position != null && position.trim().isEmpty()) {
            position = null;
        }
        existingEmployee.setPosition(position);

        String username = employeeDto.getUsername();
        if (username != null && username.trim().isEmpty()) {
            username = null;
        }
        existingEmployee.setUsername(username);

        Employee updatedEmployee = employeeRepository.save(existingEmployee);
        return mapToDto(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee existingEmployee = employeeRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        // Soft delete: set active to false
        existingEmployee.setActive(false);
        employeeRepository.save(existingEmployee);
    }

    @Override
    public List<EmployeeDto> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartmentIgnoreCaseAndActiveTrue(department).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeDto> getEmployeesBySalaryRange(Double min, Double max) {
        return employeeRepository.findBySalaryBetweenAndActiveTrue(min, max).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeDto> searchEmployeesByName(String name) {
        return employeeRepository.findByNameContainingIgnoreCaseAndActiveTrue(name).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeStatsDto getEmployeeStats() {
        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(Employee::isActive)
                .collect(Collectors.toList());

        if (activeEmployees.isEmpty()) {
            return EmployeeStatsDto.builder()
                    .totalEmployees(0)
                    .totalPayroll(0.0)
                    .averageSalary(0.0)
                    .departmentCounts(Collections.emptyMap())
                    .highestSalary(0.0)
                    .lowestSalary(0.0)
                    .newestJoinDate(LocalDate.now())
                    .oldestJoinDate(LocalDate.now())
                    .build();
        }

        long totalEmployees = activeEmployees.size();
        double totalPayroll = activeEmployees.stream().mapToDouble(Employee::getSalary).sum();
        double averageSalary = totalPayroll / totalEmployees;
        
        Map<String, Long> departmentCounts = activeEmployees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));

        double highestSalary = activeEmployees.stream().mapToDouble(Employee::getSalary).max().orElse(0.0);
        double lowestSalary = activeEmployees.stream().mapToDouble(Employee::getSalary).min().orElse(0.0);
        
        LocalDate newestJoinDate = activeEmployees.stream()
                .map(Employee::getJoinDate)
                .max(LocalDate::compareTo)
                .orElse(LocalDate.now());

        LocalDate oldestJoinDate = activeEmployees.stream()
                .map(Employee::getJoinDate)
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());

        return EmployeeStatsDto.builder()
                .totalEmployees(totalEmployees)
                .totalPayroll(totalPayroll)
                .averageSalary(averageSalary)
                .departmentCounts(departmentCounts)
                .highestSalary(highestSalary)
                .lowestSalary(lowestSalary)
                .newestJoinDate(newestJoinDate)
                .oldestJoinDate(oldestJoinDate)
                .build();
    }

    @Override
    public EmployeeDto getEmployeeByUsername(String username) {
        return employeeRepository.findByUsernameAndActiveTrue(username)
                .map(this::mapToDto)
                .orElse(null);
    }

    private EmployeeDto mapToDto(Employee employee) {
        return EmployeeDto.builder()
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .department(employee.getDepartment())
                .salary(employee.getSalary())
                .joinDate(employee.getJoinDate())
                .position(employee.getPosition())
                .username(employee.getUsername())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }

    private Employee mapToEntity(EmployeeDto dto) {
        String username = dto.getUsername();
        if (username != null && username.trim().isEmpty()) {
            username = null;
        }
        String position = dto.getPosition();
        if (position != null && position.trim().isEmpty()) {
            position = null;
        }
        return Employee.builder()
                .id(dto.getId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .salary(dto.getSalary())
                .joinDate(dto.getJoinDate())
                .position(position)
                .username(username)
                .build();
    }
}
