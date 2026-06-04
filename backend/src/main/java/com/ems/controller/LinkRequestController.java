package com.ems.controller;

import com.ems.dto.LinkRequestDto;
import com.ems.service.LinkRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/link-requests")
@RequiredArgsConstructor
public class LinkRequestController {

    private final LinkRequestService linkRequestService;

    @PostMapping
    public ResponseEntity<LinkRequestDto> createLinkRequest(@RequestBody LinkRequestDto dto, Principal principal) {
        return ResponseEntity.ok(linkRequestService.createLinkRequest(principal.getName(), dto.getMessage()));
    }

    @GetMapping("/me")
    public ResponseEntity<LinkRequestDto> getMyLinkRequest(Principal principal) {
        LinkRequestDto request = linkRequestService.getMyLinkRequest(principal.getName());
        if (request == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LinkRequestDto>> getPendingLinkRequests() {
        return ResponseEntity.ok(linkRequestService.getPendingLinkRequests());
    }

    @PutMapping("/{id}/link")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LinkRequestDto> linkUserToEmployee(
            @PathVariable Long id,
            @RequestParam Long employeeId
    ) {
        return ResponseEntity.ok(linkRequestService.linkUserToEmployee(id, employeeId));
    }

    @PutMapping("/{id}/dismiss")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LinkRequestDto> dismissLinkRequest(@PathVariable Long id) {
        return ResponseEntity.ok(linkRequestService.dismissLinkRequest(id));
    }
}
