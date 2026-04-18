import React, { type JSX } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import { serviceRegistry } from '../../../services/ServiceRegistry';
import type { ServiceManifest } from "../../../types/serviceTypes.ts";

const DashboardHome: React.FC = () => {
    const services = serviceRegistry.getAll();
    const widgetServices = services.filter((service) => Boolean(service.DashboardWidget));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <Box>
                    <Typography
                        component="h1"
                        sx={{
                            margin: 0,
                            color: 'var(--admin-text)',
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '1.9rem',
                            fontWeight: 800,
                            lineHeight: 1.2,
                        }}
                    >
                        Dashboard
                    </Typography>
                    <Typography sx={{ margin: '0.35rem 0 0', color: 'var(--admin-muted)', maxWidth: '680px' }}>
                        Live status of services, users, and platform health.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    sx={{
                        borderRadius: '0.7rem',
                        fontSize: '0.85rem',
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 700,
                        padding: '0.6rem 0.9rem',
                        background: 'var(--admin-primary)',
                        textTransform: 'none',
                        '&:hover': {
                            background: 'var(--admin-primary)',
                            filter: 'brightness(0.96)',
                        },
                    }}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {widgetServices.length === 0 ? (
                    <WidgetsPlaceholder />
                ) : (
                    widgetServices.map((service) => <ServiceWidget key={service.id} service={service} />)
                )}
            </Box>
        </Box>
    );
};

export default DashboardHome;

const WidgetsPlaceholder = (): JSX.Element => {
    return (
        <Box
            sx={{
                border: '1px dashed var(--admin-outline)',
                borderRadius: '1.5rem',
                background: 'var(--admin-surface)',
                padding: '1.75rem',
                color: 'var(--admin-muted)',
            }}
        >
            <Typography component="h3" sx={{ margin: 0, color: 'var(--admin-text)', fontFamily: 'Manrope, sans-serif' }}>
                No service widgets yet
            </Typography>
            <Typography sx={{ marginTop: '0.35rem' }}>
                Install and activate services in Marketplace to display operational metrics here.
            </Typography>
        </Box>
    );
};

const ServiceWidget = ({ service }: { service: ServiceManifest }): JSX.Element | null => {
    const Widget = service.DashboardWidget;
    if (!Widget) {
        return null;
    }

    return (
        <Box
            component="article"
            sx={{
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1.5rem',
                boxShadow: 'var(--admin-shadow)',
                padding: '1.1rem',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Box sx={{ display: 'inline-flex', color: 'var(--admin-primary)' }}>{service.icon}</Box>
                    <Typography component="h3" sx={{ margin: 0, fontSize: '1rem', color: 'var(--admin-text)' }}>
                        {service.name}
                    </Typography>
                </Box>
                <Chip
                    label="Active"
                    size="small"
                    sx={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderRadius: '999px',
                        color: 'var(--admin-secondary)',
                        background: 'rgba(197, 237, 199, 0.35)',
                    }}
                />
            </Box>
            <Widget />
        </Box>
    );
};
