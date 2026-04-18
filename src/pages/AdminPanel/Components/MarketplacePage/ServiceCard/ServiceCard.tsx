import {type JSX, type KeyboardEvent, type MouseEventHandler, useState} from "react";
import { Box, Button, Chip, List, ListItem, Typography } from "@mui/material";
import type {ServiceManifest} from "../../../../../types/serviceTypes.ts";
import {useServiceContext} from "../../../hooks/useServiceContext.ts";

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
    };

    const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        }
    };

    return (
        <Box
            component="article"
            className={`admin-card admin-marketplace-card ${service.isBought || isSelected ? 'active' : 'inactive'} ${isSelected ? 'selected' : ''}`}
            onClick={handleToggle}
            onKeyDown={handleCardKeyDown}
            role="button"
            tabIndex={0}
        >
            <Box className="admin-marketplace-card-body">
                <Box className="admin-marketplace-card-header">
                    <Box className="admin-marketplace-icon-box">
                        <span className="material-symbols-outlined">{service.icon}</span>
                    </Box>
                    {service.isBought ? (
                        <Chip
                            label={service.isEnabled ? 'Включен' : 'Выключен'}
                            className={`admin-chip ${service.isEnabled ? 'active' : 'inactive'}`}
                        />
                    ) : null}
                </Box>

                <Typography component="h3" className="admin-marketplace-card-title">
                    {service.name}
                </Typography>

                <Typography component="p" className="admin-marketplace-card-desc">
                    {service.description}
                </Typography>

                <List disablePadding className="admin-marketplace-feature-list">
                    {service.features.map((feature) => (
                        <ListItem key={feature} disablePadding className="admin-marketplace-feature-item">
                            <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            <span>{feature}</span>
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box className="admin-marketplace-card-footer">
                <Typography component="span" className={`admin-marketplace-price${service.price === 0 ? '-free' : ''}`}>
                    {service.price === 0 ? 'Бесплатно' : `${service.price}`}
                </Typography>
                <Button
                    className={`admin-button ${service.isEnabled ? 'ghost' : 'primary'}`}
                    onClick={handleButtonPress}
                    disableRipple
                >
                    {service.isBought
                        ? service.isEnabled
                            ? 'Управление'
                            : 'Включить'
                        : 'Купить'
                    }
                </Button>
            </Box>
        </Box>
    );
}
