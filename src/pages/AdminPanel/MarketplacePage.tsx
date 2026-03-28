import React from 'react';
import MarketplaceBanner from "./Components/MarketplacePage/MarketplaceBanner/MarketplaceBanner.tsx";
import MarketplaceServiceGrid from "./Components/MarketplacePage/MarketplaceServiceGrid/MarketplaceServiceGrid.tsx";
import MarketplaceUpgrade from "./Components/MarketplacePage/MarketplaceUpgrade/MarketplaceUpgrade.tsx";

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
