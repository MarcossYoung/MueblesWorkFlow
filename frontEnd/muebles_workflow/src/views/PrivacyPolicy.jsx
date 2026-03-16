import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d3436', lineHeight: '1.7' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Política de Privacidad</h1>
            <p style={{ color: '#636e72', marginBottom: '32px' }}>Última actualización: marzo 2026</p>

            <section style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>1. Información que recopilamos</h2>
                <p>MueblesWorkFlow recopila la información que usted nos proporciona directamente al registrarse y utilizar el sistema, incluyendo:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>Nombre de usuario y contraseña (almacenada de forma cifrada)</li>
                    <li>Datos de pedidos: título, descripción, fechas y precios</li>
                    <li>Número de teléfono del cliente para gestión de pedidos</li>
                    <li>Información de pagos asociada a cada pedido</li>
                    <li>Fotos de productos subidas voluntariamente</li>
                </ul>
            </section>

            <section style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>2. Cómo usamos su información</h2>
                <p>Utilizamos la información recopilada exclusivamente para:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>Gestionar el flujo de producción y seguimiento de pedidos</li>
                    <li>Facilitar la comunicación interna entre los integrantes del taller</li>
                    <li>Generar reportes financieros y análisis del negocio</li>
                    <li>Enviar notificaciones automáticas de confirmación de pedidos (vía WhatsApp, si está configurado)</li>
                </ul>
            </section>

            <section style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>3. Almacenamiento y seguridad</h2>
                <p>
                    Los datos se almacenan en servidores en la nube con cifrado en tránsito (HTTPS). Las contraseñas se guardan utilizando hash BCrypt y nunca se almacenan en texto plano. El acceso a los datos está restringido por roles (ADMIN, SELLER, USER) y autenticado mediante tokens JWT.
                </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>4. Compartir información con terceros</h2>
                <p>
                    No vendemos, alquilamos ni compartimos su información personal con terceros con fines comerciales. La información puede ser procesada por servicios de infraestructura (alojamiento en la nube, almacenamiento de imágenes) necesarios para el funcionamiento del sistema.
                </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>5. Sus derechos</h2>
                <p>Usted tiene derecho a:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li>Acceder a la información almacenada sobre usted</li>
                    <li>Solicitar la corrección de datos incorrectos</li>
                    <li>Solicitar la eliminación de su cuenta y datos asociados</li>
                </ul>
            </section>

            <section style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3436', marginBottom: '8px' }}>6. Contacto</h2>
                <p>
                    Si tiene preguntas sobre esta política de privacidad o sobre el manejo de sus datos, puede comunicarse con el administrador del sistema a través de los canales internos del taller.
                </p>
            </section>

            <p style={{ fontSize: '0.85rem', color: '#b2bec3', marginTop: '40px', borderTop: '1px solid #dfe6e9', paddingTop: '20px' }}>
                MueblesWorkFlow — Sistema de gestión de producción de muebles
            </p>
        </div>
    );
}
