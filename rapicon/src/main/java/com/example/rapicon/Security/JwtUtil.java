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
    private final long EXPIRATION = 1000*60*60*24; //

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(UserDetailsImpl userDetails) {
        String role= userDetails.getAuthorities().iterator().next().getAuthority();
        if(role.startsWith("ROLE_")){
            role=role.substring(5);
        }

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("id", userDetails.getId())          // ✅ store ID
                .claim("email", userDetails.getEmail())    // optional
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + EXPIRATION))
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

    private boolean isTokenExpired(Claims claims){
        return claims.getExpiration().before(new Date());
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }

}
