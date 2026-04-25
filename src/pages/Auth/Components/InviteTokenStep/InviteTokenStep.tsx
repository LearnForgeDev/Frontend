import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

import * as S from './InviteTokenStep.styles';

type InviteTokenStepProps = {
    inviteToken: string;
    onInviteTokenChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function InviteTokenStep({ inviteToken, onInviteTokenChange }: InviteTokenStepProps) {
    return (
        <>
            <Box sx={S.pillInputWrapper}>
                <TextField
                    variant="outlined"
                    value={inviteToken}
                    onChange={onInviteTokenChange}
                    required
                    fullWidth
                    autoFocus
                    slotProps={{
                        htmlInput: {
                            maxLength: 6,
                        },
                    }}
                    sx={S.hideNativeInput}
                />

                <Box sx={S.slotsContainer}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Box key={i} sx={S.getSlotBoxStyle(inviteToken.length === i, !!inviteToken[i])}>
                            <Typography variant="h5" sx={S.slotText}>
                                {inviteToken[i] || ''}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={S.pillButton}
            >
                Далее
            </Button>
        </>
    );
}

