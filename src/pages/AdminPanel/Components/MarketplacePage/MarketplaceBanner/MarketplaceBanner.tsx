import type {JSX} from "react";
import {Box, Typography} from "@mui/material";

export default function MarketplaceBanner(): JSX.Element {
    return (
        <Box component="section" className="admin-marketplace-hero admin-card">
            <Box component="div" className="admin-marketplace-hero-content">
                <Typography component="h1" className="admin-page-title">
                    <span>Создайте свое рабочее пространство.</span>
                    <Box component="br" />
                    Платите только за то, чем пользуетесь.
                </Typography>
                <Typography component="p" className="admin-page-description">
                    LearnForge растет вместе с Вами.
                    Масштабируйтесь или ли сохраняйте минималистичный набор для уроков.
                </Typography>
            </Box>
            <Box component="div" className="admin-marketplace-hero-orbit" aria-hidden="true" />
        </Box>
    );
}
