package pnef.javabackend.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "user_role")
    private int userRole = 0;

    @Column(name = "user_username")
    private String userUsername;

    @Column(name = "user_password")
    private String userPassword;
}