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
  const { Icon, title, description } = SCHOOL_REQUEST_STATUS_CONTENT[viewState];

  return (
    <Box sx={S.container} aria-live="polite">
      <Box sx={S.header}>
        <Box sx={S.heading}>
          <Typography component="h1" variant="h4" sx={S.title}>
            {title}
          </Typography>
          <Typography variant="h6" sx={S.schoolName}>{schoolName}</Typography>
        </Box>
        <Box sx={S.statusIcon(viewState)} aria-hidden="true">
          <Icon />
        </Box>
      </Box>
      <Typography sx={S.description}>{description}</Typography>
    </Box>
  );
}
