// client/src/pages/SearchResults.jsx — Hygglo-style list + map (separate from Browse)

import { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, TextField, InputAdornment, Chip, CircularProgress, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, ChevronRight, List, Map, Calendar, Star } from 'lucide-react';
import api from '../utils/api';
import BrowseMap from '../components/BrowseMap';

const categoryList = ['All', 'Tools', 'Cameras', 'Camping', 'Party & events', 'Sports & bikes', 'Audio & tech'];

const priceBands = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under Rs 500', min: 0, max: 500 },
  { label: 'Rs 500 – 1500', min: 500, max: 1500 },
  { label: 'Rs 1500+', min: 1500, max: Infinity },
];

const categoryBlurbs = {
  All: {
    title: 'Search results',
    bullets: [
      'Save money compared to buying new',
      'Pick up from verified local owners',
      'Flexible rental periods that suit you',
    ],
  },
  Tools: {
    title: 'Tools rental',
    bullets: [
      'Professional tools without the full purchase cost',
      'Ideal for one-off DIY and home projects',
      'Verified owners across major cities',
    ],
  },
  Cameras: {
    title: 'Cameras rental',
    bullets: [
      'Shoot trips and events with pro gear',
      'Try before you invest in equipment',
      'Lenses and bodies from local owners',
    ],
  },
  Camping: {
    title: 'Camping gear rental',
    bullets: [
      'Tents, stoves, and outdoor essentials',
      'Weekend trips without clutter at home',
      'Quality gear maintained by owners',
    ],
  },
};

const getBlurb = (cat) =>
  categoryBlurbs[cat] || {
    title: `${cat} rental`,
    bullets: ['Trusted local listings', 'Secure booking flow', 'Great value vs buying new'],
  };

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search');

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlSearch || '');
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'All');
  const [activePriceBand, setActivePriceBand] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('map');
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
    setSearch(urlSearch || '');
  }, [urlSearch]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.08 },
    );
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [activeCategory, search, allItems, viewMode]);

  const filtered = allItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);
    const band = priceBands[activePriceBand];
    const matchesPrice = item.pricePerDay >= band.min && item.pricePerDay <= band.max;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const blurb = getBlurb(activeCategory);
  const heading = search.trim()
    ? `${filtered.length} results for "${search.trim()}"`
    : blurb.title;

  useEffect(() => { setPage(1); }, [activeCategory, search, activePriceBand]);

  const syncParams = (cat, query) => {
    const next = {};
    if (cat && cat !== 'All') next.category = cat;
    if (query?.trim()) next.search = query.trim();
    setSearchParams(next);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    syncParams(cat, search);
  };

  const handleSearchSubmit = () => {
    syncParams(activeCategory, search);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    const next = {};
    if (activeCategory !== 'All') next.category = activeCategory;
    if (value.trim()) next.search = value.trim();
    setSearchParams(next, { replace: true });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <CircularProgress sx={{ color: 'var(--purple)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: { xs: '100px', md: '88px' }, pb: 4 }}>
      <Box className="browse-search-strip">
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', py: 1.5 }}>
            <Box
              sx={{
                flex: 1,
                minWidth: 220,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'var(--bg-card)',
                borderRadius: '100px',
                border: '1px solid var(--line)',
                pl: 0.5,
                pr: 0.5,
                py: 0.5,
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                '&:focus-within': { borderColor: 'rgba(139,92,246,0.35)', boxShadow: '0 0 0 3px rgba(139,92,246,0.12)' },
              }}
            >
              <TextField
                placeholder={activeCategory === 'All' ? 'Search items nearby…' : `Search within ${activeCategory}…`}
                variant="standard"
                fullWidth
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="var(--slate)" style={{ marginLeft: 12 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& input': { fontSize: '14.5px', color: 'var(--ink)', py: 1.2 } }}
              />
              <Button
                onClick={handleSearchSubmit}
                sx={{
                  bgcolor: 'var(--sage)',
                  color: 'white',
                  borderRadius: '100px',
                  px: 2.5,
                  py: 1,
                  minWidth: 88,
                  fontSize: '13px',
                  fontWeight: 600,
                  flexShrink: 0,
                  transition: 'all 0.25s var(--ease)',
                  '&:hover': { bgcolor: 'var(--sage-light)', transform: 'scale(1.02)' },
                }}
              >
                Search
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', pb: 1.5, fontSize: '13px', color: 'var(--slate)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <MapPin size={15} color="var(--sage-light)" />
              <span>Near you — Pakistan</span>
              <Box component="span" sx={{ color: 'var(--sage-light)', cursor: 'pointer', fontWeight: 600 }}>(change)</Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Calendar size={15} color="var(--slate)" />
              <span>Select dates</span>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 340px) 1fr' },
            gap: { xs: 3, lg: 4 },
            alignItems: 'start',
            mt: 2,
          }}
        >
          <Box className="reveal" sx={{ position: { lg: 'sticky' }, top: { lg: 120 } }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Fraunces", serif',
                fontSize: { xs: '1.75rem', md: '2rem' },
                fontWeight: 600,
                color: 'var(--ink)',
                mb: 1,
                lineHeight: 1.15,
              }}
            >
              {heading}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
              ))}
              <Typography sx={{ fontSize: '13px', color: 'var(--slate)', ml: 0.5 }}>4.8 · Trusted rentals</Typography>
            </Box>

            <Typography sx={{ fontWeight: 600, fontSize: '15px', color: 'var(--ink)', mb: 1.5 }}>
              Why rent {activeCategory === 'All' ? 'on Rentify' : activeCategory.toLowerCase()}?
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.2, color: 'var(--slate)', fontSize: '14px', lineHeight: 1.8, mb: 3 }}>
              {blurb.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {categoryList.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  size="small"
                  onClick={() => handleCategoryClick(cat)}
                  sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '100px',
                    bgcolor: activeCategory === cat ? 'var(--purple)' : 'var(--bg-card)',
                    color: activeCategory === cat ? 'white' : 'var(--slate)',
                    border: '1px solid',
                    borderColor: activeCategory === cat ? 'var(--purple)' : 'var(--line)',
                    transition: 'all 0.25s var(--ease)',
                    '&:hover': {
                      bgcolor: activeCategory === cat ? 'var(--purple-light)' : 'var(--bg-card-hover)',
                      borderColor: 'var(--purple-light)',
                    },
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {priceBands.map((band, i) => (
                <Chip
                  key={band.label}
                  label={band.label}
                  size="small"
                  onClick={() => setActivePriceBand(i)}
                  sx={{
                    fontSize: '11.5px',
                    fontWeight: 600,
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
          </Box>

          <Box className="reveal" sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Box className="view-toggle">
                <Box
                  className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
                  onClick={() => setViewMode('list')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setViewMode('list')}
                >
                  <List size={16} /> List
                </Box>
                <Box
                  className={`view-toggle-btn${viewMode === 'map' ? ' active' : ''}`}
                  onClick={() => setViewMode('map')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setViewMode('map')}
                >
                  <Map size={16} /> Map
                </Box>
              </Box>
            </Box>

            {filtered.length === 0 ? (
              <Box className="section-gradient" sx={{ borderRadius: '20px', textAlign: 'center', py: 10, px: 3 }}>
                <Typography sx={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 600, mb: 1 }}>No items match your search</Typography>
                <Typography sx={{ color: 'var(--slate)', fontSize: '14px' }}>Try another keyword or category.</Typography>
              </Box>
            ) : viewMode === 'map' ? (
              <Box className="browse-map-panel fade-in-4">
                <BrowseMap items={filtered} />
              </Box>
            ) : (
              <>
                <Grid container spacing={2.5} className="reveal-stagger">
                  {paginated.map((item) => (
                    <Grid item xs={12} sm={6} key={item._id}>
                      <Box className="listing-card" onClick={() => navigate(`/item/${item._id}`)}>
                        <Box className="listing-media">
                          <Box component="img" src={item.images?.[0] || 'https://via.placeholder.com/400'} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(22,22,30,0.85)', borderRadius: '100px', px: 1.5, py: 0.5, fontSize: '12px', fontWeight: 600, color: 'var(--ink)', border: '1px solid var(--line)' }}>
                            {item.category}
                          </Box>
                        </Box>
                        <Box sx={{ p: 2.5 }}>
                          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.05rem', color: 'var(--ink)', mb: 0.8 }}>{item.title}</Typography>
                          <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MapPin size={13} /> {item.location?.city}{item.location?.area ? `, ${item.location.area}` : ''}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.2rem', fontWeight: 600, color: 'var(--purple-light)' }}>
                              Rs {item.pricePerDay}
                              <Box component="span" sx={{ fontSize: '13px', fontWeight: 400, color: 'var(--slate)' }}>/day</Box>
                            </Typography>
                            <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px' }}>↗</Box>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {filtered.length > perPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 5 }}>
                    <Box onClick={() => page > 1 && setPage(page - 1)} sx={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, bgcolor: 'var(--bg-card)' }}>
                      <ChevronLeft size={16} color="var(--ink)" />
                    </Box>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <Box key={num} onClick={() => setPage(num)} sx={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', bgcolor: page === num ? 'var(--purple)' : 'var(--bg-card)', color: page === num ? 'white' : 'var(--slate)', border: '1px solid', borderColor: page === num ? 'var(--purple)' : 'var(--line)' }}>
                        {num}
                      </Box>
                    ))}
                    <Box onClick={() => page < totalPages && setPage(page + 1)} sx={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, bgcolor: 'var(--bg-card)' }}>
                      <ChevronRight size={16} color="var(--ink)" />
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchResults;
