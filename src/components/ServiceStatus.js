import React from 'react';

const ServiceStatus = ({ services }) => {
    if (!services || services.length === 0) {
        return (
            <div className="card">
                <h3>Service Status</h3>
                <p>Loading services...</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3>🔧 Service Status</h3>
            <div style={{ marginTop: '15px' }}>
                {services.map((service, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        margin: '5px 0',
                        background: service.status === 'healthy' ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                        borderRadius: '6px',
                        border: `1px solid ${service.status === 'healthy' ? '#00d4aa' : '#ff4757'}`
                    }}>
                        <div>
                            <strong>{service.service}</strong>
                            <br />
                            <small style={{ opacity: 0.7 }}>{service.url}</small>
                        </div>
                        <div style={{
                            color: service.status === 'healthy' ? '#00d4aa' : '#ff4757',
                            fontWeight: 'bold'
                        }}>
                            {service.status === 'healthy' ? '✅ HEALTHY' : '❌ DOWN'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceStatus;