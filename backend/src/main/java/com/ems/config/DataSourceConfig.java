package com.ems.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * Programmatic DataSource configuration.
 * Forces TLS 1.2 for Aiven MySQL cloud connections.
 * Aiven rejects TLS 1.0/1.1 connections — this config explicitly enforces TLSv1.2.
 */
@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // Ensure SSL + TLS 1.2 params are in the URL for cloud (Aiven) connections
        String url = buildUrl(dbUrl);

        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);

        // Force TLS 1.2 explicitly via JDBC driver properties
        // These override anything set in the URL and are the most reliable way
        config.addDataSourceProperty("useSSL", "true");
        config.addDataSourceProperty("requireSSL", "true");
        config.addDataSourceProperty("enabledTLSProtocols", "TLSv1.2");
        config.addDataSourceProperty("allowPublicKeyRetrieval", "true");
        config.addDataSourceProperty("serverTimezone", "UTC");
        config.addDataSourceProperty("connectTimeout", "30000");

        // Pool settings optimized for Render free tier (512MB RAM)
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setInitializationFailTimeout(60000);
        config.setPoolName("EMS-HikariPool");

        return new HikariDataSource(config);
    }

    /**
     * Strip any conflicting sslMode/useSSL params from the incoming URL
     * and let the addDataSourceProperty() calls above handle SSL config.
     * This prevents "No enum constant SslMode.REQUIRE" errors.
     */
    private String buildUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return "jdbc:mysql://localhost:3306/ems";
        }

        // Remove sslMode parameter entirely — we handle SSL via driver properties
        String url = rawUrl
                .replaceAll("[?&]sslMode=[^&]*", "")
                .replaceAll("[?&]useSSL=[^&]*", "")
                .replaceAll("[?&]requireSSL=[^&]*", "")
                .replaceAll("[?&]enabledTLSProtocols=[^&]*", "")
                .replaceAll("[?&]allowPublicKeyRetrieval=[^&]*", "")
                .replaceAll("[?&]serverTimezone=[^&]*", "");

        // Clean up any trailing ? or &
        url = url.replaceAll("[?&]+$", "");

        return url;
    }
}
