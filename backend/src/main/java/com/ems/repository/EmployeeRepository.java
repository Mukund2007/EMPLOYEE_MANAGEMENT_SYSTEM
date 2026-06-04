package com.ems.repository;

import com.ems.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByIdAndActiveTrue(Long id);
    
    Page<Employee> findAllByActiveTrue(Pageable pageable);
    
    List<Employee> findByDepartmentIgnoreCaseAndActiveTrue(String department);
    
    List<Employee> findBySalaryBetweenAndActiveTrue(Double min, Double max);
    
    List<Employee> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    
    boolean existsByEmailAndActiveTrue(String email);
    
    boolean existsByEmailAndIdNotAndActiveTrue(String email, Long id);

    Optional<Employee> findByUsernameAndActiveTrue(String username);
}
