package com.ems.service;

import com.ems.dto.LeaveDto;
import java.util.List;

public interface LeaveService {
    LeaveDto createLeave(LeaveDto leaveDto, String username);
    List<LeaveDto> getLeavesByEmployee(Long employeeId);
    List<LeaveDto> getLeavesByUsername(String username);
    List<LeaveDto> getAllLeaves();
    LeaveDto updateLeaveStatus(Long id, String status);
}
