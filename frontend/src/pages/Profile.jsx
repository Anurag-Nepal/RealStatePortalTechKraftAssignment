import React from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Basic profile information. This is a placeholder page; backend update endpoints are not yet wired.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              fullWidth
              value={user?.name || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              fullWidth
              value={user?.email || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Role"
              fullWidth
              value={user?.role || ''}
              disabled
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" disabled fullWidth>
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
