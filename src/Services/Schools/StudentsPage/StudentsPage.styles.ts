

export const pageSx = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export const headerRowSx = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 2,
};

export const cardGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fill, minmax(320px, 1fr))' },
  gap: 3,
};
