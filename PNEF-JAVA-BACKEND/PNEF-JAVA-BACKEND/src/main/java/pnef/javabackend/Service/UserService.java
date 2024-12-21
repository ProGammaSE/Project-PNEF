package pnef.javabackend.Service;

import org.springframework.stereotype.Service;
import pnef.javabackend.Model.GeneralResponse;
import pnef.javabackend.Model.Users;
import pnef.javabackend.Repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Function create a new user to the system
    public GeneralResponse createUser(Users user) {
        System.out.println("***** createUser function is starting *****");
        GeneralResponse generalResponse = new GeneralResponse();
        Users dbUser;

        System.out.println(!user.getFullName().isEmpty());

        // checking whether the mandatory data are available
        if (!user.getFullName().isEmpty() && !user.getUserUsername().isEmpty() && !user.getUserPassword().isEmpty()) {
            try {
                // Checking whether the username is already available in the system
                Users validateUsername = userRepository.findByUserUsername(user.getUserUsername());

                if (validateUsername != null) {
                    System.out.println("User already exists");
                    generalResponse.setResponse(400);
                    generalResponse.setMessage("User already exists");
                }
                else {
                    // creating user in the database
                    dbUser = userRepository.save(user);
                    System.out.println("User created successfully");
                    generalResponse.setResponse(200);
                    generalResponse.setData(dbUser);
                    generalResponse.setMessage("User created successfully");
                }
            } catch (Exception ex) {
                // error when trying to save in the database
                System.out.println("User creation failed");
                generalResponse.setResponse(400);
                generalResponse.setMessage("User creation failed");
                System.out.println(ex.getMessage());
            }
        }
        else {
            System.out.println("Mandatory data are not available");
            generalResponse.setResponse(400);
            generalResponse.setMessage("Mandatory data are not available");
        }
        return generalResponse;
    }

    // Function to handle user login by validating user data and database data
    public GeneralResponse loginUser(Users user) {
        System.out.println("***** loginUser function is starting *****");
        GeneralResponse generalResponse = new GeneralResponse();

        // checking whether the mandatory details are available
        if (user.getUserUsername().isEmpty() || user.getUserPassword().isEmpty()) {
            generalResponse.setResponse(400);
            generalResponse.setMessage("Username or password is empty");
        }
        else {
            try {
                // checking whether the user is available in the database
                Users dbUser = userRepository.getUsersByUserUsername(user.getUserUsername());

                if (dbUser == null) {
                    // user not found in the database
                    generalResponse.setResponse(400);
                    generalResponse.setMessage("Username is incorrect");
                }
                else {
                    // checking the password
                    if (user.getUserPassword().equals(dbUser.getUserPassword())) {
                        generalResponse.setResponse(200);
                        generalResponse.setMessage("User logged in successfully");
                        generalResponse.setData(dbUser);
                    }
                    else {
                        generalResponse.setResponse(400);
                        generalResponse.setMessage("Password is incorrect");
                    }
                }
            } catch (Exception ex) {
                generalResponse.setResponse(400);
                generalResponse.setMessage("Something went wrong!");
                System.out.println(ex.getMessage());
            }
        }
        return generalResponse;
    }

    // Function to edit user details in the system
    public GeneralResponse editUser(Users user) {
        System.out.println("***** editUser function is starting *****");
        GeneralResponse generalResponse = new GeneralResponse();

        // Check whether the user ID is available in the request from the front-end
        if (user.getUserId() != 0) {
            System.out.println("User ID is available, Therefore checking the Database availability");

            try {
                Users dbUser = userRepository.findByUserId(user.getUserId());

                if (dbUser != null) {
                    System.out.println("User ID is available in the database, Therefore attempting to edit details");
                    userRepository.save(user);

                    generalResponse.setResponse(200);
                    generalResponse.setMessage("User updated successfully");
                    generalResponse.setData(user);
                }
                else {
                    System.out.println("User ID is not available in the database");
                    generalResponse.setResponse(400);
                    generalResponse.setMessage("User not found");
                }
            } catch (Exception ex) {
                System.out.println("An error occurred while editing the suer");
                generalResponse.setResponse(400);
                generalResponse.setMessage("An error occurred while editing the suer");
            }
        }
        else {
            System.out.println("User ID is not available in the request");
            generalResponse.setResponse(400);
            generalResponse.setMessage("User not found");
        }
        return generalResponse;
    }

    // Function to delete a user from the system
    public GeneralResponse deleteUser(Users user) {
        System.out.println("***** deleteUser function is starting *****");
        GeneralResponse generalResponse = new GeneralResponse();

        // Check whether the user ID is available in the request from the front-end
        if (user.getUserId() != 0) {
            System.out.println("User ID is available, Therefore attempting to delete the user");

            try {
                userRepository.delete(user);
                System.out.println("User deleted successfully");
                generalResponse.setResponse(200);
                generalResponse.setMessage("User deleted successfully");
            } catch (Exception ex) {
                System.out.println("An error occurred while deleting the suer");
                generalResponse.setResponse(400);
                generalResponse.setMessage("An error occurred while deleting the suer");
            }
        }
        else {
            System.out.println("User ID is not available in the request");
            generalResponse.setResponse(400);
            generalResponse.setMessage("User not found");
        }
        return generalResponse;
    }
}
