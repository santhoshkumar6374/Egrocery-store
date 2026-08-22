import { useEffect, useRef, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import { aiApi } from '../../api/aiApi';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';

const STARTER_PROMPTS = [
  'Which rice is the cheapest right now?',
  'What products have the best discounts?',
  'How much have I spent this month?',
  'Show me my last order',
  'Recommend groceries for a ₹1000 budget',
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setSending(true);

    try {
      const { data } = await aiApi.chat(trimmed, conversationId ?? undefined);
      setConversationId(data.data.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.data.reply }]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'The assistant is having trouble right now. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 74px)' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">Ask the Shop</Typography>
        <Typography color="text.secondary">
          Ask about prices, stock, offers, or your own orders — grounded in what's actually on
          the shelves right now.
        </Typography>
      </Box>

      <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        {messages.length === 0 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Try asking:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {STARTER_PROMPTS.map((prompt) => (
                <Chip
                  key={prompt}
                  label={prompt}
                  onClick={() => sendMessage(prompt)}
                  variant="outlined"
                  sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                />
              ))}
            </Stack>
          </Stack>
        )}

        <Stack spacing={2}>
          {messages.map((m, idx) => (
            <Stack key={idx} direction="row" spacing={1.5} justifyContent={m.role === 'user' ? 'flex-end' : 'flex-start'}>
              {m.role === 'assistant' && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <ShoppingBasketOutlinedIcon fontSize="small" />
                </Avatar>
              )}
              <Paper
                variant={m.role === 'user' ? 'elevation' : 'outlined'}
                sx={{
                  px: 2,
                  py: 1.25,
                  maxWidth: '78%',
                  bgcolor: m.role === 'user' ? 'primary.main' : 'background.paper',
                  color: m.role === 'user' ? '#fff' : 'text.primary',
                  borderRadius: 2,
                  borderTopRightRadius: m.role === 'user' ? 4 : 2,
                  borderTopLeftRadius: m.role === 'assistant' ? 4 : 2,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {m.content}
                </Typography>
              </Paper>
              {m.role === 'user' && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </Avatar>
              )}
            </Stack>
          ))}

          {sending && (
            <Stack direction="row" spacing={1.5}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <ShoppingBasketOutlinedIcon fontSize="small" />
              </Avatar>
              <Paper variant="outlined" sx={{ px: 2, py: 1.25, borderRadius: 2, borderTopLeftRadius: 4 }}>
                <CircularProgress size={16} />
              </Paper>
            </Stack>
          )}
        </Stack>

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            placeholder="Ask about products, prices, or your orders…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            autoComplete="off"
          />
          <IconButton type="submit" color="primary" disabled={sending || !input.trim()} sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'grey.200' } }}>
            <SendIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}