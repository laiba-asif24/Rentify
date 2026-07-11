import { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Chip, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, MessageCircle, ChevronLeft, ChevronRight, Check, Clock, TrendingUp, X } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const sampleReviews = [
  { name: 'Jordan K', text: 'Item was exactly as described, pickup was smooth and the owner was very responsive throughout.' },
  { name: 'Fatima S', text: 'Great experience, would definitely rent from here again. Everything worked perfectly.' },
];

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  const [activeImg, setActiveImg] = useState(0);
  const [viewDate, setViewDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  //  FETCH ITEM FROM BACKEND
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/items/${id}`);
        console.log('📦 Item fetched:', res.data);
        setItem(res.data);
        setLoading(false);
      } catch (err) {
        console.error(' Error fetching item:', err);
        setError('Item not found');
        setLoading(false);
      }
    };
    if (id) {
      fetchItem();
    }
  }, [id]);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [item]);

  // ✅ SHOW ALERT FUNCTION
  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
    setTimeout(() => {
      setAlertOpen(false);
    }, 5000);
  };

  // ✅ CALENDAR FUNCTIONS
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getMonthCells = () => {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };
  const cells = getMonthCells();

  const isSameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
  const isPast = (d) => d < today;
  const isSelected = (d) => isSameDay(d, startDate) || isSameDay(d, endDate);
  const isInRange = (d) => startDate && endDate && d > startDate && d < endDate;

  const handleDayClick = (d) => {
    if (!d || isPast(d)) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(d);
      setEndDate(null);
    } else if (d < startDate) {
      setStartDate(d);
      setEndDate(null);
    } else if (isSameDay(d, startDate)) {
      setEndDate(d);
    } else {
      setEndDate(d);
    }
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const canGoPrev = year > today.getFullYear() || month > today.getMonth();
  const prevMonth = () => canGoPrev && setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = startDate && endDate
    ? Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : startDate ? 1 : 0;
  const subtotal = days * (item?.pricePerDay || 0);
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const priceTiers = [1, 3, 7].map((d) => ({ days: d, total: d * (item?.pricePerDay || 0) }));
  const applyTier = (d) => {
    const start = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + (d - 1) * 24 * 60 * 60 * 1000);
    setStartDate(start);
    setEndDate(d === 1 ? start : end);
    setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
  };

  const fmtShort = (d) => d ? `${monthNames[d.getMonth()].slice(0, 3)} ${d.getDate()}` : '—';

  // ✅ BOOKING FUNCTION WITH USER CNIC
  const handleBook = async () => {
    // Check if user is logged in
    if (!user) {
      showAlert('Please login first to book an item', 'warning');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    // Check if dates are selected
    if (!startDate || !endDate) {
      showAlert('Please select pickup and return dates first', 'warning');
      return;
    }

    // Check if dates are valid
    if (startDate > endDate) {
      showAlert('Pickup date must be before return date', 'error');
      return;
    }

    setBookingLoading(true);
    setBookingError('');


  try {
    const bookingData = {
      itemId: item._id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      agreementAccepted: true,
      renterCnic: user?.cnic || '00000-0000000-0'  //
    };


      console.log('📤 Sending booking request:', bookingData);

      const res = await api.post('/bookings', bookingData);
      console.log(' Booking created:', res.data);

      setBookingSuccess(true);
      showAlert(' Booking request sent successfully! Waiting for owner approval.', 'success');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error(' Booking error:', err);
      setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      showAlert(err.response?.data?.message || 'Failed to create booking. Please try again.', 'error');
      setBookingLoading(false);
    }
  };

  // ✅ SEND MESSAGE FUNCTION WITH ALERT
  const handleSendMessage = () => {
    showAlert('Please create a booking first to chat with the owner.', 'info');
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <CircularProgress sx={{ color: 'var(--sage)' }} />
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--cream)', pt: '110px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1.3rem', color: 'var(--ink)', fontWeight: 600, mb: 1 }}>Item not found</Typography>
          <Typography onClick={() => navigate('/browse')} sx={{ color: 'var(--sage)', cursor: 'pointer', fontWeight: 600 }}>
            ← Back to Browse
          </Typography>
        </Box>
      </Box>
    );
  }

  const owner = item.owner || { name: 'Unknown', rating: 0, reviews: 0, verified: false, respondsIn: 'N/A', responseRate: 0 };
  const images = item.images?.length > 0 ? item.images : ['https://via.placeholder.com/600x400.png?text=No+Image'];

  return (
    <Box sx={{ backgroundColor: 'var(--cream)', minHeight: '100vh', pt: '110px', pb: 10 }}>
      <Container maxWidth="lg">

        {/* ✅ PAGE ALERT - Like AddItem */}
        <Snackbar
          open={alertOpen}
          autoHideDuration={5000}
          onClose={() => setAlertOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={() => setAlertOpen(false)}
            severity={alertSeverity}
            sx={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(14,26,43,0.12)',
              width: '100%',
              minWidth: '300px',
              '& .MuiAlert-icon': {
                fontSize: '20px'
              }
            }}
            iconMapping={{
              success: <Check size={20} />,
              error: <X size={20} />,
              warning: <Clock size={20} />,
              info: <ShieldCheck size={20} />
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
              {alertMessage}
            </Typography>
          </Alert>
        </Snackbar>

        {/* Back link */}
        <Box component={RouterLink} to="/browse"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, textDecoration: 'none', color: 'var(--slate)', fontSize: '14px', fontWeight: 600, mb: 4, transition: 'color 0.2s ease', '&:hover': { color: 'var(--sage)' } }}>
          <ChevronLeft size={16} /> Back to Browse
        </Box>

        {/* ── ROW 1: Gallery LEFT | Booking Card RIGHT ── */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>

          {/* LEFT — Gallery */}
          <Box sx={{ flex: '1 1 0', minWidth: 0, width: '100%' }}>
            <Box>
              {/* Category + verified */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={item.category} sx={{ bgcolor: 'white', color: 'var(--ink)', fontWeight: 600, fontSize: '12.5px', border: '1px solid var(--line)' }} />
                {item.isAvailable && (
                  <Chip label="Available" sx={{ bgcolor: 'rgba(62,124,107,0.1)', color: 'var(--sage)', fontWeight: 600, fontSize: '12.5px' }} />
                )}
              </Box>

              {/* Title */}
              <Typography variant="h2" sx={{ fontFamily: '"Fraunces", serif', fontSize: { xs: '1.6rem', md: '2rem' }, color: 'var(--ink)', mb: 2.5, lineHeight: 1.15 }}>
                {item.title}
              </Typography>

              {/* Main image */}
              <Box sx={{ borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow)', height: { xs: 260, md: 460 }, width: '100%', bgcolor: 'var(--line)' }}>
                <Box component="img" src={images[activeImg]} alt={item.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </Box>

              {/* Thumbnails */}
              {images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  {images.map((g, i) => (
                    <Box key={i} onClick={() => setActiveImg(i)}
                      sx={{ width: 64, height: 64, borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: activeImg === i ? '2px solid var(--sage)' : '2px solid transparent', opacity: activeImg === i ? 1 : 0.65, transition: 'opacity 0.2s ease, border-color 0.2s ease', '&:hover': { opacity: 1 } }}>
                      <Box component="img" src={g} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* RIGHT — Booking Card */}
          <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '320px' }, position: 'sticky', top: '110px' }}>
            <Box sx={{ bgcolor: 'white', borderRadius: '20px', border: '1px solid var(--line)', boxShadow: 'var(--shadow)', p: 2.5 }}>

              {/* Calendar header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>{monthNames[month]} {year}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box onClick={prevMonth} sx={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canGoPrev ? 'pointer' : 'default', opacity: canGoPrev ? 1 : 0.25, '&:hover': canGoPrev ? { bgcolor: 'var(--cream-dim)' } : {} }}>
                    <ChevronLeft size={16} color="var(--ink)" />
                  </Box>
                  <Box onClick={nextMonth} sx={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'var(--cream-dim)' } }}>
                    <ChevronRight size={16} color="var(--ink)" />
                  </Box>
                </Box>
              </Box>

              {/* Day labels */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', mb: 0.5 }}>
                {dayLabels.map((d) => (
                  <Typography key={d} sx={{ textAlign: 'center', fontSize: '11px', color: 'var(--slate)', fontWeight: 600 }}>{d}</Typography>
                ))}
              </Box>

              {/* Calendar cells */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', mb: 2.5 }}>
                {cells.map((d, i) => {
                  const disabled = !d || isPast(d);
                  const selected = d && isSelected(d);
                  const inRange = d && isInRange(d);
                  return (
                    <Box key={i} onClick={() => handleDayClick(d)}
                      sx={{
                        aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', fontSize: '12.5px', fontWeight: selected ? 700 : 500,
                        color: disabled ? 'var(--line)' : selected ? 'white' : 'var(--ink)',
                        bgcolor: selected ? 'var(--sage)' : inRange ? 'rgba(62,124,107,0.15)' : 'transparent',
                        cursor: disabled ? 'default' : 'pointer', transition: 'all 0.15s ease',
                        '&:hover': !disabled && !selected ? { bgcolor: 'rgba(62,124,107,0.1)' } : {},
                      }}>
                      {d ? d.getDate() : ''}
                    </Box>
                  );
                })}
              </Box>

              {/* Pickup / Drop off */}
              <Box sx={{ display: 'flex', textAlign: 'center', mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)' }}>PICKUP</Typography>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>{fmtShort(startDate)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)' }}>DROP OFF</Typography>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>{fmtShort(endDate)}</Typography>
                </Box>
              </Box>

              {(startDate || endDate) && (
                <Typography onClick={clearDates} sx={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--sage)', cursor: 'pointer', fontWeight: 600, mb: 2, '&:hover': { textDecoration: 'underline' } }}>
                  Clear dates
                </Typography>
              )}

              {/* Price summary */}
              <Box sx={{ borderTop: '1px dashed var(--line)', pt: 2, mb: 2 }}>
                {days > 0 ? (
                  <>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.7rem', fontWeight: 600, color: 'var(--ink)', textAlign: 'center' }}>
                      Rs {total.toLocaleString()}
                    </Typography>
                    <Typography sx={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--slate)' }}>
                      For {days} day{days > 1 ? 's' : ''} (incl. Rs {serviceFee.toLocaleString()} service fee)
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ textAlign: 'center', fontSize: '13px', color: 'var(--slate)' }}>Select pickup and drop-off dates</Typography>
                )}
              </Box>

              {/* Book button */}
              <Box onClick={handleBook}
                sx={{
                  bgcolor: 'var(--ink)',
                  color: 'var(--cream)',
                  textAlign: 'center',
                  py: 1.7,
                  borderRadius: '100px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: bookingLoading ? 'not-allowed' : 'pointer',
                  opacity: bookingLoading ? 0.6 : 1,
                  transition: 'all 0.3s var(--ease)',
                  '&:hover': {
                    bgcolor: !bookingLoading ? 'var(--sage)' : 'var(--ink)',
                    transform: !bookingLoading ? 'translateY(-2px)' : 'none'
                  },
                  mb: 1
                }}
              >
                {bookingLoading ? (
                  <><CircularProgress size={20} sx={{ color: 'white', mr: 1 }} /> Processing...</>
                ) : (
                  'Request to Book'
                )}
              </Box>
              <Typography sx={{ textAlign: 'center', fontSize: '12px', color: 'var(--slate)', mb: 2.5 }}>
                You won't be charged yet
              </Typography>

              {/* Price tiers */}
              <Box sx={{ borderTop: '1px solid var(--line)', pt: 2.5 }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', letterSpacing: '0.08em', mb: 1.5 }}>PRICES FOR ALL PERIODS</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {priceTiers.map((tier) => (
                    <Box key={tier.days} onClick={() => applyTier(tier.days)}
                      sx={{ flex: 1, textAlign: 'center', border: '1px solid var(--line)', borderRadius: '12px', py: 1.4, cursor: 'pointer', bgcolor: 'var(--cream)', transition: 'all 0.2s ease', '&:hover': { borderColor: 'var(--sage)', bgcolor: 'rgba(62,124,107,0.05)' } }}>
                      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Rs {tier.total.toLocaleString()}</Typography>
                      <Typography sx={{ fontSize: '11px', color: 'var(--slate)', mt: 0.3 }}>{tier.days} day{tier.days > 1 ? 's' : ''}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

            </Box>
          </Box>
        </Box>

        {/* ── ROW 2: Owner + Map ── */}
        <Box sx={{ mt: 4, bgcolor: 'white', border: '1px solid var(--line)', borderRadius: '18px', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* LEFT half — Owner info */}
            <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
              <Box sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                    {owner.name?.[0] || 'U'}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: 'var(--slate)' }}>Owned by</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>{owner.name || 'Unknown'}</Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '13px', color: 'var(--slate)', mt: 0.3 }}>
                      <Star size={13} fill="var(--amber)" color="var(--amber)" /> {owner.rating || 0} · {owner.reviews || 0} reviews
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '13.5px', color: 'var(--ink)' }}>
                    <MapPin size={15} color="var(--slate)" /> {item.location?.city}, {item.location?.area || 'Nearby'}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '13.5px', color: 'var(--ink)' }}>
                    <Clock size={15} color="var(--slate)" /> Available Now
                  </Box>
                </Box>

                {/* ✅ SEND MESSAGE BUTTON WITH PAGE ALERT */}
                <Box onClick={handleSendMessage}
                  sx={{ border: '1px solid var(--line)', borderRadius: '100px', py: 1.4, textAlign: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'all 0.2s ease', '&:hover': { borderColor: 'var(--sage)', color: 'var(--sage)' } }}>
                  <MessageCircle size={16} /> Send message
                </Box>
              </Box>
            </Box>

            {/* RIGHT half — Map */}
            <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
              <Box sx={{ height: { xs: 260, md: '100%' }, minHeight: 300, position: 'relative', overflow: 'hidden', bgcolor: 'var(--cream)' }}>
                <Box
                  component="iframe"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=67.0%2C24.8%2C67.2%2C25.0&layer=mapnik&marker=24.9%2C67.1`}
                  title="Item location"
                  sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, filter: 'grayscale(15%)', display: 'block' }}
                />
              </Box>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '12px', color: 'var(--slate)', fontStyle: 'italic', px: 3, pb: 2.5, pt: 1.5, borderTop: '1px solid var(--line)' }}>
            Exact pickup address is shared once booking is confirmed.
          </Typography>
        </Box>

        {/* ── ROW 3: Description ── */}
        <Box sx={{ mt: 6 }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.2rem', color: 'var(--ink)', mb: 1.5 }}>Description</Typography>
          <Typography sx={{ color: 'var(--slate)', fontSize: '15px', lineHeight: 1.8, mb: 3 }}>{item.description}</Typography>
        </Box>

        {/* ── ROW 4: Reviews ── */}
        <Box sx={{ mt: 6 }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.4rem', color: 'var(--ink)', mb: 3 }}>Reviews</Typography>
          <Grid container spacing={2.5}>
            {sampleReviews.map((r, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box sx={{ bgcolor: 'white', border: '1px solid var(--line)', borderRadius: '16px', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'var(--ink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{r.name[0]}</Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{r.name}</Typography>
                      <Typography sx={{ fontSize: '11.5px', color: 'var(--amber)' }}>★★★★★</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: 'var(--slate)', fontSize: '14px', lineHeight: 1.7 }}>{r.text}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Container>
    </Box>
  );
};

export default ItemDetail;