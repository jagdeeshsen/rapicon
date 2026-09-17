package com.example.rapicon.Config;


import com.example.rapicon.Security.JwtFilter;
import com.example.rapicon.Security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize
public class SecurityConfig {

    private JwtUtil jwtUtil;

    SecurityConfig(JwtUtil jwtUtil){
        this.jwtUtil=jwtUtil;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder){
        DaoAuthenticationProvider provider= new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.getWriter().write("{\"error\": \"Unauthorized: " + authException.getMessage() + "\"}");
        };
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint()))
                .authorizeHttpRequests(auth -> auth

                        // 1. Preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Static/public frontend pages
                        .requestMatchers(
                                "/", "/index.html", "/details.html", "/payment.html",
                                "/cart.html", "/profile.html", "/otp-login.html",
                                "/loan-form.html", "/about-us.html", "/sitemap.xml",
                                "/privacy-policy.html", "/register-now.html",
                                "/otp-verification.html", "/terms-privacy.html",
                                "/reset-password.html", "/reset-password.html/**",
                                "/FAQ.html", "/vendor-landing.html", "/package-details.html",
                                "/vendor-dashboard.html", "/forgot-password.html",
                                "/contact.html", "/login.html", "/installment-payment.html",
                                "/register.html", "/designs.html", "/admin.html",
                                "/css/**", "/images/**", "/favicon.ico", "/scripts/**","ai-assistant-chatbot/**"
                        ).permitAll()

                        // 3. Public API endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/designs/**").permitAll()       // browsing designs is public?
                        .requestMatchers("/api/cart/**").permitAll()
                        .requestMatchers("/api/v1/customer/**").permitAll()
                        .requestMatchers("/api/payment/phonePe/**").permitAll()
                        .requestMatchers("/api/chat/**").permitAll()

                        // 4. Role-protected endpoints (MOST SPECIFIC first)
                        .requestMatchers("/api/admin/**").permitAll()
                        .requestMatchers("/api/vendor/**").permitAll()

                        // 5. Any other /api/** requires authentication
                        .requestMatchers("/api/**").authenticated()

                        // 6. Everything else also requires auth
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtUtil);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow your React dev server and production URLs
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",           // React dev server (Vite)
                "http://localhost:3000",           // Alternative React dev server
                "https://rapiconinfra.com",        // Your production frontend
                "https://admin.rapiconinfra.com",
                "https://www.rapiconinfra.com"     // With www subdomain
        ));

        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Allow credentials (cookies, authorization headers, etc.)
        configuration.setAllowCredentials(true);

        // How long the browser can cache preflight response (1 hour)
        configuration.setMaxAge(3600L);

        // Expose headers to the browser
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        // Apply CORS configuration to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
