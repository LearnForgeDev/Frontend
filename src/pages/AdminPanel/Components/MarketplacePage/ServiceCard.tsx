import {type JSX, type MouseEventHandler, useState} from "react";
import type {ServiceManifest} from "../../../../types/serviceTypes.ts";
import {useServiceContext} from "../../hooks/useServiceContext.ts";

export default function ServiceCard ({service}: {service: ServiceManifest}): JSX.Element {
    const {selectService, deselectService} = useServiceContext();
    const [isSelected, setSelected] = useState<boolean>(false);

    const handleToggle = (): void => {
        if (service.isBought) {
            return;
        }

        if (isSelected) {
            deselectService(service);
            setSelected(false);
            return;
        }

        selectService(service);
        setSelected(true);
    };

    const handleButtonPress: MouseEventHandler<HTMLButtonElement> = (event): void => {
        event.stopPropagation();
    }

    return (
        <div key={service.id}
             className={`admin-card admin-marketplace-card 
                    ${service.isBought || isSelected ? 'active' : 'inactive'}
                    ${isSelected ? 'selected' : ''}`}
             onClick={handleToggle}
        >
            <div className="admin-marketplace-card-body">
                <div className="admin-marketplace-card-header">
                    <div className="admin-marketplace-icon-box">
                        <span className="material-symbols-outlined">{service.icon}</span>
                    </div>
                    <span
                        className={`admin-chip ${service.isEnabled ? 'active' : 'inactive'}`}
                        style={ service.isBought ? {} : {display: "none"} }
                    >
                    {service.isEnabled ? 'Включен' : 'Выключен'}
                </span>
                </div>

                <h3 className="admin-marketplace-card-title">{service.name}</h3>

                <p className="admin-marketplace-card-desc">
                    {service.description}
                </p>

                <ul className="admin-marketplace-feature-list">
                    {service.features.map((feature) => (
                        <li key={feature} className="admin-marketplace-feature-item">
                            <input
                                className="material-symbols-outlined"
                                type="checkbox"
                            />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="admin-marketplace-card-footer">
                <span className={`admin-marketplace-price${service.price === 0 ? '-free' : ''}`}>
                    {service.price === 0 ? 'Бесплатно' : `${service.price}`}
                </span>
                <button
                    className={`admin-button ${service.isEnabled ? 'ghost' : 'primary'}`}
                    onClick={handleButtonPress}
                >
                    {service.isBought
                        ? service.isEnabled
                            ? 'Управление'
                            : 'Включить'
                        : 'Купить'
                    }
                </button>
            </div>
        </div>
    );
}