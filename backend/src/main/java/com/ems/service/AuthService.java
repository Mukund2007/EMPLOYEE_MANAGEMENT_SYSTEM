package com.ems.service;

import com.ems.dto.AuthResponse;
import com.ems.dto.ChangePasswordRequest;
import com.ems.dto.ForgotPasswordRequest;
import com.ems.dto.LoginRequest;
import com.ems.dto.RegisterRequest;
import com.ems.dto.ResetPasswordRequest;

import java.util.Map;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void changePassword(String username, ChangePasswordRequest request);
    Map<String, String> forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
