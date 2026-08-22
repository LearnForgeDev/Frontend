import { Box, Typography } from '@mui/material';
import type { SchoolRequestViewState } from '../../utils/schoolRequestStatus.utils';
import { SCHOOL_REQUEST_STATUS_CONTENT } from './SchoolRequestStatus.const';
import * as S from './SchoolRequestStatus.styles';

type SchoolRequestStatusProps = {
  schoolName: string;
  viewState: SchoolRequestViewState;
};

export default function SchoolRequestStatus({
  schoolName,
  viewState,
}: SchoolRequestStatusProps) {
  const content = SCHOOL_REQUEST_STATUS_CONTENT[viewState];

  return (
    <Box sx={S.container} aria-live="polite">
      <Box sx={S.statusDot(viewState)} aria-hidden="true">
        {content.symbol}
      </Box>
      <Typography component="h1" variant="h4" sx={S.title}>
        {content.title}
      </Typography>
      <Typography variant="h6">{schoolName}</Typography>
      <Typography sx={S.description}>{content.description}</Typography>
    </Box>
  );
}
