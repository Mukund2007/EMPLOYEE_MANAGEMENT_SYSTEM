package com.ems.serviceImpl;

import com.ems.dto.LeaveDto;
import com.ems.exception.ResourceNotFoundException;
import com.ems.model.Leave;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRepository;
import com.ems.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public LeaveDto createLeave(LeaveDto leaveDto, String username) {
        Long employeeId = leaveDto.getEmployeeId();

        // If employeeId is null, attempt to resolve it from the username
        if (employeeId == null) {
            employeeRepository.findByUsernameAndActiveTrue(username)
                    .ifPresent(emp -> leaveDto.setEmployeeId(emp.getId()));
        } else {
            // Verify employee if provided
            employeeRepository.findByIdAndActiveTrue(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Active employee not found with id: " + employeeId));
        }

        Leave leave = Leave.builder()
                .employeeId(leaveDto.getEmployeeId())
                .username(username)
                .leaveType(leaveDto.getLeaveType() != null ? leaveDto.getLeaveType().toUpperCase() : "ANNUAL")
                .startDate(leaveDto.getStartDate())
                .endDate(leaveDto.getEndDate())
                .reason(leaveDto.getReason())
                .status("PENDING")
                .build();

        Leave savedLeave = leaveRepository.save(leave);
        return mapToDto(savedLeave);
    }

    @Override
    public List<LeaveDto> getLeavesByEmployee(Long employeeId) {
        // Verify that the employee exists
        employeeRepository.findByIdAndActiveTrue(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Active employee not found with id: " + employeeId));

        return leaveRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveDto> getLeavesByUsername(String username) {
        return leaveRepository.findByUsername(username).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveDto> getAllLeaves() {
        return leaveRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveDto updateLeaveStatus(Long id, String status) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        String sanitizedStatus = status.trim().toUpperCase();
        if (!sanitizedStatus.equals("PENDING") && 
            !sanitizedStatus.equals("APPROVED") && 
            !sanitizedStatus.equals("REJECTED")) {
            throw new IllegalArgumentException("Invalid leave status: " + status);
        }

        leave.setStatus(sanitizedStatus);
        Leave updatedLeave = leaveRepository.save(leave);
        return mapToDto(updatedLeave);
    }

    private LeaveDto mapToDto(Leave leave) {
        return LeaveDto.builder()
                .id(leave.getId())
                .employeeId(leave.getEmployeeId())
                .username(leave.getUsername())
                .leaveType(leave.getLeaveType())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .reason(leave.getReason())
                .status(leave.getStatus())
                .build();
    }
}
