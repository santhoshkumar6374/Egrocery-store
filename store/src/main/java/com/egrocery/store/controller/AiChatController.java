package com.egrocery.store.controller;

import com.egrocery.store.dto.request.AiChatRequest;
import com.egrocery.store.dto.response.AiChatResponse;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.service.AiChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * POST /api/ai/chat — the AI Grocery Assistant, as specified.
 * Requires any authenticated user (customer or admin) — SecurityConfig's
 * .anyRequest().authenticated() rule covers this path, since it isn't under
 * /api/admin/** or /api/customer/**. Every tool is read-only and personal-data
 * tools always resolve to the caller themselves, so this is safe for either role.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Grocery Assistant", description = "Ask natural-language questions about products, prices, stock, and your own orders")
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@AuthenticationPrincipal CustomUserDetails principal,
                                                            @Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiChatService.chat(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}