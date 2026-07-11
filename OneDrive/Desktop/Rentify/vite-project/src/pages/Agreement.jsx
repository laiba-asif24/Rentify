// client/src/pages/Agreement.jsx - FULL FIXED VERSION

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Divider, Checkbox, FormControlLabel, Alert, CircularProgress, Grid } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CheckCircle, Shield, Clock, MapPin, User, Calendar, DollarSign, ArrowLeft, Loader2, FileText } from 'lucide-react';

const Agreement = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        console.log('📦 Booking data:', res.data);
        setBooking(res.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error:', err);
        setError('Failed to load booking details');
        setLoading(false);
      }
    };
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleConfirm = async () => {
    if (!agreed) {
      setError('Please agree to the terms before confirming');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.put(`/bookings/${bookingId}`, { status: 'confirmed' });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm booking');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <CircularProgress sx={{ color: 'var(--sage)' }} />
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', pt: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'var(--slate)' }}>Booking not found</Typography>
      </Box>
    );
  }

  // ✅ SAFE DATE CALCULATION
  const startDate = booking?.startDate ? new Date(booking.startDate) : null;
  const endDate = booking?.endDate ? new Date(booking.endDate) : null;
  const days = startDate && endDate ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) : 0;
  const subtotal = days * (booking?.item?.pricePerDay || 0);
  const serviceFee = Math.round(subtotal * 0.1);
  const deposit = booking?.item?.deposit || 0;
  const total = subtotal + serviceFee + deposit;

  // ✅ SAFE FORMATTING
  const formatDate = (date) => {
    if (!date) return 'Not set';
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', pt: '110px', pb: 10 }}>
      <Container maxWidth="md">

        <Box sx={{ mb: 5 }}>
          <Box className="eyebrow" sx={{ mb: 1.5 }}>Confirm Booking</Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, color: 'var(--ink)' }}>
            Review & Confirm
          </Typography>
          <Typography sx={{ color: 'var(--slate)', fontSize: '15px', mt: 0.5 }}>
            Please review the booking details and agree to the terms
          </Typography>
        </Box>

        {success ? (
          <Alert icon={<CheckCircle size={18} />} severity="success" sx={{ borderRadius: '12px', p: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>Booking Confirmed!</Typography>
            <Typography sx={{ fontSize: '14px' }}>Redirecting to dashboard...</Typography>
          </Alert>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Item Summary */}
              <Box sx={{ bgcolor: 'white', borderRadius: '18px', border: '1px solid var(--line)', p: { xs: 3, md: 4 } }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 2 }}>
                  ITEM DETAILS
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, bgcolor: 'var(--cream)' }}>
                    {booking?.item?.images?.[0] ? (
                      <Box component="img" src={booking.item.images[0]} alt={booking.item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)' }}>
                        <FileText size={30} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.2rem', color: 'var(--ink)' }}>
                      {booking?.item?.title || 'Item'}
                    </Typography>
                    <Typography sx={{ color: 'var(--slate)', fontSize: '14px' }}>
                      {booking?.item?.category || 'Uncategorized'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                      <MapPin size={14} color="var(--slate)" />
                      <Typography sx={{ fontSize: '13px', color: 'var(--slate)' }}>
                        {booking?.item?.location?.city || 'Unknown'}, {booking?.item?.location?.area || ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Booking Details */}
              <Box sx={{ bgcolor: 'white', borderRadius: '18px', border: '1px solid var(--line)', p: { xs: 3, md: 4 } }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 2 }}>
                  BOOKING DETAILS
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'var(--cream)', borderRadius: '12px' }}>
                      <Calendar size={18} color="var(--sage)" />
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: 'var(--slate)' }}>PICKUP DATE</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
                          {formatDate(booking?.startDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'var(--cream)', borderRadius: '12px' }}>
                      <Calendar size={18} color="var(--sage)" />
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: 'var(--slate)' }}>RETURN DATE</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
                          {formatDate(booking?.endDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'var(--cream)', borderRadius: '12px' }}>
                      <User size={18} color="var(--sage)" />
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: 'var(--slate)' }}>RENTER</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
                          {user?.name || 'You'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'var(--cream)', borderRadius: '12px' }}>
                      <Clock size={18} color="var(--sage)" />
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: 'var(--slate)' }}>DURATION</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
                          {days} day{days > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Price Breakdown */}
              <Box sx={{ bgcolor: 'white', borderRadius: '18px', border: '1px solid var(--line)', p: { xs: 3, md: 4 } }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 2 }}>
                  PRICE BREAKDOWN
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <PriceRow label={`${booking?.item?.title || 'Item'} (${days} days)`} value={subtotal} />
                  <PriceRow label="Service fee (10%)" value={serviceFee} />
                  <PriceRow label="Security deposit" value={deposit} />
                  <Divider sx={{ my: 1 }} />
                  <PriceRow label="Total" value={total} bold />
                </Box>

                <Box sx={{ mt: 3, p: 2.5, bgcolor: 'rgba(62,124,107,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Shield size={20} color="var(--sage)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                      Security deposit protection
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--slate)', lineHeight: 1.5 }}>
                      Your deposit is held securely and refunded within 48 hours after item is returned in good condition.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Terms */}
              <Box sx={{ bgcolor: 'white', borderRadius: '18px', border: '1px solid var(--line)', p: { xs: 3, md: 4 } }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 2 }}>
                  TERMS & CONDITIONS
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TermItem text="You agree to return the item in the same condition as received." />
                  <TermItem text="Late returns will incur an additional daily fee." />
                  <TermItem text="Any damage beyond normal wear and tear will be deducted from the deposit." />
                  <TermItem text="You must provide valid CNIC at pickup." />
                  <TermItem text="Cancellations must be made at least 24 hours in advance." />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        sx={{
                          color: 'var(--slate)',
                          '&.Mui-checked': { color: 'var(--sage)' },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '14px', color: 'var(--ink)' }}>
                        I agree to all the terms and conditions
                      </Typography>
                    }
                  />
                </Box>
              </Box>

              <Button
                onClick={handleConfirm}
                disabled={submitting || !agreed}
                fullWidth
                sx={{
                  bgcolor: 'var(--ink)',
                  color: 'var(--cream)',
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: '100px',
                  '&:hover': { bgcolor: 'var(--sage)' },
                  '&.Mui-disabled': { bgcolor: 'var(--line)', color: 'var(--slate)' },
                  transition: 'all 0.3s var(--ease)',
                }}
              >
                {submitting ? (
                  <><Loader2 size={20} className="spin-agreement" /> Confirming...</>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </Box>
          </>
        )}

      </Container>

      <style>{`
        @keyframes spinAgreement { to { transform: rotate(360deg); } }
        .spin-agreement { animation: spinAgreement 0.8s linear infinite; }
      `}</style>
    </Box>
  );
};

// Helper Components
const PriceRow = ({ label, value, bold = false }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography sx={{ 
      fontSize: bold ? '15px' : '14px', 
      fontWeight: bold ? 700 : 400,
      color: bold ? 'var(--ink)' : 'var(--slate)',
    }}>
      {label}
    </Typography>
    <Typography sx={{ 
      fontSize: bold ? '16px' : '14px', 
      fontWeight: bold ? 700 : 500,
      color: bold ? 'var(--ink)' : 'var(--slate)',
      fontFamily: bold ? '"Fraunces", serif' : 'inherit',
    }}>
      Rs {value.toLocaleString()}
    </Typography>
  </Box>
);

const TermItem = ({ text }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
    <CheckCircle size={16} color="var(--sage)" style={{ marginTop: 2, flexShrink: 0 }} />
    <Typography sx={{ fontSize: '13.5px', color: 'var(--slate)', lineHeight: 1.6 }}>
      {text}
    </Typography>
  </Box>
);

export default Agreement;