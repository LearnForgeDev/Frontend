import React from 'react';
import { Paper, Typography } from '@mui/material';
import { widgetCardSx, widgetTitleSx, statValueSx, statLabelSx } from './StatCard.styles';

export interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, label }) => {
  return (
    <Paper elevation={0} sx={widgetCardSx}>
      <Typography sx={widgetTitleSx}>{title}</Typography>
      <Typography sx={statValueSx}>{value}</Typography>
      <Typography sx={statLabelSx}>{label}</Typography>
    </Paper>
  );
};
