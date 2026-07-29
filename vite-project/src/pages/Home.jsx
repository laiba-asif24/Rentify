// client/src/pages/Home.jsx



import { Box, Container, Typography, Button, TextField, InputAdornment, Chip, CircularProgress } from '@mui/material';

import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';

import api from '../utils/api';

import {

  Search, MapPin, Camera, Tent, Wrench, Gamepad2, ArrowRight,

  Shield, ShieldCheck, DollarSign, Sparkles, Bike,

} from 'lucide-react';



const categories = [

  { name: 'Tools', icon: Wrench, img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=400&auto=format&fit=crop' },

  { name: 'Cameras', icon: Camera, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop' },

  { name: 'Camping', icon: Tent, img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400&auto=format&fit=crop' },

  { name: 'Gaming', icon: Gamepad2, img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop' },

  { name: 'Party & events', icon: Sparkles, img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop' },

  { name: 'Sports & bikes', icon: Bike, img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=400&auto=format&fit=crop' },

];



const whyHeroCards = [

  {

    img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop',

    title: 'Rent across Pakistan',

    desc: 'From Karachi to Islamabad — find items near you in every major city.',

  },

  {

    img: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=400&auto=format&fit=crop',

    title: 'Trusted by thousands',

    desc: 'Over 10,000 successful rentals with verified owners and renters.',

  },

  {

    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',

    title: 'Real people, real items',

    desc: 'Every listing comes from a verified local owner — no middlemen.',

  },

];



const whyIconFeatures = [

  { icon: Shield, title: 'Everything is guaranteed', desc: 'Protection for both renters and owners on every booking.' },

  { icon: ShieldCheck, title: 'Everyone is verified', desc: 'Every user is ID-verified before they can rent or list.' },

  { icon: DollarSign, title: 'Cheaper than buying', desc: 'Often 60% cheaper to rent than buy from a store.' },

  { icon: MapPin, title: 'Rent in your area', desc: 'Find items closer to you than the nearest shop.' },

];



const howItWorks = [

  { step: '01', title: 'Search', desc: 'Find what you need nearby — from cameras to power tools.' },

  { step: '02', title: 'Book', desc: 'Reserve instantly with secure payment and deposit.' },

  { step: '03', title: 'Pickup', desc: 'Meet the owner, grab your item, and get going.' },

];



const Home = () => {

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const [recentItems, setRecentItems] = useState([]);

  const [itemsLoading, setItemsLoading] = useState(true);



  const [typedText, setTypedText] = useState('');

  const [textIndex, setTextIndex] = useState(0);

  const [charIndex, setCharIndex] = useState(0);

  const [isDeleting, setIsDeleting] = useState(false);



  const typingTexts = [

    'a camera for your trip',

    'a drill for that shelf',

    'a tent for the weekend',

    'a projector for movie night',

  ];



  useEffect(() => {

    const current = typingTexts[textIndex];

    const speed = isDeleting ? 40 : 70;

    const timer = setTimeout(() => {

      if (!isDeleting) {

        setTypedText(current.slice(0, charIndex + 1));

        setCharIndex(p => p + 1);

        if (charIndex + 1 === current.length) setTimeout(() => setIsDeleting(true), 2000);

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



  useEffect(() => {

    const fetchItems = async () => {

      try {

        setItemsLoading(true);

        const res = await api.get('/items');

        setRecentItems(res.data.slice(0, 8));

      } catch (err) {

        console.error('Error fetching items:', err);

      } finally {

        setItemsLoading(false);

      }

    };

    fetchItems();

  }, []);



  useEffect(() => {

    const io = new IntersectionObserver(

      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),

      { threshold: 0.12 }

    );

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

    return () => io.disconnect();

  }, [recentItems, itemsLoading]);



  const handleSearch = () => {

    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();

    params.set('search', searchQuery.trim());

    navigate(`/search?${params.toString()}`);

  };



  return (

    <Box sx={{ overflowX: 'hidden', position: 'relative', zIndex: 1 }}>



      {/* ─── HERO ─── */}

      <Box className="hero-gradient" sx={{

        minHeight: { xs: 'auto', md: '92vh' },

        display: 'flex',

        alignItems: 'center',

        pt: { xs: '120px', md: '100px' },

        pb: { xs: '60px', md: '80px' },

        position: 'relative',

      }}>

        <Box sx={{

          position: 'absolute',

          top: '-20%',

          right: '-15%',

          width: '50%',

          height: '70%',

          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',

          animation: 'pulseGlow 6s ease-in-out infinite alternate',

          pointerEvents: 'none',

        }} />

        <Box sx={{

          position: 'absolute',

          bottom: '-10%',

          left: '-10%',

          width: '40%',

          height: '50%',

          background: 'radial-gradient(circle, rgba(45,106,79,0.1) 0%, transparent 70%)',

          animation: 'pulseGlow 8s ease-in-out infinite alternate-reverse',

          pointerEvents: 'none',

        }} />



        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>

          <Box className="fade-in-1" sx={{

            display: 'inline-flex',

            alignItems: 'center',

            gap: 1.5,

            bgcolor: 'rgba(139,92,246,0.12)',

            borderRadius: '100px',

            px: 2.5,

            py: 0.8,

            mb: 3,

            border: '1px solid rgba(139,92,246,0.2)',

          }}>

            <Sparkles size={16} color="#A78BFA" />

            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#A78BFA', letterSpacing: '0.05em' }}>

              Pakistan's Rental Marketplace

            </Typography>

          </Box>



          <Typography variant="h1" className="fade-in-2" sx={{

            fontSize: { xs: '2.4rem', sm: '3rem', md: '3.8rem' },

            color: 'var(--ink)',

            lineHeight: 1.08,

            fontWeight: 600,

            fontFamily: '"Fraunces", serif',

            letterSpacing: '-0.02em',

            mb: 1,

          }}>

            Rent what you need,

          </Typography>



          <Typography variant="h1" className="fade-in-2" sx={{

            fontSize: { xs: '2.4rem', sm: '3rem', md: '3.8rem' },

            lineHeight: 1.08,

            fontWeight: 600,

            fontFamily: '"Fraunces", serif',

            letterSpacing: '-0.02em',

            mb: 2,

            display: 'flex',

            justifyContent: 'center',

            alignItems: 'center',

            flexWrap: 'wrap',

            gap: 0.5,

          }}>

            <Box component="span" sx={{

              background: 'linear-gradient(135deg, #A78BFA 0%, #52B88E 50%, #8B5CF6 100%)',

              WebkitBackgroundClip: 'text',

              WebkitTextFillColor: 'transparent',

              fontStyle: 'italic',

              fontWeight: 500,

            }}>

              {typedText}

              <span className="typing-cursor" />

            </Box>

          </Typography>



          <Typography className="fade-in-3" sx={{

            fontSize: { xs: '16px', md: '18px' },

            color: 'var(--slate)',

            maxWidth: 480,

            mx: 'auto',

            lineHeight: 1.7,

            mb: 4,

          }}>

            Nearby and at times that suit you

          </Typography>



          {/* Search bar */}

          <Box className="fade-in-4" sx={{

            display: 'flex',

            flexDirection: 'row',

            alignItems: 'center',

            bgcolor: 'var(--bg-card)',

            borderRadius: { xs: '20px', sm: '60px' },

            p: { xs: 1.5, sm: '6px' },

            pl: { xs: 1.5, sm: 2 },

            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',

            maxWidth: 560,

            mx: 'auto',

            mb: 3,

            border: '1px solid var(--line)',

            gap: 1,

            transition: 'all 0.3s ease',

            '&:hover': { boxShadow: '0 24px 70px rgba(139,92,246,0.15)', transform: 'translateY(-2px)', borderColor: 'rgba(139,92,246,0.25)' },

          }}>

            <TextField

              placeholder="Search for a drill, tent, camera..."

              variant="standard"

              fullWidth

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

              InputProps={{

                disableUnderline: true,

                startAdornment: (

                  <InputAdornment position="start">

                    <Search size={18} color="var(--slate)" />

                  </InputAdornment>

                ),

              }}

              sx={{ flex: 1, '& input': { fontSize: '15px', color: 'var(--ink)', py: 1.5, px: 0.5 }, '& input::placeholder': { color: 'var(--slate)', opacity: 1 } }}

            />

            <Button

              onClick={handleSearch}

              sx={{

                bgcolor: 'var(--sage)',

                color: 'white',

                borderRadius: { xs: '14px', sm: '50px' },

                px: 3,

                py: 1.6,

                flexShrink: 0,

                fontSize: '14px',

                fontWeight: 600,

                transition: 'all 0.25s var(--ease)',

                '&:hover': { bgcolor: 'var(--sage-light)', transform: 'scale(1.03)' },

              }}

            >

              Search

            </Button>

          </Box>



          {/* Category pills */}

          <Box className="fade-in-5">

            <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 2 }}>

              Or browse our most popular categories...

            </Typography>

            <Box sx={{

              display: 'flex',

              flexWrap: 'wrap',

              gap: 1.2,

              justifyContent: 'center',

              maxWidth: 680,

              mx: 'auto',

            }}>

              {categories.map((cat) => {

                const Icon = cat.icon;

                return (

                  <Chip

                    key={cat.name}

                    icon={<Icon size={15} color="#A78BFA" />}

                    label={cat.name}

                    onClick={() => navigate(`/browse?category=${cat.name}`)}

                    sx={{

                      bgcolor: 'rgba(255,255,255,0.04)',

                      border: '1px solid var(--line)',

                      borderRadius: '100px',

                      px: 1,

                      py: 2.2,

                      fontSize: '13px',

                      fontWeight: 500,

                      color: 'var(--ink-soft)',

                      cursor: 'pointer',

                      transition: 'all 0.3s ease',

                      '&:hover': {

                        bgcolor: 'var(--purple)',

                        color: 'white',

                        borderColor: 'var(--purple)',

                        transform: 'translateY(-2px)',

                        boxShadow: '0 8px 24px rgba(139,92,246,0.3)',

                        '& .MuiChip-icon': { color: 'white !important' },

                      },

                    }}

                  />

                );

              })}

              <Chip

                label="All categories"

                onClick={() => navigate('/browse')}

                sx={{

                  bgcolor: 'transparent',

                  border: '1px dashed var(--line-strong)',

                  borderRadius: '100px',

                  px: 1,

                  py: 2.2,

                  fontSize: '13px',

                  fontWeight: 600,

                  color: 'var(--purple-light)',

                  cursor: 'pointer',

                  '&:hover': { borderColor: 'var(--purple)', bgcolor: 'rgba(139,92,246,0.08)' },

                }}

              />

            </Box>

          </Box>

        </Container>

      </Box>



      {/* ─── RECENTLY ACTIVE ITEMS (with images) ─── */}

      <Box sx={{ py: { xs: 7, md: 9 }, bgcolor: 'rgba(255,255,255,0.02)' }}>

        <Container maxWidth="lg">

          <Box className="reveal" sx={{ mb: 4 }}>

            <Box className="eyebrow" sx={{ mb: 1 }}>Recently active</Box>

            <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, color: 'var(--ink)' }}>

              Recently active items

            </Typography>

          </Box>



          {itemsLoading ? (

            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>

              <CircularProgress sx={{ color: 'var(--purple)' }} />

            </Box>

          ) : recentItems.length === 0 ? (

            <Box sx={{ textAlign: 'center', py: 8 }}>

              <Typography sx={{ color: 'var(--slate)', fontSize: '15px' }}>No items listed yet. Be the first to add one!</Typography>

            </Box>

          ) : (

          <Box className="reveal-stagger" sx={{

            display: 'grid',

            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },

            gap: 2.5,

          }}>

            {recentItems.map((item) => (

              <Box

                key={item._id}

                onClick={() => navigate(`/item/${item._id}`)}

                className="listing-card card-lift"

              >

                <Box className="listing-media">

                  <Box component="img" src={item.images?.[0] || 'https://via.placeholder.com/400'} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  <Box sx={{

                    position: 'absolute',

                    top: 12,

                    left: 12,

                    bgcolor: 'rgba(0,0,0,0.65)',

                    backdropFilter: 'blur(8px)',

                    color: 'white',

                    fontSize: '11px',

                    fontWeight: 600,

                    borderRadius: '100px',

                    px: 1.5,

                    py: 0.4,

                  }}>

                    {item.category}

                  </Box>

                </Box>

                <Box sx={{ p: 2 }}>

                  <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)', lineHeight: 1.4, mb: 0.5 }}>

                    {item.title}

                  </Typography>

                  <Typography sx={{ fontSize: '12px', color: 'var(--slate)', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>

                    <MapPin size={12} /> {item.location?.city}{item.location?.area ? `, ${item.location.area}` : ''}

                  </Typography>

                  <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--purple-light)' }}>

                    Rs {item.pricePerDay}/day

                  </Typography>

                </Box>

              </Box>

            ))}

          </Box>

          )}



          <Box sx={{ textAlign: 'center', mt: 4 }} className="reveal">

            <Typography

              onClick={() => navigate('/browse')}

              sx={{

                color: 'var(--purple-light)',

                fontWeight: 600,

                cursor: 'pointer',

                display: 'inline-flex',

                alignItems: 'center',

                gap: 0.5,

                fontSize: '14px',

                transition: 'gap 0.2s ease, color 0.2s ease',

                '&:hover': { gap: 1, color: 'var(--purple)' },

              }}

            >

              Go to category overview <ArrowRight size={16} />

            </Typography>

          </Box>

        </Container>

      </Box>



      {/* ─── WHY CHOOSE RENTIFY (Hygglo-style) ─── */}

      <Box id="why" sx={{ py: { xs: 7, md: 9 } }}>

        <Container maxWidth="lg">

          <Box className="reveal" sx={{ textAlign: 'center', mb: 6 }}>

            <Typography variant="h2" sx={{

              fontSize: { xs: '1.8rem', md: '2.4rem' },

              color: 'var(--ink)',

              fontFamily: '"Fraunces", serif',

              fontWeight: 600,

            }}>

              Why choose Rentify?

            </Typography>

          </Box>



          {/* Top 3 hero cards with circular images */}

          <Box className="reveal-stagger" sx={{

            display: 'grid',

            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },

            gap: 3,

            mb: 6,

          }}>

            {whyHeroCards.map((card, i) => (

              <Box key={i} className="why-hero-card">

                <img src={card.img} alt={card.title} className="avatar" />

                <Typography sx={{ fontWeight: 700, fontSize: '17px', color: 'var(--ink)', mb: 1 }}>

                  {card.title}

                </Typography>

                <Typography sx={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.7, maxWidth: 280, mx: 'auto' }}>

                  {card.desc}

                </Typography>

              </Box>

            ))}

          </Box>



          {/* Bottom 2x2 icon grid */}

          <Box className="reveal-stagger" sx={{

            display: 'grid',

            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },

            gap: { xs: 2, md: 3 },

          }}>

            {whyIconFeatures.map((feature, i) => {

              const Icon = feature.icon;

              return (

                <Box key={i} className="why-icon-item">

                  <Box className="why-icon-circle">

                    <Icon size={26} color="white" strokeWidth={1.8} />

                  </Box>

                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)', mb: 0.5, lineHeight: 1.4 }}>

                    {feature.title}

                  </Typography>

                  <Typography sx={{ fontSize: '12.5px', color: 'var(--slate)', lineHeight: 1.6 }}>

                    {feature.desc}

                  </Typography>

                </Box>

              );

            })}

          </Box>

        </Container>

      </Box>



      {/* ─── HOW IT WORKS ─── */}

      <Box id="how" sx={{ py: { xs: 7, md: 9 }, bgcolor: 'rgba(255,255,255,0.02)' }}>

        <Container maxWidth="lg">

          <Box className="reveal" sx={{ textAlign: 'center', mb: 5 }}>

            <Box className="eyebrow center" sx={{ justifyContent: 'center', mb: 1 }}>How it works</Box>

            <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, color: 'var(--ink)', mt: 1 }}>

              Rent in three simple steps

            </Typography>

          </Box>



          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }} className="reveal-stagger">

            {howItWorks.map((item, i) => (

              <Box key={i} sx={{

                bgcolor: 'var(--bg-card)',

                borderRadius: '20px',

                p: 4,

                border: '1px solid var(--line)',

                textAlign: 'center',

                transition: 'all 0.35s var(--ease)',

                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', borderColor: 'rgba(139,92,246,0.25)' },

              }}>

                <Box sx={{

                  width: 52,

                  height: 52,

                  borderRadius: '50%',

                  background: 'linear-gradient(135deg, var(--purple) 0%, var(--sage) 100%)',

                  color: 'white',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  fontFamily: '"Fraunces", serif',

                  fontSize: '18px',

                  fontWeight: 700,

                  mx: 'auto',

                  mb: 2,

                  boxShadow: '0 8px 24px rgba(139,92,246,0.3)',

                }}>

                  {item.step}

                </Box>

                <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink)', mb: 1 }}>

                  {item.title}

                </Typography>

                <Typography sx={{ color: 'var(--slate)', fontSize: '14px', lineHeight: 1.7 }}>

                  {item.desc}

                </Typography>

              </Box>

            ))}

          </Box>

        </Container>

      </Box>



      {/* ─── CTA ─── */}

      <Box sx={{ py: { xs: 6, md: 8 } }}>

        <Container maxWidth="lg">

          <Box className="reveal cta-gradient" sx={{

            borderRadius: '24px',

            p: { xs: 5, md: 8 },

            textAlign: 'center',

            position: 'relative',

            overflow: 'hidden',

          }}>

            <Box sx={{

              position: 'absolute',

              inset: 0,

              background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)',

              pointerEvents: 'none',

            }} />



            <Box sx={{ position: 'relative', zIndex: 1 }}>

              <Typography variant="h2" sx={{

                color: 'white',

                fontSize: { xs: '1.7rem', md: '2.4rem' },

                mb: 2,

                maxWidth: 520,

                mx: 'auto',

                fontWeight: 600,

                fontFamily: '"Fraunces", serif',

              }}>

                Ready to start renting?

              </Typography>

              <Typography sx={{ color: 'rgba(255,255,255,0.85)', mb: 5, fontSize: '16px', maxWidth: 460, mx: 'auto' }}>

                List your items or find what you need — join thousands of people already using Rentify.

              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>

                <Button

                  onClick={() => navigate('/register')}

                  sx={{

                    bgcolor: 'white',

                    color: '#4C1D95',

                    px: 4,

                    py: 1.6,

                    fontSize: '15px',

                    fontWeight: 700,

                    borderRadius: '100px',

                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'translateY(-2px)' },

                  }}

                >

                  List an item

                </Button>

                <Button

                  onClick={() => navigate('/browse')}

                  sx={{

                    bgcolor: 'transparent',

                    color: 'white',

                    px: 4,

                    py: 1.6,

                    fontSize: '15px',

                    fontWeight: 600,

                    borderRadius: '100px',

                    border: '1.5px solid rgba(255,255,255,0.35)',

                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' },

                  }}

                >

                  Browse items

                </Button>

              </Box>

            </Box>

          </Box>

        </Container>

      </Box>



    </Box>

  );

};



export default Home;

