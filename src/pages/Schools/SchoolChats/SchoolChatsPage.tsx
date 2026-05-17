import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import { useParams } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";

import { useUser } from "../../../contexts/UserContext";
import { useSignalRChat } from "../../../hooks/useSignalRChat";
import { getAllBranches } from "../../../endpoints/Branches";
import type { BranchDto } from "../../../types/chatTypes";
import config from "../../../config";

import * as styles from "./SchoolChatsPage.styles";

const SchoolChatsPage = () => {
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const { user } = useUser();

  const [tab, setTab] = useState<"branches" | "direct">("branches");
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchDto | null>(null);
  const [selectedUser, setSelectedUser] = useState<{
    publicId: string;
    name: string;
  } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Load branches
  useEffect(() => {
    if (schoolPublicId && user?.jwtToken && tab === "branches") {
      setLoadingBranches(true);
      getAllBranches(user.jwtToken, schoolPublicId)
        .then((data) => {
          setBranches(data);
          if (data.length > 0 && !selectedBranch) {
            setSelectedBranch(data[0]);
          }
        })
        .finally(() => setLoadingBranches(false));
    }
  }, [schoolPublicId, user?.jwtToken, tab, selectedBranch]);

  // SignalR configuration
  const hubOptions = useMemo(() => {
    if (!schoolPublicId || !user?.jwtToken)
      return { hubUrl: null, sendMethod: "", buildSendArgs: () => [] };

    if (tab === "branches" && selectedBranch) {
      return {
        hubUrl: `${config.endpointUrl}/chatHub?schoolPublicId=${schoolPublicId}&breanchId=${selectedBranch.id}`,
        sendMethod: "SendMessageToBreanch",
        buildSendArgs: (msg: string) => [
          schoolPublicId,
          selectedBranch.id,
          msg,
        ],
        jwtToken: user.jwtToken,
        localUserName: user.userName,
      };
    }

    if (tab === "direct" && selectedUser) {
      return {
        hubUrl: `${config.endpointUrl}/directChatHub?schoolPublicId=${schoolPublicId}&otherUserId=${selectedUser.publicId}`,
        sendMethod: "SendMessageToDirect",
        buildSendArgs: (msg: string) => [
          schoolPublicId,
          selectedUser.publicId,
          msg,
        ],
        jwtToken: user.jwtToken,
        localUserName: user.userName,
      };
    }

    return { hubUrl: null, sendMethod: "", buildSendArgs: () => [] };
  }, [schoolPublicId, user, tab, selectedBranch, selectedUser]);

  const { status, messages, sendMessage, isConnected, resetMessages } =
    useSignalRChat(hubOptions);

  // Reset messages when target changes
  useEffect(() => {
    resetMessages();
  }, [selectedBranch, selectedUser, tab, resetMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    const result = await sendMessage(messageText);
    if (result.ok) {
      setMessageText("");
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "connected":
        return "success";
      case "connecting":
      case "reconnecting":
        return "warning";
      case "disconnected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={styles.pageSx}>
      <Box sx={styles.headerRowSx}>
        <Box>
          <Typography component="h1" className="admin-page-title">
            Чаты школы
          </Typography>
          <Typography className="admin-page-description">
            Общайтесь в ветках обучения или напрямую с участниками.
          </Typography>
        </Box>
        <Chip
          label={status}
          color={getStatusColor(status) as any}
          size="small"
          sx={styles.statusChipSx}
        />
      </Box>

      <Paper
        className="admin-card"
        sx={{ display: "flex", height: "70vh", overflow: "hidden" }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: 280,
            borderRight: "1px solid var(--admin-border)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{ borderBottom: "1px solid var(--admin-border)" }}
          >
            <Tab label="Ветки" value="branches" />
            <Tab label="Личные" value="direct" />
          </Tabs>

          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {tab === "branches" ? (
              <List>
                {loadingBranches && (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
                {branches.map((b) => (
                  <ListItemButton
                    key={b.id}
                    selected={selectedBranch?.id === b.id}
                    onClick={() => setSelectedBranch(b)}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                      <GroupIcon />
                    </Avatar>
                    <ListItemText
                      primary={b.name}
                      secondary={b.description}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Выберите пользователя для начала чата.
                </Typography>
                {/* User list would go here */}
              </Box>
            )}
          </Box>
        </Box>

        {/* Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            bgcolor: "var(--admin-bg)",
          }}
        >
          {selectedBranch || selectedUser ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid var(--admin-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "var(--admin-surface)",
                }}
              >
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  {tab === "branches" ? <GroupIcon /> : <PersonIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {tab === "branches"
                      ? selectedBranch?.name
                      : selectedUser?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tab === "branches"
                      ? selectedBranch?.description
                      : "Личный чат"}
                  </Typography>
                </Box>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {messages.length === 0 && (
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.5,
                    }}
                  >
                    <Typography>Сообщений пока нет</Typography>
                  </Box>
                )}
                {messages.map((m) => {
                  const isMine = m.senderName === user?.userName;
                  return (
                    <Box
                      key={m.id}
                      sx={{
                        maxWidth: "70%",
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isMine
                          ? "primary.main"
                          : "var(--admin-surface)",
                        color: isMine
                          ? "primary.contrastText"
                          : "var(--admin-text)",
                        border: "1px solid var(--admin-border)",
                        position: "relative",
                      }}
                    >
                      {!isMine && (
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
                        >
                          {m.senderName}
                        </Typography>
                      )}
                      <Typography variant="body2">{m.message}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          mt: 0.5,
                          opacity: 0.7,
                        }}
                      >
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Input */}
              <Divider />
              <Box
                sx={{
                  p: 2,
                  bgcolor: "var(--admin-surface)",
                  display: "flex",
                  gap: 1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Введите сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={!isConnected}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!isConnected || !messageText.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">
                Выберите ветку или пользователя
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SchoolChatsPage;
