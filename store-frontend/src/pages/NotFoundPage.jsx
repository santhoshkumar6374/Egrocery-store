import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="overline" color="secondary.main">
        404
      </Typography>
      <Typography variant="h3" sx={{ mb: 2 }}>
        This aisle doesn't exist.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for isn't here. Let's get you back to the shop.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained">
          Back to Shop
        </Button>
      </Box>
    </Container>
  );
}