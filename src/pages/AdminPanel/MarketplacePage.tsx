import React from 'react';
import { Box, GlobalStyles } from '@mui/material';
import MarketplaceBanner from "./Components/MarketplacePage/MarketplaceBanner/MarketplaceBanner.tsx";
import MarketplaceServiceGrid from "./Components/MarketplacePage/MarketplaceServiceGrid/MarketplaceServiceGrid.tsx";
import MarketplaceUpgrade from "./Components/MarketplacePage/MarketplaceUpgrade/MarketplaceUpgrade.tsx";
import { marketplacePageStyles } from './Components/MarketplacePage/MarketplacePage.styles';

const MarketplacePage: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <GlobalStyles styles={marketplacePageStyles} />
            <MarketplaceBanner />
            <MarketplaceServiceGrid />
            <MarketplaceUpgrade />
        </Box>
    );
};

export default MarketplacePage;
