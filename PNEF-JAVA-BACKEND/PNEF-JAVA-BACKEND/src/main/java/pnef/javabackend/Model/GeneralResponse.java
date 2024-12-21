package pnef.javabackend.Model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GeneralResponse {
    private int response;
    private String message;
    private Object data;
}
