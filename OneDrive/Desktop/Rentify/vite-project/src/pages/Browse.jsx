// client/src/pages/Browse.jsx

import { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, TextField, InputAdornment, Chip, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';  // ✅ ADD THIS

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
  const urlSearch = searchParams.get('search');
  const urlCity = searchParams.get('city');

  // ✅ REAL DATA STATE
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(urlSearch || '');
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'All');
  const [activePriceBand, setActivePriceBand] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 6;

  // ✅ FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await api.get('/items');
        console.log('📦 Items fetched:', res.data);
        setAllItems(res.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching items:', err);
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (urlCategory) setActiveCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    setSearch(urlSearch || '');
  }, [urlSearch]);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [activeCategory, search, allItems]);

  // ✅ FILTER LOGIC
  const filtered = allItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase());
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
    if (search.trim()) next.search = search.trim();
    if (urlCity) next.city = urlCity;
    setSearchParams(next);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    const next = {};
    if (activeCategory !== 'All') next.category = activeCategory;
    if (value.trim()) next.search = value.trim();
    if (urlCity) next.city = urlCity;
    setSearchParams(next, { replace: true });
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
        <Box className="reveal in" sx={{ mb: 5 }}>
          <Box className="eyebrow" sx={{ mb: 1.5 }}>Browse items</Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, color: 'var(--ink)', mb: 1 }}>
            {search.trim() ? `${filtered.length} results for "${search.trim()}"` : `${filtered.length} items available nearby`}
          </Typography>
          <Typography sx={{ color: 'var(--slate)', fontSize: '15px' }}>
            {urlCity ? `Showing results near ${urlCity}. ` : ''}Search, filter by category or price, and book directly from the owner.
          </Typography>
        </Box>

        {/* Search bar */}
        <Box className="reveal in" sx={{
          display: 'flex', alignItems: 'center', bgcolor: 'white', borderRadius: '100px', p: '6px',
          boxShadow: '0 12px 30px rgba(14,26,43,0.08)', border: '1px solid var(--line)', mb: 3, maxWidth: 560,
        }}>
          <TextField
            placeholder="Search for a drill, tent, camera..."
            variant="standard" fullWidth value={search} onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Search size={16} color="var(--slate)" style={{ marginLeft: 12 }} /></InputAdornment> }}
            sx={{
              '& input': { fontSize: '14.5px', color: 'var(--ink)', py: 1.2 },
              '& .MuiInput-underline:before': { borderBottom: 'none' },
              '& .MuiInput-underline:after': { borderBottom: 'none' },
              '& .MuiInput-root:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
              '& .MuiInputBase-root::before': { borderBottom: 'none !important' },
              '& .MuiInputBase-root::after': { borderBottom: 'none !important' },
            }}
          />
        </Box>

        {/* Category chips */}
        <Box className="reveal in" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 2.5 }}>
          {categoryList.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => handleCategoryClick(cat)}
              sx={{
                fontSize: '13px', fontWeight: 600, px: 1, py: 2.3, borderRadius: '100px',
                bgcolor: activeCategory === cat ? 'var(--ink)' : 'white',
                color: activeCategory === cat ? 'var(--cream)' : 'var(--slate)',
                border: '1px solid', borderColor: activeCategory === cat ? 'var(--ink)' : 'var(--line)',
                transition: 'all 0.25s ease',
                '&:hover': { bgcolor: activeCategory === cat ? 'var(--ink)' : 'rgba(62,124,107,0.08)', borderColor: 'var(--sage)' },
              }}
            />
          ))}
        </Box>

        {/* Price band chips */}
        <Box className="reveal in" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 6 }}>
          {priceBands.map((band, i) => (
            <Chip
              key={band.label}
              label={band.label}
              onClick={() => setActivePriceBand(i)}
              sx={{
                fontSize: '12.5px', fontWeight: 600, px: 0.5, py: 2, borderRadius: '100px',
                bgcolor: activePriceBand === i ? 'var(--sage)' : 'transparent',
                color: activePriceBand === i ? 'white' : 'var(--slate)',
                border: '1px dashed', borderColor: activePriceBand === i ? 'var(--sage)' : 'var(--line)',
                transition: 'all 0.25s ease',
                '&:hover': { borderColor: 'var(--sage)', color: activePriceBand === i ? 'white' : 'var(--sage)' },
              }}
            />
          ))}
        </Box>

        {/* Grid */}
        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 600, mb: 1 }}>No items match your filters</Typography>
            <Typography sx={{ color: 'var(--slate)', fontSize: '14px' }}>Try a different category or widen your price range.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} className="reveal-stagger in">
            {paginated.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Box className="listing-card" onClick={() => navigate(`/item/${item._id}`)}>
                  <Box className="listing-media">
                    <Box component="img" src={item.images?.[0] || 'https://via.placeholder.com/400'} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'white', borderRadius: '100px', px: 1.5, py: 0.5, fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{item.category}</Box>
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.1rem', color: 'var(--ink)', mb: 0.8 }}>{item.title}</Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={13} /> {item.location?.city}, {item.location?.area}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)' }}>
                        Rs {item.pricePerDay}<Box component="span" sx={{ fontSize: '13px', fontWeight: 400, color: 'var(--slate)' }}>/day</Box>
                      </Typography>
                      <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', transition: 'background 0.2s ease', '&:hover': { bgcolor: 'var(--sage)' } }}>↗</Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {filtered.length > perPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 7 }}>
            <Box
              onClick={() => page > 1 && setPage(page - 1)}
              sx={{
                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--line)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1,
                transition: 'all 0.2s ease', bgcolor: 'white', '&:hover': page > 1 ? { borderColor: 'var(--sage)' } : {},
              }}>
              <ChevronLeft size={16} color="var(--ink)" />
            </Box>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <Box
                key={num}
                onClick={() => setPage(num)}
                sx={{
                  width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13.5px', fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', cursor: 'pointer',
                  bgcolor: page === num ? 'var(--ink)' : 'white', color: page === num ? 'var(--cream)' : 'var(--slate)',
                  border: '1px solid', borderColor: page === num ? 'var(--ink)' : 'var(--line)',
                  transition: 'all 0.2s ease', '&:hover': { borderColor: 'var(--sage)' },
                }}>
                {num}
              </Box>
            ))}

            <Box
              onClick={() => page < totalPages && setPage(page + 1)}
              sx={{
                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--line)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1,
                transition: 'all 0.2s ease', bgcolor: 'white', '&:hover': page < totalPages ? { borderColor: 'var(--sage)' } : {},
              }}>
              <ChevronRight size={16} color="var(--ink)" />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Browse;