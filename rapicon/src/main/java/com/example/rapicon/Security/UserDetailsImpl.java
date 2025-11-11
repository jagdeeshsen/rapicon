package com.example.rapicon.Security;

import com.example.rapicon.Models.User;
import com.example.rapicon.Models.Vendor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String username;
    private String email;

    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;


    public UserDetailsImpl(Long id, String username, String email, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public UserDetailsImpl(Long id, String email, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.authorities = authorities;
    }


    //----------------- for user-------------------------//

    public static UserDetailsImpl build(User user){
        List<GrantedAuthority> authorities= List.of(new SimpleGrantedAuthority("ROLE_USER")
        );
        return new UserDetailsImpl(user.getId(),
                user.getEmail(), authorities);

    }

    //--------------------for vendor------------------------//
    public static UserDetailsImpl build(Vendor vendor){
        List<GrantedAuthority> authorities= List.of(new SimpleGrantedAuthority("ROLE_VENDOR")
        );
        return new UserDetailsImpl(vendor.getId(),
                vendor.getUsername(), vendor.getEmail(), vendor.getPassword(),authorities);

    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public Long getId(){
        return id;
    }

    public String getEmail() {
        return email;
    }
}
