import { Container, Typography, Box } from '@mui/material';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';

/**
 * Temporary stand-in for pages landing in upcoming build phases, so every nav
 * link in the app resolves to something coherent rather than a dead route.
 */
export default function ComingSoon({ title }) {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Box sx={{ color: 'text.secondary', mb: 2 }}>
        <ConstructionOutlinedIcon sx={{ fontSize: 40 }} />
      </Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary">This section is being built in an upcoming phase.</Typography>
    </Container>
  );
}