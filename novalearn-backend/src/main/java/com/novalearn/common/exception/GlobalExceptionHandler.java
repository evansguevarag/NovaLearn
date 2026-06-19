package com.novalearn.common.exception;

import com.novalearn.common.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleResourceNotFound(
                ResourceNotFoundException exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.NOT_FOUND,
                        exception.getMessage(),
                        request,
                        null
                );
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiErrorResponse> handleBadRequest(
                BadRequestException exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.BAD_REQUEST,
                        exception.getMessage(),
                        request,
                        null
                );
        }

        @ExceptionHandler(ForbiddenActionException.class)
        public ResponseEntity<ApiErrorResponse> handleForbiddenAction(
                ForbiddenActionException exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.FORBIDDEN,
                        exception.getMessage(),
                        request,
                        null
                );
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
                IllegalArgumentException exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.BAD_REQUEST,
                        exception.getMessage(),
                        request,
                        null
                );
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiErrorResponse> handleBadCredentials(
                BadCredentialsException exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.UNAUTHORIZED,
                        "Credenciales incorrectas",
                        request,
                        null
                );
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiErrorResponse> handleAccessDenied(
                AccessDeniedException exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.FORBIDDEN,
                        "No tienes permisos para realizar esta accion",
                        request,
                        null
                );
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidationErrors(
                MethodArgumentNotValidException exception,
                HttpServletRequest request
        ) {
                Map<String, String> validationErrors = new HashMap<>();

                exception.getBindingResult().getFieldErrors().forEach(error ->
                        validationErrors.put(error.getField(), error.getDefaultMessage())
                );

                return buildResponse(
                        HttpStatus.BAD_REQUEST,
                        "Error de validacion",
                        request,
                        validationErrors
                );
        }

        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
                ConstraintViolationException exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.BAD_REQUEST,
                        "Parametros invalidos",
                        request,
                        null
                );
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
                MethodArgumentTypeMismatchException exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.BAD_REQUEST,
                        "Tipo de parametro invalido",
                        request,
                        null
                );
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleGenericException(
                Exception exception,
                HttpServletRequest request
        ) {
                return buildResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Ocurrio un error interno en el servidor",
                        request,
                        null
                );
        }

        private ResponseEntity<ApiErrorResponse> buildResponse(
                HttpStatus status,
                String message,
                HttpServletRequest request,
                Map<String, String> validationErrors
        ) {
                ApiErrorResponse response = new ApiErrorResponse(
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI(),
                        validationErrors
                );

                return ResponseEntity.status(status).body(response);
        }
}