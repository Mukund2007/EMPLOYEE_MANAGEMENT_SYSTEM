package com.ems.serviceImpl;

import com.ems.dto.LinkRequestDto;
import com.ems.exception.ResourceNotFoundException;
import com.ems.model.Employee;
import com.ems.model.LinkRequest;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LinkRequestRepository;
import com.ems.service.LinkRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LinkRequestServiceImpl implements LinkRequestService {

    private final LinkRequestRepository linkRequestRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public LinkRequestDto createLinkRequest(String username, String message) {
        LinkRequest request = LinkRequest.builder()
                .username(username)
                .message(message)
                .status("PENDING")
                .build();
        return mapToDto(linkRequestRepository.save(request));
    }

    @Override
    public LinkRequestDto getMyLinkRequest(String username) {
        return linkRequestRepository.findFirstByUsernameOrderByCreatedAtDesc(username)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Override
    public List<LinkRequestDto> getPendingLinkRequests() {
        return linkRequestRepository.findByStatus("PENDING").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LinkRequestDto linkUserToEmployee(Long id, Long employeeId) {
        LinkRequest request = linkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Link request not found"));

        Employee employee = employeeRepository.findByIdAndActiveTrue(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Set employee's username to request's username (linking them)
        employee.setUsername(request.getUsername());
        employeeRepository.save(employee);

        // Resolve request
        request.setStatus("LINKED");
        return mapToDto(linkRequestRepository.save(request));
    }

    @Override
    public LinkRequestDto dismissLinkRequest(Long id) {
        LinkRequest request = linkRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Link request not found"));
        request.setStatus("DISMISSED");
        return mapToDto(linkRequestRepository.save(request));
    }

    private LinkRequestDto mapToDto(LinkRequest request) {
        return LinkRequestDto.builder()
                .id(request.getId())
                .username(request.getUsername())
                .message(request.getMessage())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
