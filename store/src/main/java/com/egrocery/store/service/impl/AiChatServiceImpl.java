package com.egrocery.store.service.impl;

import com.egrocery.store.ai.GroceryAiTools;
import com.egrocery.store.dto.request.AiChatRequest;
import com.egrocery.store.dto.response.AiChatResponse;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.service.AiChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class AiChatServiceImpl implements AiChatService {

    private static final String SYSTEM_PROMPT = """
            You are the AI Grocery Assistant for a single online grocery shop. You help customers
            shop by answering questions about products, prices, discounts, stock, and their own
            orders and spending.

            Rules you must always follow:
            1. Never state a price, discount, stock level, order detail, or spending figure from
               memory or guesswork. Always call a tool to fetch current data first, then answer
               using only what the tool returned.
            2. Tools that read personal data (spending, order history) always reflect the
               currently logged-in customer automatically. Never ask the customer for a user ID,
               and never claim to look up another customer's data.
            3. If a search or lookup tool returns no results, say so plainly rather than inventing
               a product or figure.
            4. For "healthier" / "diabetic-friendly" / "healthy breakfast" style questions, base
               suggestions on the actual product descriptions and categories returned by the
               tools, keep it general food guidance, and add a brief note that it isn't medical
               or dietetic advice.
            5. Prices are in Indian Rupees; format them with the \u20B9 symbol.
            6. Keep answers concise and shopping-focused. If asked something unrelated to this
               grocery shop, politely say that's outside what you can help with here.
            """;

    private final ChatClient chatClient;

    public AiChatServiceImpl(ChatClient.Builder chatClientBuilder, GroceryAiTools tools, ChatMemory chatMemory) {
        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultTools(tools)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    @Override
    public AiChatResponse chat(Long userId, AiChatRequest request) {
        String conversationId = request.getConversationId() != null && !request.getConversationId().isBlank()
                ? request.getConversationId()
                : UUID.randomUUID().toString();

        // Namespaced by user so conversation memory (which can include tool results like a
        // customer's own order history) can never be read by a different logged-in customer,
        // even if they happened to reuse or guess the same conversationId string.
        String memoryKey = "user-" + userId + "-" + conversationId;

        try {
            String reply = chatClient.prompt()
                    .user(request.getMessage())
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, memoryKey))
                    .call()
                    .content();

            return AiChatResponse.builder()
                    .reply(reply)
                    .conversationId(conversationId)
                    .build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("does not exist or you do not have access")) {
                log.error("AI assistant misconfigured: the configured model/provider rejected the request. "
                        + "Check that spring.ai.openai.chat.options.model (OPENAI_MODEL) is a valid model for "
                        + "whatever spring.ai.openai.base-url (OPENAI_BASE_URL) points at. Cause: {}", e.getMessage());
            } else {
                log.error("AI assistant call failed", e);
            }
            throw new BadRequestException("The AI assistant is currently unavailable. Please try again in a moment.");
        }
    }
}