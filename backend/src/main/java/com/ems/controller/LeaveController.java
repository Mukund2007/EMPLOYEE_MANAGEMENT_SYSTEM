package com.ems.controller;

import com.ems.dto.LeaveDto;
import com.ems.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<LeaveDto> createLeave(@Valid @RequestBody LeaveDto leaveDto, java.security.Principal principal) {
        LeaveDto savedLeave = leaveService.createLeave(leaveDto, principal.getName());
        return new ResponseEntity<>(savedLeave, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<List<LeaveDto>> getMyLeaves(java.security.Principal principal) {
        return ResponseEntity.ok(leaveService.getLeavesByUsername(principal.getName()));
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<List<LeaveDto>> getLeavesByEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LeaveDto>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LeaveDto> updateLeaveStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(id, status));
    }
}
