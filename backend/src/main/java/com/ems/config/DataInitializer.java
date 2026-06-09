package com.ems.config;

import com.ems.model.Employee;
import com.ems.model.User;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Initializes the database with demo accounts (testadmin, testuser1)
 * and dummy employees if the database is empty.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeDemoUsers();
        initializeDummyEmployees();
    }

    private void initializeDemoUsers() {
        log.info("Initializing demo user accounts...");

        // 1. Create testadmin (Admin role)
        if (!userRepository.existsByUsername("testadmin")) {
            User admin = User.builder()
                    .username("testadmin")
                    .password(passwordEncoder.encode("password123"))
                    .role("ROLE_ADMIN")
                    .build();
            userRepository.save(admin);
            log.info("Created demo admin account: testadmin / password123");
        }

        // 2. Create testuser1 (User role)
        if (!userRepository.existsByUsername("testuser1")) {
            User user = User.builder()
                    .username("testuser1")
                    .password(passwordEncoder.encode("password123"))
                    .role("ROLE_USER")
                    .build();
            userRepository.save(user);
            log.info("Created demo user account: testuser1 / password123");
        }
    }

    private void initializeDummyEmployees() {
        if (employeeRepository.count() == 0) {
            log.info("Initializing dummy employee records...");

            Employee emp1 = Employee.builder()
                    .name("Mukund")
                    .email("mukundamadhavareddy540@gmail.com")
                    .phone("6872382732")
                    .department("Product Management")
                    .position("Lead Developer")
                    .salary(224334.0)
                    .joinDate(LocalDate.now())
                    .active(true)
                    .build();

            Employee emp2 = Employee.builder()
                    .name("John Doe")
                    .email("john.doe@example.com")
                    .phone("1234567890")
                    .department("Engineering")
                    .position("Senior Developer")
                    .salary(85000.0)
                    .joinDate(LocalDate.now().minusMonths(6))
                    .active(true)
                    .build();

            Employee emp3 = Employee.builder()
                    .name("Jane Smith")
                    .email("jane.smith@example.com")
                    .phone("9876543210")
                    .department("Human Resources")
                    .position("HR Manager")
                    .salary(72000.0)
                    .joinDate(LocalDate.now().minusYears(1))
                    .active(true)
                    .build();

            employeeRepository.saveAll(List.of(emp1, emp2, emp3));
            log.info("Successfully loaded 3 dummy employees.");
        }
    }
}
