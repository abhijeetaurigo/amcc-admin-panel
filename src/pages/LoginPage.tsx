import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useLoginAdmin } from '../hooks/useLoginAdmin';
import type { LoginRequest } from '../types/auth';

const loginHighlights = [
  {
    title: 'Secure access',
    copy: 'JWT-protected admin authentication',
    icon: VerifiedUserOutlinedIcon,
  },
  {
    title: 'Operational oversight',
    copy: 'Tenant health, activity, and configuration control',
    icon: SettingsSuggestOutlinedIcon,
  },
  {
    title: 'Governance ready',
    copy: 'Designed for auditability and controlled administration',
    icon: ShieldOutlinedIcon,
  },
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginAdmin = useLoginAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    const normalized = value.trim();

    if (!normalized) {
      return 'Email is required.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalized)) {
      return 'Enter a valid email address.';
    }

    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Password is required.';
    }

    return '';
  };

  const emailError = (touched.email || submitAttempted) ? validateEmail(email) : '';
  const passwordError = (touched.password || submitAttempted) ? validatePassword(password) : '';
  const hasValidationErrors = Boolean(emailError || passwordError);
  const canSubmit = email.trim().length > 0 && password.length > 0 && !hasValidationErrors;
  const redirectTarget =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/dashboard';

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setError('');

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    if (nextEmailError || nextPasswordError) {
      return;
    }

    try {
      const credentials: LoginRequest = { email: email.trim(), password };

      await loginAdmin.mutateAsync(credentials);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseMessage =
          (typeof err.response?.data === 'object' &&
            err.response?.data !== null &&
            'error' in err.response.data &&
            typeof err.response.data.error === 'string' &&
            err.response.data.error) ||
          err.message;

        setError(responseMessage || 'Unable to sign in. Please check your credentials.');
        return;
      }

      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, md: 3 },
        background:
          'radial-gradient(circle at 14% 16%, rgba(1,95,116,0.18), transparent 22%), radial-gradient(circle at 88% 14%, rgba(41,126,200,0.12), transparent 20%), linear-gradient(135deg, #edf4f7 0%, #f8fbfd 44%, #eef2f6 100%)',
      }}
    >
      <Box
        sx={{
          width: 'min(1000px, 100%)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 420px' },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <Box
          sx={{
            p: { xs: 1, md: 2.5 },
            color: '#0b3b3f',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Chip
            icon={<ApartmentOutlinedIcon />}
            label="Aurigo Mobile Control Panel"
            sx={{
              width: 'fit-content',
              mb: 1.75,
              backgroundColor: 'rgba(1,95,116,0.10)',
              color: '#015F74',
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.05, maxWidth: 560 }}>
            Control tenant operations and app settings from one secure workspace.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, maxWidth: 560, color: '#4f656c', lineHeight: 1.7 }}>
            A compact admin console for tenant oversight, app configuration, and protected access to
            operational controls.
          </Typography>

          <Stack spacing={1.25} sx={{ mt: 3.25, maxWidth: 560 }}>
            {loginHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <Box
                  key={item.title}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr',
                    gap: 1.5,
                    alignItems: 'start',
                    p: 1.5,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.62)',
                    border: '1px solid rgba(1,95,116,0.08)',
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: 'rgba(1,95,116,0.08)',
                      color: '#015F74',
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#60757b', mt: 0.25, lineHeight: 1.45 }}>
                      {item.copy}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>

          <Card
            sx={{
              mt: 2.5,
              borderRadius: 1.5,
              boxShadow: 'none',
              background: 'linear-gradient(135deg, rgba(1,95,116,0.08) 0%, rgba(255,255,255,0.70) 100%)',
              border: '1px solid rgba(1,95,116,0.08)',
            }}
          >
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Typography variant="overline" sx={{ color: '#015F74', letterSpacing: 1.5 }}>
                Access Guidance
              </Typography>
              <Typography sx={{ mt: 0.75, fontWeight: 700 }}>
                Sign in with your administrator account.
              </Typography>
              <Typography variant="body2" sx={{ color: '#60757b', mt: 0.75, lineHeight: 1.55 }}>
                The panel uses the live admin API and stores the returned token locally for protected
                routes and authenticated requests.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card
          sx={{
            borderRadius: 1.5,
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(3, 42, 48, 0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,252,0.99) 100%)',
            border: '1px solid rgba(1,95,116,0.10)',
            alignSelf: 'center',
          }}
        >
          <CardContent sx={{ p: { xs: 2.75, md: 3.5 } }}>
            <Typography variant="overline" sx={{ color: '#015F74', letterSpacing: 1.8 }}>
              Admin access
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.75 }}>
              Sign in to continue
            </Typography>
            <Typography variant="body2" sx={{ color: '#60757b', mt: 0.9, lineHeight: 1.65 }}>
              Use your administrator credentials to access tenant management and platform controls.
            </Typography>

            {import.meta.env.DEV ? (
              <Box
                sx={{
                  mt: 2.25,
                  p: 1.75,
                  borderRadius: 1.25,
                  backgroundColor: 'rgba(1,95,116,0.05)',
                  border: '1px solid rgba(1,95,116,0.08)',
                }}
              >
                <Typography variant="body2" sx={{ color: '#35535a', lineHeight: 1.55 }}>
                  Authentication is handled against the live admin API. Use an administrator account
                  provisioned for this environment.
                </Typography>
              </Box>
            ) : null}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2.5 }}>
              <Stack spacing={1.75}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                  fullWidth
                  autoComplete="username"
                  autoFocus
                  error={Boolean(emailError)}
                  helperText={emailError || 'Use the administrator email tied to this environment.'}
                  placeholder="name@company.com"
                  sx={{
                    '& .MuiFormHelperText-root': {
                      ml: 0,
                      mt: 0.75,
                    },
                  }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => handlePasswordChange(event.target.value)}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  fullWidth
                  autoComplete="current-password"
                  error={Boolean(passwordError)}
                  helperText={passwordError || 'Keep your admin password private and secure.'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((current) => !current)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon fontSize="small" />
                          ) : (
                            <VisibilityOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiFormHelperText-root': {
                      ml: 0,
                      mt: 0.75,
                    },
                  }}
                />
                {error ? <Alert severity="error">{error}</Alert> : null}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loginAdmin.isPending || !canSubmit}
                  startIcon={
                    loginAdmin.isPending ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <LockOutlinedIcon />
                    )
                  }
                  sx={{
                    py: 1.35,
                    borderRadius: 1,
                    backgroundColor: '#015F74',
                    mt: 0.25,
                  }}
                >
                  {loginAdmin.isPending ? 'Signing in...' : 'Enter dashboard'}
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  Protected admin sessions use the JWT returned by the backend after sign-in.
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
