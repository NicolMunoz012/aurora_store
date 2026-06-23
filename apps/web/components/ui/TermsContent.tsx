// =============================================================================
// components/ui/TermsContent.tsx — Terms & Conditions content (cards layout)
// =============================================================================

export function TermsContent() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500 italic">
        Última actualización: junio 2026
      </p>

      <LegalCard title="Uso de la cuenta">
        <p>Al crear una cuenta en Aurora Belleza aceptas proporcionar información veraz y mantener tus credenciales de acceso de forma confidencial.</p>
        <p>Cada cuenta es personal e intransferible. El uso indebido puede resultar en la suspensión del acceso sin previo aviso.</p>
      </LegalCard>

      <LegalCard title="Compras y pagos">
        <p>Los precios mostrados en el catálogo son los precios finales vigentes al momento de realizar tu pedido.</p>
        <p>El precio mayorista se aplica automáticamente cuando el subtotal del carrito alcanza el umbral configurado por la tienda.</p>
        <p>La coordinación del pago se realiza directamente por WhatsApp con nuestro equipo una vez confirmado el pedido.</p>
      </LegalCard>

      <LegalCard title="Pedidos y confirmación">
        <p>Al confirmar tu pedido, este se registra en estado "por confirmar" y se genera un mensaje de WhatsApp para coordinar el pago y envío.</p>
        <p>Los pedidos no confirmados dentro del plazo establecido serán cancelados automáticamente por el sistema.</p>
        <p>Aurora Belleza se reserva el derecho de cancelar pedidos por falta de stock o información incorrecta.</p>
      </LegalCard>

      <LegalCard title="Envíos">
        <p>Realizamos envíos a todo Colombia. El costo de envío será comunicado por WhatsApp una vez recibamos tu pedido.</p>
        <p>También ofrecemos la opción de retiro en tienda en nuestra dirección física.</p>
        <p>Los tiempos de entrega dependen de la ubicación y la transportadora seleccionada.</p>
      </LegalCard>

      <LegalCard title="Devoluciones y cambios">
        <p>Para gestionar devoluciones o cambios, contáctanos directamente por WhatsApp.</p>
        <p>El producto debe estar en su empaque original y sin uso. Las devoluciones se procesan de forma manual con nuestro equipo.</p>
      </LegalCard>

      <LegalCard title="Propiedad intelectual">
        <p>Todo el contenido de Aurora Belleza — incluyendo imágenes, textos, logotipos y diseño — es propiedad exclusiva de la marca.</p>
        <p>Queda prohibida su reproducción sin autorización escrita.</p>
      </LegalCard>

      <LegalCard title="Contacto">
        <p>Para cualquier consulta sobre estos términos, puedes comunicarte con nosotros a través de WhatsApp o nuestras redes sociales.</p>
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
