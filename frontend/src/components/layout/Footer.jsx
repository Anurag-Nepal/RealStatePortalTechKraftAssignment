import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    properties: [
      { text: 'Browse Properties', path: '/properties' },
      { text: 'Featured Listings', path: '/properties?featured=true' },
      { text: 'New Listings', path: '/properties?sort=newest' },
      { text: 'Price Reduced', path: '/properties?sort=price_reduced' }
    ],
    company: [
      { text: 'About Us', path: '/about' },
      { text: 'Our Team', path: '/team' },
      { text: 'Careers', path: '/careers' },
      { text: 'Press', path: '/press' }
    ],
    support: [
      { text: 'Help Center', path: '/help' },
      { text: 'Contact Us', path: '/contact' },
      { text: 'Privacy Policy', path: '/privacy' },
      { text: 'Terms of Service', path: '/terms' }
    ]
  };

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Twitter />, url: '#', label: 'Twitter' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn' },
    { icon: <Instagram />, url: '#', label: 'Instagram' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        mt: 'auto',
        pt: 6,
        pb: 3
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Real Estate Portal
            </Typography>
            <Typography variant="body2" color="grey.300" sx={{ mb: 3, lineHeight: 1.6 }}>
              Your trusted partner in finding the perfect home. We connect buyers, sellers, 
              and renters with the best properties in the market.
            </Typography>
            
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="grey.300">
                  (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="grey.300">
                  info@realestateportal.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="grey.300">
                  123 Real Estate Ave, City, ST 12345
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Properties
            </Typography>
            <Stack spacing={1}>
              {footerLinks.properties.map((link, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={link.path}
                  color="grey.300"
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Company
            </Typography>
            <Stack spacing={1}>
              {footerLinks.company.map((link, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={link.path}
                  color="grey.300"
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Support
            </Typography>
            <Stack spacing={1}>
              {footerLinks.support.map((link, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={link.path}
                  color="grey.300"
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    color: 'grey.400',
                    '&:hover': {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {currentYear} Real Estate Portal. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              component={RouterLink}
              to="/privacy"
              color="grey.400"
              sx={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: 'white' }
              }}
            >
              Privacy Policy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="grey.400"
              sx={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: 'white' }
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
