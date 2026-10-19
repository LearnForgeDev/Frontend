

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

export const pageTitleSx = { fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800 };
export const sectionTitleSx = { mb: 2, fontSize: '1.2rem', fontWeight: 800 };
