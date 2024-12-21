package pnef.javabackend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pnef.javabackend.Model.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, Integer> {

    Users save(Users user);

    Users getUsersByUserUsername(String userUsername);

    Users findByUserId(int userId);

    void delete(Users user);

    Users findByUserUsername(String userUsername);
}
