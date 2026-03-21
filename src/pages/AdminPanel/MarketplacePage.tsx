import React from 'react';
import '../../styles/pages/AdminPanel/marketplace.css';
import MarketplaceBanner from "./Components/MarketplacePage/MarketplaceBanner.tsx";
import MarketplaceServiceGrid from "./Components/MarketplacePage/MarketplaceServiceGrid.tsx";
import MarketplaceUpgrade from "./Components/MarketplacePage/MarketplaceUpgrade.tsx";

const MarketplacePage: React.FC = () => {
    return (
        <div className="admin-page">
            <MarketplaceBanner />
            <MarketplaceServiceGrid />
            <MarketplaceUpgrade />
        </div>
    );
};

export default MarketplacePage;
