import type {JSX} from 'react';
import {useServiceContext} from '@/Services/AdminPanel/hooks/useServiceContext';
import {serviceRegistry} from '@/Services/ServiceRegistry';

import type { ServiceManifest } from '@/Assets/Types/serviceTypes';

export default function BillingCard (): JSX.Element {
    const services = serviceRegistry.getAll();
    const {selectedServices} = useServiceContext();
    const boughtServices = services.filter(service => service.isBought);

    const totalPrice =
        selectedServices.reduce((sum: number, service: ServiceManifest) => sum + service.price, 0)
            + boughtServices.reduce((sum: number, service: ServiceManifest) => sum + service.price, 0);


    return (
        <article className="admin-marketplace-billing">
            <h3>Ваш тариф</h3>
            <div >
                {
                    boughtServices
                        .concat(selectedServices)
                        .map((service) => (
                    <div
                        key={service.id}
                        className={`admin-marketplace-billing-row ${ !service.isBought ? 'new' : ''}`}
                    >
                        <span>{service.name}</span>
                        <span>{service.price}</span>
                    </div>
                    ))

                }
            </div>
            <div className="admin-marketplace-billing-total">
                <span>Итого в месяц</span>
                <strong className={'admin-marketplace-price'}>{totalPrice}</strong>
            </div>
            {selectedServices.length > 0
                ? (
                    <button className="admin-button primary" type="button">
                        Оформить подписку
                    </button>
                ) : null}

        </article>
    );
};
