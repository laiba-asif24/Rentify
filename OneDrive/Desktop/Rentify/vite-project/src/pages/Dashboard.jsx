// client/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Package, Calendar, MessageCircle, Star, ChevronRight, Clock, Check, X } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('renter');
  const [myListings, setMyListings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [stats, setStats] = useState({
    listings: 0,
    bookings: 0,
    pending: 0,
    rating: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const listingsRes = await api.get('/items/my');
        setMyListings(listingsRes.data);
        
        const bookingsRes = await api.get('/bookings/my');
        setMyBookings(bookingsRes.data);
        
        const incomingRes = await api.get('/bookings/owner');
        setIncomingBookings(incomingRes.data);
        
        setStats({
          listings: listingsRes.data.length,
          bookings: bookingsRes.data.length,
          pending: incomingRes.data.filter(b => b.status === 'pending').length,
          rating: 4.8
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const statusStyle = (s) => {
    if (s === 'approved' || s === 'confirmed') return { bg: 'rgba(62,124,107,0.1)', color: 'var(--sage)', label: 'Approved' };
    if (s === 'pending') return { bg: 'rgba(232,163,61,0.12)', color: '#b07d1a', label: 'Pending' };
    if (s === 'completed') return { bg: 'rgba(14,26,43,0.08)', color: 'var(--slate)', label: 'Completed' };
    if (s === 'rejected') return { bg: 'rgba(220,38,38,0.08)', color: '#dc2626', label: 'Rejected' };
    return { bg: 'rgba(62,124,107,0.1)', color: 'var(--sage)', label: s };
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <CircularProgress sx={{ color: 'var(--sage)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'var(--cream)', minHeight: '100vh', pt: '110px', pb: 10 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6, flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Box className="eyebrow" sx={{ mb: 1.5 }}>Dashboard</Box>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, color: 'var(--ink)' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
            </Typography>
            <Typography sx={{ color: 'var(--slate)', fontSize: '15px', mt: 0.5 }}>
              Manage your listings and rental requests.
            </Typography>
          </Box>
          <Box onClick={() => navigate('/add-item')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'var(--ink)', color: 'var(--cream)', px: 3, py: 1.6, borderRadius: '100px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, transition: 'all 0.3s var(--ease)', '&:hover': { bgcolor: 'var(--sage)', transform: 'translateY(-2px)' } }}>
            <Plus size={16} /> List an item
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2.5} sx={{ mb: 6 }}>
          {[
            { label: 'Active listings', value: stats.listings, icon: Package },
            { label: 'Total bookings', value: stats.bookings, icon: Calendar },
            { label: 'Pending requests', value: stats.pending, icon: Clock },
            { label: 'Avg. rating', value: stats.rating + '★', icon: Star },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ bgcolor: 'white', border: '1px solid var(--line)', borderRadius: '16px', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(62,124,107,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color="var(--sage)" />
                    </Box>
                    <Typography sx={{ fontSize: '12.5px', color: 'var(--slate)', fontWeight: 500 }}>{s.label}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{s.value}</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 5, borderBottom: '1px solid var(--line)', pb: 0 }}>
          {[
            { key: 'renter', label: 'My Bookings' },
            { key: 'owner', label: 'My Listings' },
            { key: 'incoming', label: `Incoming Requests ${incomingBookings.filter(b => b.status === 'pending').length > 0 ? `(${incomingBookings.filter(b => b.status === 'pending').length})` : ''}` },
          ].map((t) => (
            <Box key={t.key} onClick={() => setTab(t.key)}
              sx={{ px: 3, py: 1.5, cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: tab === t.key ? 'var(--ink)' : 'var(--slate)', borderBottom: tab === t.key ? '2px solid var(--ink)' : '2px solid transparent', mb: '-1px', transition: 'all 0.2s ease', '&:hover': { color: 'var(--ink)' } }}>
              {t.label}
            </Box>
          ))}
        </Box>

        {/* ── TAB: MY BOOKINGS (renter) ── */}
        {tab === 'renter' && (
          <Box>
            {myBookings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: '18px', border: '1px solid var(--line)' }}>
                <Typography sx={{ color: 'var(--slate)', fontSize: '16px' }}>No bookings yet</Typography>
                <Typography sx={{ color: 'var(--slate)', fontSize: '14px', mt: 1 }}>Browse items and rent something!</Typography>
              </Box>
            ) : (
              myBookings.map((b) => {
                const s = statusStyle(b.status);
                return (
                  <Box key={b._id} sx={{ bgcolor: 'white', border: '1px solid var(--line)', borderRadius: '18px', p: 3, mb: 2.5, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
                      <Box component="img" src={b.item?.images?.[0] || 'https://via.placeholder.com/80'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1rem', color: 'var(--ink)', mb: 0.5 }}>{b.item?.title}</Typography>
                      <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 1 }}>Owner: {b.owner?.name} · {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}</Typography>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: s.bg, px: 1.5, py: 0.5, borderRadius: '100px' }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: s.color }}>{s.label}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink)' }}>Rs {b.totalPrice?.toLocaleString()}</Typography>
                      {b.status === 'approved' && (
                        <Box onClick={() => navigate(`/chat/${b._id}`)}
                          sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.8, color: 'var(--sage)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, justifyContent: 'flex-end', '&:hover': { textDecoration: 'underline' } }}>
                          <MessageCircle size={14} /> Chat with owner
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        )}

        {/* ── TAB: MY LISTINGS (owner) ── */}
        {tab === 'owner' && (
          <Box>
            {myListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: '18px', border: '1px solid var(--line)' }}>
                <Typography sx={{ color: 'var(--slate)', fontSize: '16px' }}>No listings yet</Typography>
                <Typography sx={{ color: 'var(--slate)', fontSize: '14px', mt: 1 }}>List your first item and start earning!</Typography>
              </Box>
            ) : (
              myListings.map((l) => (
                <Box key={l._id} sx={{ bgcolor: 'white', border: '1px solid var(--line)', borderRadius: '18px', p: 3, mb: 2.5, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
                    <Box component="img" src={l.images?.[0] || 'https://via.placeholder.com/80'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1rem', color: 'var(--ink)', mb: 0.5 }}>{l.title}</Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 1 }}>{l.category} · {l.location?.city}</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: 'rgba(62,124,107,0.1)', px: 1.5, py: 0.5, borderRadius: '100px' }}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--sage)' }}>Active</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink)' }}>Rs {l.pricePerDay?.toLocaleString()}/day</Typography>
                  </Box>
                </Box>
              ))
            )}
            <Box onClick={() => navigate('/add-item')}
              sx={{ border: '2px dashed var(--line)', borderRadius: '18px', p: 4, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: 'var(--sage)', bgcolor: 'rgba(62,124,107,0.02)' } }}>
              <Plus size={24} color="var(--slate)" style={{ margin: '0 auto 8px' }} />
              <Typography sx={{ fontWeight: 600, color: 'var(--slate)', fontSize: '14px' }}>Add a new listing</Typography>
            </Box>
          </Box>
        )}

        {/* ── TAB: INCOMING REQUESTS (owner) ── */}
        {tab === 'incoming' && (
          <Box>
            {incomingBookings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: '18px', border: '1px solid var(--line)' }}>
                <Typography sx={{ color: 'var(--slate)', fontSize: '16px' }}>No incoming requests</Typography>
                <Typography sx={{ color: 'var(--slate)', fontSize: '14px', mt: 1 }}>When someone books your item, it will appear here.</Typography>
              </Box>
            ) : (
              incomingBookings.map((b) => {
                const s = statusStyle(b.status);
                return (
                  <Box key={b._id} sx={{ bgcolor: 'white', border: '1px solid var(--line)', borderRadius: '18px', p: 3, mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1rem', color: 'var(--ink)', mb: 0.5 }}>{b.item?.title}</Typography>
                        <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 1 }}>
                          Requested by <strong>{b.renter?.name}</strong> · {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', mb: 1.5 }}>
                          CNIC: {b.renterCnic || 'Not provided'}
                        </Typography>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: s.bg, px: 1.5, py: 0.5, borderRadius: '100px' }}>
                          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: s.color }}>{s.label}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink)', mb: 1.5 }}>Rs {b.totalPrice?.toLocaleString()}</Typography>
                        {b.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Box onClick={async () => {
                              try {
                                await api.put(`/bookings/${b._id}`, { status: 'approved' });
                                window.location.reload();
                              } catch (err) { console.error('Error:', err); }
                            }} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: 'rgba(62,124,107,0.08)', border: '1px solid var(--sage)', borderRadius: '100px', px: 2.5, py: 1, cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: 'var(--sage)', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'var(--sage)', color: 'white' } }}>
                              <Check size={14} /> Approve
                            </Box>
                            <Box onClick={async () => {
                              try {
                                await api.put(`/bookings/${b._id}`, { status: 'rejected' });
                                window.location.reload();
                              } catch (err) { console.error('Error:', err); }
                            }} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '100px', px: 2.5, py: 1, cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#dc2626', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'rgba(220,38,38,0.12)' } }}>
                              <X size={14} /> Reject
                            </Box>
                          </Box>
                        )}
                        {b.status === 'approved' && (
                          <Box onClick={() => navigate(`/chat/${b._id}`)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'var(--sage)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, justifyContent: 'flex-end', '&:hover': { textDecoration: 'underline' } }}>
                            <MessageCircle size={14} /> Message renter
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default Dashboard;