// client/src/pages/Browse.jsx

import { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, TextField, InputAdornment, Chip, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';

const categoryList = ['All', 'Tools', 'Cameras', 'Camping', 'Party & events', 'Sports & bikes', 'Audio & tech'];

const priceBands = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under Rs 500', min: 0, max: 500 },
  { label: 'Rs 500 – 1500', min: 500, max: 1500 },
  { label: 'Rs 1500+', min: 1500, max: Infinity },
];

const Browse = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'All');
  const [activePriceBand, setActivePriceBand] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await api.get('/items');
        setAllItems(res.data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (urlCategory) setActiveCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.1 },
    );
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [activeCategory, search, allItems]);

  const filtered = allItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !search.trim() || item.title?.toLowerCase().includes(search.toLowerCase());
    const band = priceBands[activePriceBand];
    const matchesPrice = item.pricePerDay >= band.min && item.pricePerDay <= band.max;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [activeCategory, search, activePriceBand]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    const next = {};
    if (cat !== 'All') next.category = cat;
    setSearchParams(next);
  };

  const handleSearchSubmit = () => {
    if (!search.trim()) return;
    navigate(`/search?search=${encodeURIComponent(search.trim())}${activeCategory !== 'All' ? `&category=${encodeURIComponent(activeCategory)}` : ''}`);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <CircularProgress sx={{ color: 'var(--purple)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 10 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>

        <Box className="reveal" sx={{ mb: 5 }}>
          <Box className="eyebrow" sx={{ mb: 1.5 }}>Browse items</Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, color: 'var(--ink)', mb: 1 }}>
            {filtered.length} items available nearby
          </Typography>
          <Typography sx={{ color: 'var(--slate)', fontSize: '15px' }}>
            Filter by category or price, and book directly from the owner.
          </Typography>
        </Box>

        <Box className="reveal" sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'var(--bg-card)',
          borderRadius: '100px',
          p: '6px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          border: '1px solid var(--line)',
          mb: 3,
          maxWidth: 560,
          transition: 'all 0.3s ease',
          '&:focus-within': { borderColor: 'rgba(139,92,246,0.3)', boxShadow: '0 12px 40px rgba(139,92,246,0.12)' },
        }}>
          <TextField
            placeholder="Search for a drill, tent, camera..."
            variant="standard"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="var(--slate)" style={{ marginLeft: 12 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& input': { fontSize: '14.5px', color: 'var(--ink)', py: 1.2 },
              '& .MuiInput-underline:before': { borderBottom: 'none' },
              '& .MuiInput-underline:after': { borderBottom: 'none' },
            }}
          />
          <Box
            onClick={handleSearchSubmit}
            sx={{
              bgcolor: 'var(--sage)',
              color: 'white',
              borderRadius: '100px',
              px: 2.5,
              py: 1,
              mr: 0.5,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.25s var(--ease)',
              '&:hover': { bgcolor: 'var(--sage-light)', transform: 'scale(1.03)' },
            }}
          >
            Search
          </Box>
        </Box>

        <Box className="reveal" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 2.5 }}>
          {categoryList.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => handleCategoryClick(cat)}
              sx={{
                fontSize: '13px',
                fontWeight: 600,
                px: 1,
                py: 2.3,
                borderRadius: '100px',
                bgcolor: activeCategory === cat ? 'var(--purple)' : 'var(--bg-card)',
                color: activeCategory === cat ? 'white' : 'var(--slate)',
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--purple)' : 'var(--line)',
                transition: 'all 0.25s ease',
                '&:hover': { bgcolor: activeCategory === cat ? 'var(--purple-light)' : 'var(--bg-card-hover)', borderColor: 'var(--purple-light)' },
              }}
            />
          ))}
        </Box>

        <Box className="reveal" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 6 }}>
          {priceBands.map((band, i) => (
            <Chip
              key={band.label}
              label={band.label}
              onClick={() => setActivePriceBand(i)}
              sx={{
                fontSize: '12.5px',
                fontWeight: 600,
                px: 0.5,
                py: 2,
                borderRadius: '100px',
                bgcolor: activePriceBand === i ? 'rgba(64,159,122,0.2)' : 'transparent',
                color: activePriceBand === i ? 'var(--sage-light)' : 'var(--slate)',
                border: '1px dashed',
                borderColor: activePriceBand === i ? 'var(--sage)' : 'var(--line)',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 600, mb: 1 }}>No items match your filters</Typography>
            <Typography sx={{ color: 'var(--slate)', fontSize: '14px' }}>Try a different category or widen your price range.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} className="reveal-stagger">
            {paginated.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Box className="listing-card" onClick={() => navigate(`/item/${item._id}`)}>
                  <Box className="listing-media">
                    <Box component="img" src={item.images?.[0] || 'https://via.placeholder.com/400'} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(22,22,30,0.9)', borderRadius: '100px', px: 1.5, py: 0.5, fontSize: '12px', fontWeight: 600, color: 'var(--ink)', border: '1px solid var(--line)' }}>
                      {item.category}
                    </Box>
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.1rem', color: 'var(--ink)', mb: 0.8 }}>{item.title}</Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={13} /> {item.location?.city}, {item.location?.area}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.3rem', fontWeight: 600, color: 'var(--purple-light)' }}>
                        Rs {item.pricePerDay}
                        <Box component="span" sx={{ fontSize: '13px', fontWeight: 400, color: 'var(--slate)' }}>/day</Box>
                      </Typography>
                      <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', transition: 'background 0.2s ease', '&:hover': { bgcolor: 'var(--purple-light)' } }}>↗</Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {filtered.length > perPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 7 }}>
            <Box
              onClick={() => page > 1 && setPage(page - 1)}
              sx={{
                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--line)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1,
                transition: 'all 0.2s ease', bgcolor: 'var(--bg-card)', '&:hover': page > 1 ? { borderColor: 'var(--purple)' } : {},
              }}
            >
              <ChevronLeft size={16} color="var(--ink)" />
            </Box>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <Box
                key={num}
                onClick={() => setPage(num)}
                sx={{
                  width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13.5px', fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', cursor: 'pointer',
                  bgcolor: page === num ? 'var(--purple)' : 'var(--bg-card)', color: page === num ? 'white' : 'var(--slate)',
                  border: '1px solid', borderColor: page === num ? 'var(--purple)' : 'var(--line)',
                  transition: 'all 0.2s ease',
                }}
              >
                {num}
              </Box>
            ))}
            <Box
              onClick={() => page < totalPages && setPage(page + 1)}
              sx={{
                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--line)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1,
                transition: 'all 0.2s ease', bgcolor: 'var(--bg-card)', '&:hover': page < totalPages ? { borderColor: 'var(--purple)' } : {},
              }}
            >
              <ChevronRight size={16} color="var(--ink)" />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Browse;
