import { useEffect, type ReactNode } from 'react';

type LegalPage = 'terms' | 'privacy' | 'data-authorization' | 'account-deletion';

const EFFECTIVE_DATE = '3 de octubre de 2026';

function LegalLayout({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  useEffect(() => { document.title = `${title} | Piddop`; }, [title]);

  return (
    <main className="legal-page">
      <header className="legal-header">
        <a aria-label="Inicio de Piddop" className="legal-brand" href="/"><img src="/piddop-icon.png" alt="" /><span>Piddop</span></a>
        <nav aria-label="Documentos legales" className="legal-nav">
          <a href="/terminos-condiciones">Términos</a>
          <a href="/politica-privacidad">Privacidad</a>
          <a href="/autorizacion-datos">Datos</a>
          <a href="/eliminar-cuenta">Eliminar cuenta</a>
        </nav>
      </header>
      <section className="legal-hero">
        <p>DOCUMENTO LEGAL</p>
        <h1>{title}</h1>
        <span>Vigente desde el {EFFECTIVE_DATE}</span>
        <p className="legal-description">{description}</p>
      </section>
      <article className="legal-document">{children}</article>
      <footer className="legal-footer">© {new Date().getFullYear()} Piddop · <a href="/politica-privacidad">Política de tratamiento de datos</a></footer>
    </main>
  );
}

// Keep unpublished legal-identification placeholders out of the public site.
// Set to true only after the real company information is available.
const SHOW_RESPONSIBLE_INFORMATION = false;

function ResponsibleInformation() {
  if (!SHOW_RESPONSIBLE_INFORMATION) return null;
  return <section className="legal-notice" aria-label="Información pendiente del responsable">
    <strong>Antes de publicar:</strong> completa la razón social, NIT, domicilio y correo de protección de datos del Responsable. Estos datos no existen en el proyecto y no deben ser sustituidos por información inventada.
    <dl>
      <div><dt>Responsable</dt><dd>[RAZÓN SOCIAL QUE OPERA PIDDOP]</dd></div>
      <div><dt>NIT</dt><dd>[NIT, INCLUIDO DÍGITO DE VERIFICACIÓN]</dd></div>
      <div><dt>Domicilio</dt><dd>[DIRECCIÓN, CIUDAD Y PAÍS]</dd></div>
      <div><dt>Canal de datos</dt><dd>[CORREO ELECTRÓNICO Y/O DIRECCIÓN PARA PQRS]</dd></div>
    </dl>
  </section>;
}

export function LegalPages({ page }: { page: LegalPage }) {
  if (page === 'terms') return <TermsPage />;
  if (page === 'privacy') return <PrivacyPage />;
  if (page === 'account-deletion') return <AccountDeletionPage />;
  return <DataAuthorizationPage />;
}

function TermsPage() {
  return <LegalLayout title="Términos y condiciones de uso" description="Reglas que aplican al uso de la aplicación, la plataforma web y los servicios digitales de Piddop.">
    <ResponsibleInformation />
    <h2>1. Aceptación y alcance</h2>
    <p>Estos Términos y Condiciones regulan el acceso y uso de Piddop, incluidos sus sitios web, aplicaciones móviles, comunicaciones y funcionalidades asociadas (la <strong>“Plataforma”</strong>). Al crear una cuenta, navegar o usar la Plataforma, la persona usuaria declara que ha leído, comprendido y acepta estos Términos y la Política de Tratamiento de Datos Personales.</p>
    <p>Si no está de acuerdo con estos Términos, no debe usar la Plataforma. La aceptación no elimina ni limita los derechos irrenunciables que la ley reconoce a los consumidores y titulares de datos personales.</p>
    <h2>2. Naturaleza del servicio</h2>
    <p>Piddop facilita la interacción digital entre personas usuarias y comercios o prestadores independientes que ofrecen productos, servicios, reservas y, cuando aplique, entrega a domicilio. Salvo que se informe expresamente lo contrario en una oferta concreta, el comercio o prestador identificado en la orden es quien ofrece y responde por sus productos o servicios; Piddop actúa como plataforma tecnológica y canal de gestión de la transacción.</p>
    <p>La información del comercio, disponibilidad, precios, promociones, tiempos estimados, condiciones de entrega y políticas particulares debe revisarse antes de confirmar cada solicitud. Las condiciones particulares de una oferta complementan estos Términos; si existe contradicción, prevalece la norma imperativa aplicable y luego la condición particular informada para esa transacción.</p>
    <h2>3. Cuenta y seguridad</h2>
    <p>Para utilizar ciertas funciones se requiere una cuenta con información verdadera, completa y actualizada. La persona usuaria debe proteger sus credenciales, no compartir códigos de verificación y avisar de inmediato ante uso no autorizado. La cuenta es personal y no puede cederse sin autorización previa de Piddop.</p>
    <p>Piddop puede solicitar verificaciones razonables para prevenir fraude, proteger la seguridad o cumplir obligaciones legales. Podrá restringir o suspender una cuenta cuando exista uso fraudulento, suplantación, incumplimiento de estos Términos, afectación a terceros o exigencia legal, informando las razones cuando sea procedente.</p>
    <h2>4. Pedidos, reservas, precios y pagos</h2>
    <p>Una solicitud se entiende recibida cuando la Plataforma muestra su confirmación. La aceptación, preparación y ejecución están sujetas a disponibilidad, validación del pago, cobertura y confirmación del comercio o prestador. Los precios, cargos de entrega, descuentos, impuestos y el valor total aplicable se mostrarán antes de la confirmación.</p>
    <p>Cuando se use un medio de pago de un tercero, la operación puede estar sujeta a sus términos y procesos de validación. La persona usuaria debe proporcionar información correcta y contar con autorización para utilizar el medio de pago. Piddop no almacena datos completos de instrumentos de pago cuando el procesamiento lo realiza un proveedor especializado.</p>
    <h2>5. Cancelaciones, reembolsos y PQR</h2>
    <p>Las solicitudes de cancelación, reversión, retracto, garantía, reembolso, cambio o reclamación se tramitarán conforme a la naturaleza del producto o servicio, la etapa de la orden, las condiciones informadas y la legislación colombiana aplicable. Los derechos legales del consumidor no se excluyen por estos Términos.</p>
    <p>Para presentar una petición, queja o reclamo (PQR), la persona usuaria debe usar el canal de atención publicado en la Plataforma e indicar, como mínimo, nombre, datos de contacto, número de orden, descripción y soportes disponibles. Piddop y/o el comercio responsable atenderán el caso dentro de los términos legales aplicables.</p>
    <h2>6. Conductas no permitidas</h2>
    <p>Está prohibido usar la Plataforma para fines ilícitos, fraudulentos, abusivos o que afecten derechos de terceros; interferir con su seguridad; extraer datos de forma automatizada sin autorización; introducir software malicioso; suplantar identidades; publicar contenido engañoso; o realizar pedidos ficticios. El incumplimiento puede dar lugar a suspensión, cancelación de la cuenta y acciones legales que correspondan.</p>
    <h2>7. Propiedad intelectual</h2>
    <p>Las marcas, diseños, software, textos, interfaces, imágenes y demás contenidos de la Plataforma pertenecen a Piddop, a sus licenciantes o a los respectivos titulares. Se concede una licencia limitada, revocable, no exclusiva e intransferible para usar la Plataforma conforme a estos Términos. No se autoriza copiar, modificar, distribuir, descompilar o explotar contenidos sin permiso escrito.</p>
    <h2>8. Disponibilidad y responsabilidad</h2>
    <p>Piddop implementa medidas razonables para la continuidad, seguridad y buen funcionamiento de la Plataforma, pero no garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores. Las interrupciones por mantenimiento, conectividad, terceros, fuerza mayor o eventos fuera de control razonable no generan responsabilidad salvo que la ley disponga otra cosa.</p>
    <p>Ninguna disposición limita responsabilidad por dolo, culpa grave, incumplimiento de obligaciones legales imperativas, afectación de derechos irrenunciables o supuestos cuya exclusión no sea permitida por la ley.</p>
    <h2>9. Datos personales</h2>
    <p>El tratamiento de datos personales se rige por la Política de Tratamiento de Datos Personales y por la autorización específica que, cuando sea necesaria, otorga el titular. La persona usuaria puede conocer, actualizar, rectificar, suprimir datos o revocar la autorización según las reglas y canales allí descritos.</p>
    <h2>10. Modificaciones y ley aplicable</h2>
    <p>Piddop podrá actualizar estos Términos por cambios normativos, operativos, tecnológicos o de servicio. Las modificaciones materiales serán informadas por medios razonables antes de su vigencia cuando corresponda. Estos Términos se interpretan de acuerdo con las leyes de la República de Colombia, sin perjuicio de normas de protección al consumidor y otras disposiciones obligatorias aplicables.</p>
    <h2>11. Contacto</h2>
    <p>Para asuntos relacionados con estos Términos, use el canal de soporte publicado en la Plataforma. Para asuntos de datos personales, use exclusivamente el canal identificado en la Política de Tratamiento de Datos Personales.</p>
  </LegalLayout>;
}

function PrivacyPage() {
  return <LegalLayout title="Política de tratamiento de datos personales" description="Información sobre las finalidades, derechos y reglas aplicables al tratamiento de datos personales en Piddop.">
    <ResponsibleInformation />
    <h2>1. Marco y objeto</h2>
    <p>Esta Política establece las reglas para la recolección, almacenamiento, uso, circulación, actualización, rectificación, supresión y demás operaciones sobre datos personales realizadas a través de Piddop. Se interpreta conforme a la Constitución Política de Colombia, la Ley 1581 de 2012, el Decreto 1074 de 2015 y las demás normas que las modifiquen, sustituyan o reglamenten.</p>
    <h2>2. Datos que podemos tratar</h2>
    <p>Según la interacción con la Plataforma, podemos tratar datos de identificación y contacto, datos de cuenta y autenticación, direcciones y coordenadas necesarias para entregas, información de pedidos, reservas, pagos y facturación, comunicaciones con soporte, preferencias, registros técnicos de uso, dispositivo e incidencias. La Plataforma no solicita datos sensibles como requisito ordinario del servicio. Si excepcionalmente fuera necesario tratar datos sensibles, se solicitará autorización explícita y se informará su carácter facultativo, salvo excepción legal.</p>
    <h2>3. Finalidades</h2>
    <p>Tratamos datos para crear y administrar cuentas; verificar identidad y seguridad; procesar pedidos, reservas, pagos, entregas, devoluciones y PQR; comunicar novedades transaccionales; prevenir fraude; cumplir obligaciones legales, contables y tributarias; mejorar la experiencia, estabilidad y seguridad de la Plataforma; y atender consultas, reclamos y solicitudes de titulares.</p>
    <p>Las comunicaciones comerciales, ofertas, campañas y perfiles de preferencia se realizarán únicamente cuando exista una base legal o autorización aplicable. La persona titular puede solicitar en cualquier momento no recibir comunicaciones comerciales, sin afectar las comunicaciones necesarias para la cuenta o una transacción vigente.</p>
    <h2>4. Derechos del titular</h2>
    <p>El titular puede conocer, actualizar y rectificar sus datos; solicitar prueba de la autorización cuando corresponda; ser informado sobre el uso dado a sus datos; presentar quejas ante la Superintendencia de Industria y Comercio cuando proceda; revocar la autorización y/o solicitar supresión cuando no exista deber legal o contractual de conservar la información; y acceder gratuitamente a sus datos personales objeto de tratamiento.</p>
    <h2>5. Autorización y prueba</h2>
    <p>Cuando la autorización sea requerida, Piddop la solicitará de forma previa, expresa e informada. La autorización podrá obtenerse mediante medios físicos, electrónicos o conductas inequívocas permitidas por la ley, y se conservará evidencia de la fecha, medio, identidad del titular, texto o versión aceptada y finalidad informada. Las casillas premarcadas, el silencio o la inacción no constituyen autorización.</p>
    <h2>6. Encargados, comercios y terceros</h2>
    <p>Podemos compartir los datos estrictamente necesarios con comercios, prestadores, repartidores, procesadores de pago, proveedores de infraestructura, mensajería, analítica, soporte y autoridades competentes, según la finalidad y con medidas contractuales, técnicas y organizativas apropiadas. Quienes actúen como encargados solo podrán tratar los datos siguiendo instrucciones documentadas y para las finalidades autorizadas.</p>
    <h2>7. Seguridad, conservación y transferencias</h2>
    <p>Piddop adopta medidas administrativas, técnicas y humanas razonables para proteger la información contra acceso, alteración, pérdida, consulta, uso o divulgación no autorizados. Ningún sistema es absolutamente invulnerable; ante incidentes que impliquen riesgo relevante se actuarán los protocolos y deberes de reporte o comunicación exigibles.</p>
    <p>Los datos se conservan mientras sean necesarios para las finalidades informadas, la relación con el titular, la atención de reclamaciones o el cumplimiento de deberes legales y contractuales. Vencido ese plazo, se suprimirán, anonimizarán o bloquearán de forma segura. Si un proveedor se encuentra fuera de Colombia, la transferencia o transmisión se realizará con las garantías exigidas por la normativa aplicable.</p>
    <h2>8. Consultas, reclamos y revocatoria</h2>
    <p>Las solicitudes deben enviarse al canal de datos del Responsable, indicando nombre completo, identificación, datos de contacto, descripción clara de la petición y documentos de soporte si aplican. Las consultas se atenderán dentro de los diez (10) días hábiles siguientes a su recepción; los reclamos, dentro de los quince (15) días hábiles, sin perjuicio de las prórrogas y demás reglas establecidas por la ley. Si la solicitud está incompleta, se pedirá subsanación conforme a la normativa aplicable.</p>
    <h2>9. Vigencia</h2>
    <p>Esta Política rige desde la fecha indicada en su encabezado y permanecerá vigente mientras Piddop realice tratamiento de datos personales. Cualquier actualización se publicará en esta misma dirección con su fecha de vigencia.</p>
  </LegalLayout>;
}

function AccountDeletionPage() {
  return <LegalLayout title="Eliminar una cuenta de Piddop" description="Cómo solicitar la eliminación de una cuenta de usuario y qué sucede con los datos asociados.">
    <h2>Cómo eliminar tu cuenta</h2>
    <p>Puedes solicitar la eliminación directamente desde la aplicación Piddop. No necesitas contactar a Google Play ni enviar tus credenciales por correo.</p>
    <ol>
      <li>Abre Piddop e inicia sesión con la cuenta que deseas eliminar.</li>
      <li>Ve a <strong>Mi perfil</strong>.</li>
      <li>Selecciona <strong>Eliminar cuenta</strong>.</li>
      <li>Confirma la solicitud en el aviso de seguridad.</li>
    </ol>
    <p>Al confirmar, se desactiva el acceso a la cuenta y se cierran las sesiones activas. Esta acción no se puede deshacer desde la aplicación.</p>

    <h2>Datos que se eliminan o desactivan</h2>
    <p>La solicitud desactiva la cuenta y su acceso a Piddop. Los datos de perfil, autenticación y preferencias asociados dejan de estar disponibles para el uso normal de la Plataforma y se eliminan o anonimizan cuando ya no son necesarios para las finalidades informadas.</p>

    <h2>Datos que podemos conservar</h2>
    <p>Podemos conservar de forma restringida los registros de pedidos, pagos, facturación, devoluciones, comunicaciones de soporte, prevención de fraude y evidencias de aceptación, únicamente cuando sea necesario para cumplir obligaciones legales, tributarias, contables, contractuales, resolver reclamaciones o proteger la seguridad de la Plataforma.</p>
    <p>Estos registros no se usan para reactivar la cuenta ni para enviar comunicaciones comerciales. Se conservan solo durante el período exigido por la obligación aplicable o mientras exista una reclamación, auditoría o proceso pendiente; después se eliminan, anonimizan o bloquean de forma segura.</p>

    <h2>¿Necesitas ayuda?</h2>
    <p>Si no puedes acceder a tu cuenta para completar estos pasos, usa el canal de soporte disponible dentro de la aplicación e indica que necesitas eliminar tu cuenta. Para protegerte, podremos solicitar información razonable para verificar que eres el titular.</p>
    <p>Esta página aplica a las cuentas de cliente de Piddop. La eliminación de una cuenta no elimina automáticamente información que un comercio o proveedor deba conservar como responsable independiente de una transacción.</p>
  </LegalLayout>;
}

function DataAuthorizationPage() {
  return <LegalLayout title="Autorización para el tratamiento de datos personales" description="Texto de autorización que la persona titular conoce y acepta de forma previa, expresa e informada.">
    <ResponsibleInformation />
    <h2>Autorización</h2>
    {SHOW_RESPONSIBLE_INFORMATION && <p>Declaro que, antes de entregar mis datos personales, fui informado(a) de la Política de Tratamiento de Datos Personales de Piddop y de las finalidades allí descritas. En consecuencia, autorizo de manera <strong>previa, expresa, libre, informada e inequívoca</strong> a [RAZÓN SOCIAL QUE OPERA PIDDOP], en calidad de Responsable del Tratamiento, para recolectar, almacenar, usar, actualizar, consultar, circular, transmitir, transferir cuando sea legalmente procedente y suprimir mis datos personales.</p>}
    <h2>Finalidades autorizadas</h2>
    <p>La autorización comprende las finalidades necesarias para crear y administrar mi cuenta; verificar identidad y seguridad; procesar pedidos, reservas, pagos, entregas, devoluciones y soporte; comunicar información transaccional; atender PQR; prevenir fraude; cumplir obligaciones legales y contractuales; y administrar la relación con usuarios, comercios y prestadores a través de la Plataforma.</p>
    <p>Entiendo que las comunicaciones promocionales, ofertas y campañas deben contar con la autorización o base legal que corresponda y que puedo solicitar su suspensión en cualquier momento por los canales publicados, sin afectar comunicaciones estrictamente necesarias para mi cuenta o transacciones en curso.</p>
    <h2>Mis derechos y canales</h2>
    <p>Conozco que puedo acceder, conocer, actualizar, rectificar y solicitar supresión de mis datos; solicitar prueba de esta autorización; ser informado sobre el uso de mi información; revocar la autorización cuando proceda; y presentar quejas ante la Superintendencia de Industria y Comercio. Puedo ejercer estos derechos a través de [CORREO O CANAL DE PROTECCIÓN DE DATOS].</p>
    <h2>Manifestaciones</h2>
    <p>Declaro que los datos suministrados son veraces y que cuento con autorización cuando proporciono datos de terceros. Entiendo que puedo actualizar mi información y que la revocatoria o supresión no aplicará cuando exista un deber legal o contractual de conservar los datos, ni afectará tratamientos realizados válidamente antes de la solicitud.</p>
    <p>La aceptación electrónica de esta autorización debe registrarse junto con la identidad o cuenta del titular, fecha y hora, versión del documento, medio utilizado y evidencia técnica razonable. No debe usarse una casilla premarcada ni inferirse autorización por silencio o inactividad.</p>
    <h2>Versión y vigencia</h2>
    <p>Versión 1.0. Vigente desde el {EFFECTIVE_DATE}. Esta autorización se integra con la Política de Tratamiento de Datos Personales publicada por Piddop.</p>
  </LegalLayout>;
}
