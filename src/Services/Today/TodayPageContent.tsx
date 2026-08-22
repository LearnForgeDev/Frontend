import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ClipLoader } from 'react-spinners';
import { JoinButton } from '@/Services/Scheduling/components/JoinButton/JoinButton';
import {
  formatEventFullDateTime,
  formatEventTimeRange,
} from '@/Services/Scheduling/utils/time.utils';
import { TODAY_PAGE_TEXT } from './TodayPage.const';
import { useTodayPage } from './hooks/useTodayPage/useTodayPage';
import * as S from './TodayPage.styles';

export default function TodayPageContent() {
  const {
    userName,
    dateLabel,
    canTeach,
    canManageSchool,
    studentCount,
    isSchoolSummaryLoading,
    isSchoolSummaryError,
    isCreatingLesson,
    upcomingEvent,
    todayEvents,
    recentLessons,
    isScheduleLoading,
    isScheduleError,
    isLessonsLoading,
    isLessonsError,
    createLesson,
    scheduleLesson,
    openSchedule,
    openEvent,
    openLessons,
    openLesson,
  } = useTodayPage();

  return (
    <Box sx={S.pageSx}>
      <Box component="header" sx={S.headerSx}>
        <Box>
          <Typography component="h1" sx={S.titleSx}>
            {TODAY_PAGE_TEXT.title}{userName ? `, ${userName}` : ''}
          </Typography>
          <Typography sx={S.dateSx}>{dateLabel}</Typography>
        </Box>

        {canTeach && (
          <Box sx={S.actionsSx}>
            <Button
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={scheduleLesson}
              sx={S.secondaryActionSx}
            >
              {TODAY_PAGE_TEXT.scheduleLesson}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={isCreatingLesson}
              onClick={createLesson}
              sx={S.primaryActionSx}
            >
              {isCreatingLesson ? (
                <ClipLoader size={18} color="#ffffff" />
              ) : (
                TODAY_PAGE_TEXT.createLesson
              )}
            </Button>
          </Box>
        )}
      </Box>

      <Paper component="section" elevation={0} sx={S.heroSx}>
        <Box sx={S.heroContentSx}>
          <Typography sx={S.eyebrowSx}>{TODAY_PAGE_TEXT.nextLesson}</Typography>
          {isScheduleError ? (
            <Typography component="h2" sx={S.heroTitleSx}>
              {TODAY_PAGE_TEXT.scheduleError}
            </Typography>
          ) : isScheduleLoading ? (
            <Box sx={S.stateSx}>
              <ClipLoader size={28} color="#ffffff" />
            </Box>
          ) : upcomingEvent ? (
            <>
              <Typography component="h2" sx={S.heroTitleSx}>
                {upcomingEvent.title}
              </Typography>
              <Typography sx={S.heroMetaSx}>
                {formatEventFullDateTime(upcomingEvent.start, upcomingEvent.end)}
              </Typography>
            </>
          ) : (
            <Typography component="h2" sx={S.heroTitleSx}>
              {TODAY_PAGE_TEXT.noUpcomingLessons}
            </Typography>
          )}
        </Box>

        {upcomingEvent && !isScheduleLoading && !isScheduleError && (
          <Box sx={S.heroActionsSx}>
            <JoinButton event={upcomingEvent} size="medium" />
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => openEvent(upcomingEvent.id)}
              sx={S.heroSecondaryButtonSx}
            >
              {TODAY_PAGE_TEXT.openCalendar}
            </Button>
          </Box>
        )}
      </Paper>

      {canManageSchool && (
        <Paper component="section" elevation={0} sx={S.schoolSummarySx}>
          <Typography component="h2" sx={S.schoolSummaryHeadingSx}>
            {TODAY_PAGE_TEXT.schoolSummary}
          </Typography>

          {isSchoolSummaryError ? (
            <Typography color="error">{TODAY_PAGE_TEXT.schoolSummaryError}</Typography>
          ) : isSchoolSummaryLoading ? (
            <ClipLoader size={22} color="var(--admin-primary)" />
          ) : (
            <Box sx={S.schoolSummaryMetricSx}>
              <Typography sx={S.schoolSummaryValueSx}>{studentCount}</Typography>
              <Typography sx={S.schoolSummaryLabelSx}>
                {TODAY_PAGE_TEXT.studentsCount}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      <Box sx={S.contentGridSx}>
        <Paper component="section" elevation={0} sx={S.sectionSx}>
          <Box sx={S.sectionHeaderSx}>
            <Typography component="h2" sx={S.sectionTitleSx}>
              {TODAY_PAGE_TEXT.todaySchedule}
            </Typography>
            <Button onClick={openSchedule} sx={S.textActionSx}>
              {TODAY_PAGE_TEXT.openCalendar}
            </Button>
          </Box>

          {isScheduleError ? (
            <Alert severity="error">{TODAY_PAGE_TEXT.scheduleError}</Alert>
          ) : isScheduleLoading ? (
            <Box sx={S.stateSx}>
              <ClipLoader size={28} color="var(--admin-primary)" />
            </Box>
          ) : todayEvents.length === 0 ? (
            <Typography sx={S.stateSx}>{TODAY_PAGE_TEXT.emptySchedule}</Typography>
          ) : (
            <Box sx={S.listSx}>
              {todayEvents.map((event) => (
                <Box key={event.id} sx={S.scheduleRowSx}>
                  <Typography sx={S.timeSx}>
                    {formatEventTimeRange(event.start, event.end)}
                  </Typography>
                  <Box sx={S.itemTextSx}>
                    <Typography sx={S.itemTitleSx}>{event.title}</Typography>
                    {event.description && (
                      <Typography sx={S.itemDescriptionSx}>
                        {event.description}
                      </Typography>
                    )}
                  </Box>
                  <JoinButton event={event} />
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        <Paper component="section" elevation={0} sx={S.sectionSx}>
          <Box sx={S.sectionHeaderSx}>
            <Typography component="h2" sx={S.sectionTitleSx}>
              {TODAY_PAGE_TEXT.recentLessons}
            </Typography>
            <Button onClick={openLessons} sx={S.textActionSx}>
              {TODAY_PAGE_TEXT.openAllLessons}
            </Button>
          </Box>

          {isLessonsError ? (
            <Alert severity="error">{TODAY_PAGE_TEXT.lessonsError}</Alert>
          ) : isLessonsLoading ? (
            <Box sx={S.stateSx}>
              <ClipLoader size={28} color="var(--admin-primary)" />
            </Box>
          ) : recentLessons.length === 0 ? (
            <Typography sx={S.stateSx}>{TODAY_PAGE_TEXT.emptyLessons}</Typography>
          ) : (
            <Box sx={S.listSx}>
              {recentLessons.map((lesson) => (
                <Button
                  key={lesson.id}
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => openLesson(lesson.id, lesson.title)}
                  sx={S.lessonButtonSx}
                >
                  <Box sx={S.itemTextSx}>
                    <Typography sx={S.itemTitleSx}>{lesson.title}</Typography>
                    {lesson.description && (
                      <Typography sx={S.itemDescriptionSx}>
                        {lesson.description}
                      </Typography>
                    )}
                  </Box>
                </Button>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
