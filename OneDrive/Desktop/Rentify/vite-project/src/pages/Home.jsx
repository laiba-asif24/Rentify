import { Box, Container, Grid, Typography, Button, TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Search, MapPin, Camera, Tent, Wrench, Gamepad2 } from 'lucide-react';

// ── DATA ──
const chips = ['Tools', 'Cameras', 'Camping', 'Party & events', 'Sports'];

const categories = [
  { name: 'Tools', count: '2,140 items' },
  { name: 'Cameras', count: '860 items' },
  { name: 'Camping', count: '1,320 items' },
  { name: 'Party & events', count: '970 items' },
  { name: 'Sports & bikes', count: '1,540 items' },
  { name: 'Audio & tech', count: '690 items' },
];

const listings = [
  { name: 'Cordless Drill Set', loc: 'North Nazimabad · 0.8 km', price: '350', tag: 'Tools', img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800&auto=format&fit=crop' },
  { name: 'Sony A7 III + Lens Kit', loc: 'DHA Phase 2 · 1.4 km', price: '3,200', tag: 'Camera', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop' },
  { name: '4-Person Camping Tent', loc: 'Gulshan-e-Iqbal · 2.1 km', price: '900', tag: 'Camping', img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800&auto=format&fit=crop' },
];

const steps = [
  { num: '01 — Find', title: 'Find it nearby', desc: 'Search by item, filter by distance and dates, and see real photos with owner ratings.' },
  { num: '02 — Book', title: 'Reserve in seconds', desc: 'Pick your pickup slot, and message the owner directly. CNIC-verified for safety.' },
  { num: '03 — Use & return', title: 'Use it, hand it back', desc: 'Pick up, get going, and return at the agreed time — deposit released automatically.' },
];

const whyItems = [
  { icon: '🛡️', title: 'ID-verified renters', desc: 'Every account completes CNIC verification before booking or listing an item.' },
  { icon: '💰', title: 'Damage protection', desc: 'Every rental is covered up to Rs 100,000 against accidental damage or loss.' },
  { icon: '🔒', title: 'Secure deposits', desc: 'Deposits are held in escrow and released automatically once items are returned.' },
  { icon: '💬', title: 'In-app messaging', desc: 'Coordinate pickup times directly — no phone numbers required.' },
  { icon: '🚴', title: 'Pickup or delivery', desc: 'Grab it yourself nearby, or have select items delivered same-day.' },
  { icon: '⭐', title: 'Two-way ratings', desc: 'Owners and renters both rate each rental, keeping the whole community accountable.' },
];

const marqueeItems = ['Verified owners only', 'Damage protection included', 'Pickup or delivery', 'Pay per hour or day', 'In-app chat', 'Instant booking'];

const tagItems = [
  { Icon: Camera, name: 'Canon DSLR', price: 'Rs. 800/day', rot: -6, delay: '0s' },
  { Icon: Tent, name: 'Camping Tent', price: 'Rs. 500/day', rot: 4, delay: '0.4s' },
  { Icon: Wrench, name: 'Drill Machine', price: 'Rs. 300/day', rot: -3, delay: '0.8s' },
  { Icon: Gamepad2, name: 'PS5 Console', price: 'Rs. 700/day', rot: 5, delay: '1.2s' },
];

const typingTexts = [
  "your camera's been in a drawer since March.",
  "your drill hasn't moved since last year.",
  "your projector collects dust every weekend.",
  "your tent hasn't seen sunlight in months.",
];

const Home = () => {
  const navigate = useNavigate();

  // Typing
  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search bar — controlled inputs so "Find it" actually knows what was typed
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const handleSearch = () => {
    // Button (and Enter key) do nothing until the search field actually has text.
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    params.set('search', searchQuery.trim());
    if (searchCity.trim()) params.set('city', searchCity.trim());
    navigate(`/browse?${params.toString()}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  useEffect(() => {
    const current = typingTexts[textIndex];
    const speed = isDeleting ? 35 : 65;
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(current.slice(0, charIndex + 1));
        setCharIndex(p => p + 1);
        if (charIndex + 1 === current.length) setTimeout(() => setIsDeleting(true), 2200);
      } else {
        setTypedText(current.slice(0, charIndex - 1));
        setCharIndex(p => p - 1);
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setTextIndex(p => (p + 1) % typingTexts.length);
        }
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex]);

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Count up
  const statsRef = useRef(null);
  const [counts, setCounts] = useState({ items: 0, km: 0, pct: 0 });
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted) {
        setCounted(true);
        const dur = 1400; const stepsCount = 60; const interval = dur / stepsCount;
        let step = 0;
        const t = setInterval(() => {
          step++;
          const p = 1 - Math.pow(1 - step / stepsCount, 3);
          setCounts({ items: Math.floor(p * 18300), km: Math.floor(p * 2), pct: Math.floor(p * 60) });
          if (step >= stepsCount) clearInterval(t);
        }, interval);
      }
    }, { threshold: 0.5 });
    if (statsRef.current) io.observe(statsRef.current);
    return () => io.disconnect();
  }, [counted]);

  return (
    <Box sx={{ backgroundColor: 'var(--cream)', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
    <Box sx={{
  minHeight: '100vh', display: 'flex', alignItems: 'center',
  pt: '100px', pb: '60px', position: 'relative',
        '&::before': {
          content: '""', position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 600px 400px at 85% 15%, rgba(62,124,107,0.14), transparent 60%), radial-gradient(ellipse 500px 400px at 5% 90%, rgba(232,163,61,0.12), transparent 60%)',
        }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">

            {/* LEFT */}
            <Grid item xs={12} md={6}>
              <Box className="eyebrow fade-in-1" sx={{ mb: 3 }}>PAKISTAN'S LOCAL RENTAL MARKETPLACE</Box>

              {/* Fixed height heading — prevents layout shift during typing */}
       <Box sx={{ minHeight: { xs: '120px', md: '150px' }, mb: 2 }}>
  <Typography variant="h1" className="fade-in-2"
    sx={{ fontSize: { xs: '2.4rem', md: '3.6rem' }, color: 'var(--ink)', lineHeight: 1.08, minHeight: { xs: '120px', md: '150px' } }}>
                  Why buy it when{' '}
                  <Box component="span" sx={{ color: 'var(--sage)', fontStyle: 'italic', fontWeight: 500 }}>
                    {typedText}<span className="typing-cursor" />
                  </Box>
                </Typography>
              </Box>

              <Typography className="fade-in-3"
                sx={{ fontSize: '18px', color: 'var(--slate)', maxWidth: 460, lineHeight: 1.65, mb: 2 }}>
                Rentify connects you with verified people nearby renting out tools, cameras, camping gear, and more — for a few hours or a few weeks.
              </Typography>

              {/* Search pill */}
              <Box className="fade-in-4" sx={{
                display: 'flex', alignItems: 'center', bgcolor: 'white',
                borderRadius: '100px', p: '6px',
                boxShadow: '0 12px 30px rgba(14,26,43,0.10)',
                maxWidth: 460, mb: 3, border: '1px solid var(--line)',
              }}>
                <TextField placeholder="Search for a drill, tent, camera..."
                  variant="standard" fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Search size={16} color="var(--slate)" style={{ marginLeft: 12 }} /></InputAdornment> }}
                  sx={{ '& input': { fontSize: '14.5px', color: 'var(--ink)', py: 1.2 } }}
                />
                <Box sx={{ width: '1px', height: 24, bgcolor: 'var(--line)', mx: 0.5 }} />
                <TextField placeholder="Your city" variant="standard"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><MapPin size={16} color="var(--slate)" /></InputAdornment> }}
                  sx={{ minWidth: 120, '& input': { fontSize: '14.5px', color: 'var(--ink)', py: 1.2 } }}
                />
                <Button onClick={handleSearch}
                  sx={{ bgcolor: 'var(--ink)', color: 'var(--cream)', borderRadius: '100px', px: 3, py: 1.5, flexShrink: 0, fontSize: '14px', '&:hover': { bgcolor: 'var(--sage)' } }}>
                  Find it
                </Button>
              </Box>

              {/* Chips */}
              <Box className="fade-in-4" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 5 }}>
                {chips.map(c => (
                  <Box key={c} onClick={() => navigate(`/browse?category=${c}`)}
                    sx={{ fontSize: '13px', fontWeight: 500, px: 2, py: 1, borderRadius: '100px', border: '1px solid var(--line)', color: 'var(--slate)', cursor: 'pointer', transition: 'all 0.3s var(--ease)', '&:hover': { borderColor: 'var(--sage)', color: 'var(--sage)', bgcolor: 'rgba(62,124,107,0.06)', transform: 'translateY(-2px)' } }}>
                    {c}
                  </Box>
                ))}
              </Box>

              {/* Stats */}
              <Box ref={statsRef} className="fade-in-5" sx={{ display: 'flex', gap: 5.5 }}>
                {[
                  { n: counts.items.toLocaleString(), l: 'Items listed' },
                  { n: counts.km, l: 'Km avg. distance' },
                  { n: `${counts.pct}%`, l: '% cheaper than buying' },
                ].map((s, i) => (
                  <Box key={i}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{s.n}</Typography>
                    <Typography sx={{ fontSize: '12.5px', color: 'var(--slate)', mt: 0.5 }}>{s.l}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

         {/* RIGHT — Simple Visual */}
<Grid item xs={12} md={6}>
  <Box className="fade-in-3" sx={{ position: 'relative', height: { xs: 320, md: 480 }, borderRadius: '28px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
    <Box component="img"
      src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=1200&auto=format&fit=crop"
      alt="items for rent"
      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(200deg, rgba(62,124,107,0.3), rgba(14,26,43,0.4))' }} />

    {/* Single float card */}
    <Box sx={{ position: 'absolute', bottom: 28, left: 28, bgcolor: 'white', borderRadius: '14px', p: 2, display: 'flex', alignItems: 'center', gap: 1.5, boxShadow: '0 12px 32px rgba(14,26,43,0.16)' }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(62,124,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✓</Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)' }}>Owner verified</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: 'var(--slate)' }}>ID + reviews checked</Typography>
      </Box>
    </Box>
  </Box>
</Grid>

          </Grid>
        </Container>
      </Box>

      {/* ── MARQUEE ── */}
      <Box sx={{ bgcolor: 'var(--sage)', py: 2, overflow: 'hidden' }} className="marquee-wrap">
        <Box className="marquee-track" sx={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <Box key={i} sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, px: 4 }}>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
              <Typography sx={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── CATEGORIES ── */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }} className="reveal">
            <Box>
              <Box className="eyebrow" sx={{ mb: 1.5 }}>Browse by category</Box>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, color: 'var(--ink)', maxWidth: 480 }}>
                Whatever you need, someone close by has it.
              </Typography>
            </Box>
            <Typography sx={{ color: 'var(--slate)', fontSize: '15px', maxWidth: 280, textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              From a weekend drill to a full DSLR kit — new categories added every week.
            </Typography>
          </Box>
          <Grid container spacing={2} className="reveal-stagger">
            {categories.map((cat, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <Box onClick={() => navigate(`/browse?category=${cat.name}`)} className="card-lift"
                  sx={{ bgcolor: 'white', borderRadius: '16px', p: 3, textAlign: 'center', border: '1px solid var(--line)', '&:hover': { borderColor: 'var(--sage)' } }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', mb: 0.5 }}>{cat.name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace' }}>{cat.count}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── HOW IT WORKS ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--cream-dim)' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }} className="reveal">
            <Box>
              <Box className="eyebrow" sx={{ mb: 1.5 }}>Three simple steps</Box>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, color: 'var(--ink)' }}>
                Borrowing shouldn't feel complicated.
              </Typography>
            </Box>
            <Typography sx={{ color: 'var(--slate)', fontSize: '15px', maxWidth: 280, textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              Rentify handles the trust, the schedule, and the paperwork.
            </Typography>
          </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }} className="reveal-stagger">
  {steps.map((step, i) => (
    <Box className="step-card" key={i}>
      <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: 'var(--slate)', mb: 2, letterSpacing: '0.1em' }}>{step.num}</Typography>
      <Typography variant="h3" sx={{ fontSize: '1.3rem', mb: 1.5, color: 'var(--ink)' }}>{step.title}</Typography>
      <Typography sx={{ color: 'var(--slate)', fontSize: '15px', lineHeight: 1.7 }}>{step.desc}</Typography>
      <Box className="step-glyph">R</Box>
    </Box>
  ))}
</Box>
        </Container>
      </Box>

      {/* ── LISTINGS ── */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }} className="reveal">
            <Box>
              <Box className="eyebrow" sx={{ mb: 1.5 }}>Trending near you</Box>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, color: 'var(--ink)' }}>
                Popular items available this week.
              </Typography>
            </Box>
            <Typography sx={{ color: 'var(--slate)', fontSize: '15px', maxWidth: 280, textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              A live shortlist of highly-rated items with fast owner response times.
            </Typography>
          </Box>
          <Grid container spacing={3} className="reveal-stagger">
            {listings.map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box className="listing-card" onClick={() => navigate('/browse')}>
                  <Box className="listing-media">
                    <Box component="img" src={item.img} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'white', borderRadius: '100px', px: 1.5, py: 0.5, fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{item.tag}</Box>
                    <Box sx={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}>♡</Box>
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.1rem', color: 'var(--ink)', mb: 0.8 }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 2 }}>📍 {item.loc}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)' }}>
                        Rs {item.price}<Box component="span" sx={{ fontSize: '13px', fontWeight: 400, color: 'var(--slate)' }}>/day</Box>
                      </Typography>
                      <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', cursor: 'pointer', transition: 'background 0.2s ease', '&:hover': { bgcolor: 'var(--sage)' } }}>↗</Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── WHY ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--cream-dim)' }}>
        <Container maxWidth="lg">
          <Box className="reveal">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ maxWidth: 520 }}>
                <Box className="eyebrow" sx={{ mb: 1.5 }}>Built for trust</Box>
                <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, color: 'var(--ink)' }}>
                  Lending your things to a stranger sounds risky. We made it not be.
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2.5}>
              {whyItems.map((w, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Box className="why-item">
                    <Typography sx={{ fontSize: '1.8rem', mb: 1.5 }}>{w.icon}</Typography>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.05rem', color: 'var(--ink)', mb: 1 }}>{w.title}</Typography>
                    <Typography sx={{ color: 'var(--slate)', fontSize: '14px', lineHeight: 1.7 }}>{w.desc}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* ── TESTIMONIAL ── */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Box className="reveal" sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: 'var(--amber)', fontSize: '1.3rem', mb: 3 }}>★★★★★</Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: '1.3rem', md: '1.7rem' }, color: 'var(--ink)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.5, mb: 4 }}>
              "I needed a pressure washer for one Saturday. Rented one two streets away for a fraction of what it costs new — picked it up on my way home."
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>B</Box>
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>Bilal Ahmed</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'var(--slate)' }}>Renter, Karachi</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box className="reveal" sx={{ bgcolor: 'var(--sage)', borderRadius: '24px', p: { xs: 5, md: 8 }, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ color: 'white', fontSize: { xs: '1.8rem', md: '2.6rem' }, mb: 2, maxWidth: 560, mx: 'auto' }}>
              Got gear sitting in a closet? Someone nearby needs it today.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, fontSize: '16px' }}>
              List it in under three minutes and start earning from things you already own.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/register')}
                sx={{ bgcolor: 'white', color: 'var(--sage)', px: 4, py: 1.6, fontSize: '15px', fontWeight: 700, borderRadius: '100px', '&:hover': { bgcolor: 'var(--cream)', transform: 'translateY(-2px)' }, transition: 'all 0.3s var(--ease)' }}>
                List an item
              </Button>
              <Button onClick={() => navigate('/browse')}
                sx={{ bgcolor: 'transparent', color: 'white', px: 4, py: 1.6, fontSize: '15px', fontWeight: 600, borderRadius: '100px', border: '1.5px solid rgba(255,255,255,0.4)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}>
                Browse nearby
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;