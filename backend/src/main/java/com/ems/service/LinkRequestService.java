package com.ems.service;

import com.ems.dto.LinkRequestDto;
import java.util.List;

public interface LinkRequestService {
    LinkRequestDto createLinkRequest(String username, String message);
    LinkRequestDto getMyLinkRequest(String username);
    List<LinkRequestDto> getPendingLinkRequests();
    LinkRequestDto linkUserToEmployee(Long id, Long employeeId);
    LinkRequestDto dismissLinkRequest(Long id);
}
