package com.ems.serviceImpl;

import com.ems.config.JwtUtils;
import com.ems.dto.*;
import com.ems.exception.ResourceNotFoundException;
import com.ems.exception.UserAlreadyExistsException;
import com.ems.model.PasswordResetToken;
import com.ems.model.User;
import com.ems.repository.PasswordResetTokenRepository;
import com.ems.repository.UserRepository;
import com.ems.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final PasswordResetTokenRepository resetTokenRepository;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username '" + request.getUsername() + "' is already taken");
        }

        String role = request.getRole();
        if (role == null || role.trim().isEmpty()) {
            role = "ROLE_USER";
        } else {
            role = role.trim().toUpperCase();
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        // Always return success message to prevent username enumeration
        if (!userRepository.existsByUsername(request.getUsername())) {
            return Map.of(
                "message", "If an account with that username exists, a reset token has been generated.",
                "hint", "No account found with that username."
            );
        }

        // Delete any existing tokens for this user (one at a time)
        resetTokenRepository.deleteAllByUsername(request.getUsername());
        // Clean up expired tokens
        resetTokenRepository.deleteExpiredAndUsed(LocalDateTime.now());

        // Generate a short, user-friendly 8-char token
        String rawToken = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .username(request.getUsername())
                .token(rawToken)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        resetTokenRepository.save(resetToken);

        // In a real app, this token would be emailed.
        // For this local system, we return it directly.
        return Map.of(
            "message", "Reset token generated successfully. Use it to set your new password.",
            "resetToken", rawToken,
            "expiresIn", "60 minutes"
        );
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw new BadCredentialsException("This reset token has already been used");
        }

        if (resetToken.isExpired()) {
            resetTokenRepository.delete(resetToken);
            throw new BadCredentialsException("Reset token has expired. Please request a new one.");
        }

        User user = userRepository.findByUsername(resetToken.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
    }
}
