/** Shared dashboard theme tokens — matches site dark theme */
export const dash = {
  bg: 'var(--bg)',
  card: 'var(--bg-card)',
  cardHover: 'var(--bg-card-hover)',
  line: 'var(--line)',
  ink: 'var(--ink)',
  slate: 'var(--slate)',
  purple: 'var(--purple)',
  purpleLight: 'var(--purple-light)',
  sage: 'var(--sage)',
  sageLight: 'var(--sage-light)',
  amber: 'var(--amber)',
  sidebar: 'var(--beige-dark)',
  emptyBg: 'rgba(255,255,255,0.03)',
};

export const statusConfigDark = (s) => {
  if (s === 'approved' || s === 'confirmed')
    return { bg: 'rgba(64,159,122,0.15)', color: 'var(--sage-light)', dot: 'var(--sage)', label: 'Approved' };
  if (s === 'pending') return { bg: 'rgba(245,158,11,0.15)', color: 'var(--amber-soft)', dot: 'var(--amber)', label: 'Pending' };
  if (s === 'completed') return { bg: 'rgba(255,255,255,0.06)', color: 'var(--slate)', dot: 'var(--slate)', label: 'Completed' };
  if (s === 'rejected') return { bg: 'rgba(220,38,38,0.15)', color: '#F87171', dot: '#EF4444', label: 'Rejected' };
  return { bg: 'rgba(255,255,255,0.06)', color: 'var(--slate)', dot: 'var(--slate)', label: s };
};

export const dashFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '14px',
    bgcolor: 'var(--bg)',
    color: 'var(--ink)',
    '& fieldset': { borderColor: 'var(--line)' },
    '&:hover fieldset': { borderColor: 'var(--line-strong)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--purple)', borderWidth: '1.5px' },
  },
};

export const dashPaper = {
  bgcolor: 'var(--bg-card)',
  borderRadius: '14px',
  border: '1px solid var(--line)',
  transition: 'border-color 0.3s ease, box-shadow 0.35s var(--ease), transform 0.35s var(--ease)',
  '&:hover': { borderColor: 'var(--line-strong)' },
};
