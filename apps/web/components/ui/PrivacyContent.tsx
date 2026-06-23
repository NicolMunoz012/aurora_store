// =============================================================================
// components/ui/PrivacyContent.tsx — Privacy Policy content (cards layout)
// =============================================================================

export function PrivacyContent() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500 italic">
        Última actualización: junio 2026
      </p>

      <LegalCard title="Datos que recopilamos">
        <p>Recopilamos únicamente la información necesaria para procesar tus pedidos: nombre, teléfono, correo electrónico (opcional) y dirección de envío.</p>
        <p>Si creas una cuenta, almacenamos tu nombre, correo y contraseña (encriptada).</p>
      </LegalCard>

      <LegalCard title="Uso de tus datos">
        <p>Tu información se utiliza exclusivamente para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Procesar y coordinar tus pedidos</li>
          <li>Contactarte por WhatsApp sobre el estado de tu compra</li>
          <li>Enviar confirmación de pedido por correo (si proporcionaste email)</li>
          <li>Mejorar tu experiencia de compra</li>
        </ul>
        <p className="font-medium text-gray-700 mt-2">No vendemos, alquilamos ni compartimos tus datos con terceros para fines de marketing.</p>
      </LegalCard>

      <LegalCard title="Protección de datos">
        <p>Tus datos se almacenan en servidores seguros con encriptación. Las contraseñas se protegen mediante algoritmos de hash de alta seguridad.</p>
        <p>Implementamos medidas técnicas y organizativas para proteger tu información contra acceso no autorizado.</p>
      </LegalCard>

      <LegalCard title="Cookies y almacenamiento local">
        <p>Utilizamos cookies técnicas esenciales para mantener tu sesión activa y tu carrito de compras.</p>
        <p>No utilizamos cookies de terceros ni herramientas de rastreo publicitario.</p>
      </LegalCard>

      <LegalCard title="Tus derechos">
        <p>Tienes derecho a:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Acceder a tus datos personales desde tu perfil</li>
          <li>Modificar tu información en cualquier momento</li>
          <li>Solicitar la eliminación de tu cuenta y datos asociados</li>
        </ul>
        <p>Para ejercer estos derechos, contáctanos por WhatsApp.</p>
      </LegalCard>

      <LegalCard title="Seguridad">
        <p>Toda la comunicación con nuestra plataforma está protegida mediante conexiones seguras (HTTPS/SSL).</p>
        <p>No almacenamos datos de pago — toda coordinación de pago se realiza directamente por WhatsApp.</p>
      </LegalCard>

      <LegalCard title="Contacto">
        <p>Para consultas sobre privacidad y protección de datos, comunícate con nosotros por WhatsApp o nuestras redes sociales.</p>
      </LegalCard>
    </div>
  );
}

function LegalCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-blush-soft border border-gray-100 rounded-md p-5">
      <h3 className="font-serif text-lg text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
