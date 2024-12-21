package pnef.javabackend.Controller;

import org.springframework.web.bind.annotation.*;
import pnef.javabackend.Model.GeneralResponse;
import pnef.javabackend.Model.Users;
import pnef.javabackend.Service.UserService;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Function to handle front-end requests for user registration
    @PostMapping(value = "/user/register")
    public GeneralResponse createUser(@RequestBody Users user) {
        return userService.createUser(user);
    }

    // Function to handle user login
    @PostMapping(value = "/user/login")
    public GeneralResponse loginUser(@RequestBody Users user) {
        return userService.loginUser(user);
    }

    // Function to edit (update) user details
    @PutMapping(value = "/user/edit")
    public GeneralResponse editUser(@RequestBody Users user) {
        return userService.editUser(user);
    }

    // Function to delete a user from the system
    @DeleteMapping(value = "/user/delete")
    public GeneralResponse deleteUser(@RequestBody Users user) {
        return userService.deleteUser(user);
    }
}
