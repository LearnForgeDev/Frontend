import {type JSX, useCallback, useEffect, useState} from "react";
import {serviceRegistry} from "../../../../../services/ServiceRegistry.ts";
import {ServiceContextProvider} from "../ServiceContextProvider/ServiceContextProvider.tsx";
import BillingCard from "../BillingCard/BillingCard.tsx";
import ServiceCard from "../ServiceCard/ServiceCard.tsx";
import ComingSoonCard from "../ComingSoonCard/ComingSoonCard.tsx";
import {getServicesFromServer} from "../../../../../endpoints/admin.ts";

export default function MarketplaceServiceGrid(): JSX.Element {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getServicesWithRetries = useCallback((retries: number) => {
        const getService = (retry: number) => {
            if (retry > retries) {
                return ;
            }

            getServicesFromServer()
                .then(services => {serviceRegistry.register(services)})
                .catch( () => getService( ++retry ) )
                .finally(() => setIsLoading(false));
        }

        getService(0);
    }, []);

    useEffect(() => {
        getServicesWithRetries(3);
    }, [getServicesWithRetries])

    if (isLoading) {
        return <SkeletonBox />
    }

    return (
        <ServiceContextProvider>
            <CardsContent />
        </ServiceContextProvider>
    );
}

const CardsContent = (): JSX.Element => {
    return (
        <div className="admin-marketplace-grid">
            {serviceRegistry.getAll().map(service => (
                <ServiceCard
                    key={service.id}
                    service={service}
                />
            ))}
            <ComingSoonCard />
            <BillingCard />
        </div>
    );

}

const SkeletonBox = (): JSX.Element => {
    return (
        <div className={"admin-marketplace-grid"}>
            {
                Array.from({length: 6}).map((_, index) => (
                    <div key={index} className='admin-card admin-marketplace-card skeleton' />
                ))
            }
        </div>
    );
}
