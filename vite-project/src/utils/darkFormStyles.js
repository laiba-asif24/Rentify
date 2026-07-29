export const darkFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '14px',
    bgcolor: 'var(--bg-card)',
    color: 'var(--ink)',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
    '& fieldset': { borderColor: 'var(--line)' },
    '&:hover fieldset': { borderColor: 'var(--line-strong)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--purple)', borderWidth: '1.5px' },
  },
  '& .MuiInputBase-input::placeholder': { color: 'var(--slate)', opacity: 1 },
};

export const darkLabelSx = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--slate)',
  mb: 0.8,
  fontFamily: '"IBM Plex Mono", monospace',
  letterSpacing: '0.08em',
};

export const darkPaperSx = {
  bgcolor: 'var(--bg-card)',
  borderRadius: '16px',
  border: '1px solid var(--line)',
  transition: 'border-color 0.3s ease, box-shadow 0.35s var(--ease)',
};
