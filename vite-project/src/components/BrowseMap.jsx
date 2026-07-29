import { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { formatShortLocation, getItemMapPosition, sortByNearby } from '../utils/itemMapPosition';
import 'leaflet/dist/leaflet.css';

const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const PK_CENTER = [30.3753, 69.3451];

function createPriceIcon(price, active) {
  return L.divIcon({
    className: 'leaflet-price-marker-wrap',
    html: `<div class="leaflet-price-pin${active ? ' active' : ''}"><span class="price-amt">Rs ${price}</span><span class="price-per">/day</span></div>`,
    iconSize: [96, 34],
    iconAnchor: [48, 34],
  });
}

function MapBounds({ items }) {
  const map = useMap();

  useEffect(() => {
    if (!items.length) {
      map.setView(PK_CENTER, 6);
      return;
    }
    if (items.length === 1) {
      const pos = getItemMapPosition(items[0]);
      map.setView([pos.lat, pos.lng], 13);
      return;
    }
    const bounds = L.latLngBounds(items.map((item) => {
      const pos = getItemMapPosition(item);
      return [pos.lat, pos.lng];
    }));
    map.fitBounds(bounds, { padding: [64, 64], maxZoom: 12 });
  }, [items, map]);

  return null;
}

const BrowseMap = ({ items, nearbyCity = 'Karachi' }) => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  const mapRef = useRef(null);

  const sortedItems = useMemo(() => sortByNearby(items, nearbyCity), [items, nearbyCity]);

  const markers = useMemo(
    () => sortedItems.map((item) => ({ item, pos: getItemMapPosition(item) })),
    [sortedItems],
  );

  const activeItem = markers.find((m) => m.item._id === activeId)?.item;

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const handlePopupOpen = (e) => {
      const popup = e.popup;
      const btn = popup.getElement()?.querySelector('.map-popup-btn');
      if (btn) {
        const itemId = btn.id.replace('map-btn-', '');
        btn.onclick = () => navigate(`/item/${itemId}`);
      }
    };

    map.on('popupopen', handlePopupOpen);

    return () => {
      map.off('popupopen', handlePopupOpen);
    };
  }, [navigate]);

  const handleMapWrapClick = (e) => {
    const target = e.target;
    if (target.classList.contains('map-popup-btn')) {
      const itemId = target.id.replace('map-btn-', '');
      navigate(`/item/${itemId}`);
    }
  };

  return (
    <Box 
      className="browse-map-wrap browse-map-leaflet" 
      onClick={handleMapWrapClick}
    >
      <MapContainer
        ref={mapRef}
        center={PK_CENTER}
        zoom={6}
        scrollWheelZoom
        className="browse-leaflet-map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url={DARK_TILE}
        />
        <ZoomControl position="bottomright" />
        <MapBounds items={sortedItems} />

        {markers.map(({ item, pos }) => (
          <Marker
            key={item._id}
            position={[pos.lat, pos.lng]}
            icon={createPriceIcon(item.pricePerDay, activeId === item._id)}
            eventHandlers={{
              mouseover: () => setActiveId(item._id),
              click: () => setActiveId(item._id),
            }}
          >
            <Popup className="map-leaflet-popup" closeButton>
              <div className="map-popup-html">
                <img src={item.images?.[0] || 'https://via.placeholder.com/200'} alt="" />
                <strong>{item.title}</strong>
                <span className="map-popup-loc">{formatShortLocation(item)}</span>
                <span className="map-popup-price">Rs {item.pricePerDay}/day</span>
                <button type="button" className="map-popup-btn" id={`map-btn-${item._id}`}>
                  View listing
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <Box className="map-nearby-badge">
        <Navigation size={14} />
        <span>Showing items near {nearbyCity}</span>
      </Box>

      {activeItem && (
        <Box
          className="map-hover-card reveal"
          onMouseEnter={() => setActiveId(activeItem._id)}
          onMouseLeave={() => setActiveId(null)}
        >
          <Box component="img" src={activeItem.images?.[0] || 'https://via.placeholder.com/120'} alt={activeItem.title} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)', mb: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeItem.title}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'var(--slate)', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <MapPin size={12} color="var(--sage-light)" />
              {formatShortLocation(activeItem)}
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--purple-light)' }}>
              Rs {activeItem.pricePerDay}/day
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => navigate(`/item/${activeItem._id}`)}
            sx={{
              bgcolor: 'var(--purple)',
              color: 'white',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 600,
              px: 2,
              py: 0.6,
              minWidth: 'auto',
              flexShrink: 0,
              textTransform: 'none',
              '&:hover': { bgcolor: 'var(--purple-light)' },
            }}
          >
            View
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BrowseMap;
