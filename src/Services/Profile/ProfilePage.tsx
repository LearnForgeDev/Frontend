import { Box, Typography } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { CreateEventModal } from '@/Services/Scheduling/components/CreateEventModal/CreateEventModal';
import { useProfilePage } from './hooks/useProfilePage';
import { ProfileSectionCard } from './components/ProfileSectionCard/ProfileSectionCard';
import { ProfileCard } from './components/ProfileCard/ProfileCard';
import { PROFILE_PAGE_TEXT } from './ProfilePage.const';
import * as S from './ProfilePage.styles';

export default function ProfilePage() {
  const profile = useProfilePage();
  const { user, schoolsQuery, schedule } = profile;

  if (!user) {
    return (
      <Box sx={S.notAuthContainerSx}>
        <Typography>{PROFILE_PAGE_TEXT.notAuthorized}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={S.pageRootSx}>
      <Box component="header" sx={S.headerSx}>
        <Typography component="h1" sx={S.pageTitleSx}>{PROFILE_PAGE_TEXT.title}</Typography>
        <Typography sx={S.subtitleSx}>{PROFILE_PAGE_TEXT.subtitle}</Typography>
      </Box>
      <ProfileCard user={user} onLogout={profile.logout} />
      <Box sx={S.contentGridSx}>
        <ProfileSectionCard
          title={PROFILE_PAGE_TEXT.schoolsTitle}
          actionLabel={PROFILE_PAGE_TEXT.addSchool}
          actionIcon={<EditRoundedIcon />}
          onAction={profile.addSchool}
          itemIcon={<SchoolOutlinedIcon />}
          items={profile.schoolItems}
          isLoading={schoolsQuery.isLoading}
          isError={schoolsQuery.isError}
          errorText={PROFILE_PAGE_TEXT.schoolsError}
          emptyText={PROFILE_PAGE_TEXT.schoolsEmpty}
        />
        <ProfileSectionCard
          title={PROFILE_PAGE_TEXT.upcomingLessonTitle}
          actionLabel={PROFILE_PAGE_TEXT.createLesson}
          onAction={profile.canCreateLesson ? profile.openCreateLesson : undefined}
          itemIcon={<EventNoteIcon />}
          items={profile.lessonItems}
          isLoading={schedule.isLoading}
          isError={schedule.isError}
          errorText={PROFILE_PAGE_TEXT.scheduleError}
          emptyText={PROFILE_PAGE_TEXT.upcomingLessonEmpty}
        />
      </Box>
      {profile.canCreateLesson && profile.isCreateLessonOpen && (
        <CreateEventModal onClose={profile.closeCreateLesson} />
      )}
    </Box>
  );
}
