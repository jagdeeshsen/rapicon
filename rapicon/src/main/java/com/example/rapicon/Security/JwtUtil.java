package com.example.rapicon.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    private final String SECRET = "rapiconsecretkey123rapiconsecretkey123rapiconsecretkey123rapiconsecretkey123rapiconsecretkey123rapiconsecretkey123"; // use a strong secret in production


    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    //----------- Generate auth token----------------------------
    public String generateToken(UserDetailsImpl userDetails) {
        final long EXPIRATION = 1000*60*60*24; // 24 hours
        String role= userDetails.getAuthorities().iterator().next().getAuthority();
        if(role.startsWith("ROLE_")){
            role=role.substring(5);
        }

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("id", userDetails.getId())          //  store ID
                .claim("email", userDetails.getEmail())    // optional
                .claim("role", role)
                .claim("type", "access")  // new line added
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // ---------------- generates a refresh token for the same user ---------------
    public String generateRefreshToken(UserDetailsImpl userDetails) {
        final long REFRESH_EXPIRATION = 1000L * 60 * 60 * 24 * 30;  // 30 days
        String role= userDetails.getAuthorities().iterator().next().getAuthority();
        if(role.startsWith("ROLE_")){
            role=role.substring(5);
        }

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("id",   userDetails.getId())
                .claim("role", role)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) extractClaims(token).get("role");
    }

    public boolean validateToken(String token) {
        try {
            Claims claims=extractClaims(token);
            return !isTokenExpired(claims);
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("JWT Validation failed: "+ e.getMessage());
            return false;
        }
    }

    // ------------ type checkers used in refresh endpoint ----------------
    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(extractClaims(token).get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        try {
            return "access".equals(extractClaims(token).get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    // ------------------------ extract userId claim ----------------------------
    public Long extractUserId(String token) {
        Object id = extractClaims(token).get("id");
        if (id instanceof Integer) return ((Integer) id).longValue();
        if (id instanceof Long)    return (Long) id;
        return null;
    }

    private boolean isTokenExpired(Claims claims){
        return claims.getExpiration().before(new Date());
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }

}
