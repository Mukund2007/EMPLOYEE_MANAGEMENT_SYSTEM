package com.ems.repository;

import com.ems.model.LinkRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LinkRequestRepository extends JpaRepository<LinkRequest, Long> {
    List<LinkRequest> findByStatus(String status);
    Optional<LinkRequest> findFirstByUsernameOrderByCreatedAtDesc(String username);
}
