export const pillInputWrapper = {
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

export const hideNativeInput = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '50px',
        height: '64px',
    },
    '& input': {
        color: 'transparent',
        caretColor: 'transparent',
        '::selection': {
            background: 'transparent',
        },
    },
};

export const slotsContainer = {
    display: 'flex',
    gap: 1.5,
    position: 'absolute',
    pointerEvents: 'none',
};

export const getSlotBoxStyle = (isCurrent: boolean, hasValue: boolean) => ({
    width: 32,
    borderBottom: '2px solid',
    borderColor: isCurrent ? 'primary.main' : hasValue ? 'text.primary' : 'grey.400',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
});

export const slotText = {
    fontWeight: 'bold',
};

export const pillButton = {
    mt: 2,
    borderRadius: '50px',
};

