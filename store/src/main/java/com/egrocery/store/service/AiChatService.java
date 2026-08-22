package com.egrocery.store.service;

import com.egrocery.store.dto.request.AiChatRequest;
import com.egrocery.store.dto.response.AiChatResponse;

public interface AiChatService {

    AiChatResponse chat(Long userId, AiChatRequest request);
}