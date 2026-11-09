import { createFileRoute, Link } from "@tanstack/react-router";

type Section = { title: string; paragraphs?: string[]; items?: string[] };
type Document = { eyebrow: string; title: string; summary: string; sections: Section[] };

const documents: Record<string, Document> = {
  privacidad: {
    eyebrow: "Protección de datos",
    title: "Política de privacidad",
    summary: "Cómo tratamos los datos necesarios para que puedas crear tu cuenta, pedir, comprar, reservar y recibir soporte en Piddop.",
    sections: [
      { title: "1. Datos que tratamos", items: [
        "Datos de cuenta: nombre, apellidos, correo electrónico, teléfono, contraseña protegida e imagen de perfil cuando la agregues.",
        "Datos de autenticación: identificadores necesarios para iniciar sesión con correo, Google o Apple, cuando elijas esos métodos.",
        "Datos de operación: direcciones, referencias, ubicación cuando otorgues el permiso, pedidos, reservas, preferencias y comunicaciones relacionadas.",
        "Datos de soporte y seguridad: mensajes al soporte, teléfono de contacto, registros técnicos, dirección IP, actividad de seguridad y token de notificaciones si lo autorizas.",
      ] },
      { title: "2. Finalidades del tratamiento", items: [
        "Crear, autenticar y proteger tu cuenta; recuperar acceso y prevenir fraudes o usos indebidos.",
        "Gestionar pedidos, compras, reservas, pagos, entregas, devoluciones, soporte y comunicaciones indispensables del servicio.",
        "Mostrar comercios y opciones de entrega cercanas cuando actives la ubicación. Puedes negar o revocar ese permiso desde tu dispositivo.",
        "Enviar actualizaciones de pedidos y reservas mediante notificaciones push cuando las autorices.",
        "Cumplir obligaciones legales y mejorar la seguridad y funcionamiento de la plataforma.",
      ] },
      { title: "3. Compartición de información", paragraphs: [
        "Compartimos solo la información necesaria con el comercio, prestador o repartidor que deba preparar, entregar o prestar lo que solicites. Los proveedores de infraestructura, autenticación, notificaciones y pagos pueden tratar información únicamente para prestar sus servicios.",
        "Los datos de pago son administrados por el proveedor de pagos que elijas. Piddop no está diseñado para solicitar por soporte contraseñas, códigos de verificación o números completos de tarjetas.",
      ] },
      { title: "4. Tus derechos", paragraphs: [
        "Puedes conocer, actualizar, rectificar o solicitar la supresión de tus datos, revocar una autorización cuando proceda y presentar consultas o reclamos mediante el canal de soporte de Piddop.",
        "La supresión puede estar limitada por información que deba conservarse por una obligación legal, contractual, contable, de seguridad o para resolver una controversia. Cuando sea posible, esos registros se conservarán sin identificarte directamente.",
      ] },
      { title: "5. Conservación y seguridad", paragraphs: [
        "Conservamos los datos durante el tiempo necesario para las finalidades informadas, la relación con la persona usuaria y las obligaciones aplicables. Aplicamos controles técnicos y organizacionales razonables para proteger la información.",
        "Esta política se interpreta conforme a la normativa colombiana de protección de datos personales aplicable y podrá actualizarse por cambios legales, operativos o de seguridad.",
      ] },
    ],
  },
  terminos: {
    eyebrow: "Documento legal",
    title: "Términos y condiciones",
    summary: "Las reglas para usar Piddop y realizar pedidos, compras o reservas desde la plataforma.",
    sections: [
      { title: "1. Alcance de Piddop", paragraphs: [
        "Piddop es una plataforma tecnológica para descubrir comercios, productos y servicios, gestionar pedidos y reservas, y recibir información de su estado. Cada comercio o prestador responde por la oferta, disponibilidad, preparación, entrega y calidad de lo que publica.",
        "Al crear una cuenta, navegar o usar las funciones de Piddop, aceptas estos términos y la Política de privacidad vigente.",
      ] },
      { title: "2. Cuenta y uso responsable", items: [
        "Debes suministrar información veraz, actualizada y completa, y mantener la confidencialidad de tus credenciales.",
        "No está permitido usar la plataforma con fines ilícitos, interferir con su funcionamiento, suplantar a terceros ni suministrar información falsa o fraudulenta.",
        "Eres responsable de las acciones realizadas desde tu cuenta. Si sospechas un acceso no autorizado, cambia tu contraseña y contacta a soporte.",
      ] },
      { title: "3. Pedidos, compras y reservas", paragraphs: [
        "Antes de confirmar una solicitud, revisa productos o servicios, variantes, cantidades, precio, dirección, fecha y demás datos. La disponibilidad puede cambiar hasta que el comercio o prestador confirme la solicitud.",
        "Los tiempos de preparación, entrega y prestación son estimados. Las condiciones particulares y restricciones informadas por cada comercio o prestador forman parte de la solicitud.",
      ] },
      { title: "4. Pagos", paragraphs: [
        "Piddop puede habilitar pago contraentrega y PSE. Cuando elijas un medio administrado por un tercero, también aplican las condiciones de ese proveedor. Nunca compartas claves o códigos de verificación por canales no oficiales.",
      ] },
      { title: "5. Cambios y disponibilidad", paragraphs: [
        "La información comercial es administrada por comercios y prestadores. Piddop puede corregir errores evidentes, actualizar funcionalidades, limitar funciones para proteger la seguridad o suspender cuentas ante incumplimientos.",
        "Podremos actualizar estos términos cuando cambien la plataforma, sus funciones o la normativa aplicable. La versión vigente estará disponible en esta página.",
      ] },
    ],
  },
  datos: {
    eyebrow: "Consentimiento informado",
    title: "Autorización para el tratamiento de datos",
    summary: "La autorización que das al crear una cuenta y utilizar los servicios de Piddop.",
    sections: [
      { title: "Al aceptar", paragraphs: ["Autorizas de manera previa, expresa e informada el tratamiento de los datos que entregas al registrarte o al usar Piddop, de acuerdo con la Política de privacidad y para las finalidades necesarias para operar la plataforma."], items: [
        "Crear y administrar tu cuenta, verificar tu identidad y atender solicitudes de acceso o recuperación.",
        "Gestionar pedidos, compras, pagos, reservas, entregas, comprobantes, devoluciones y comunicaciones operativas.",
        "Compartir los datos estrictamente necesarios con comercios, prestadores, repartidores y proveedores tecnológicos que intervienen en tu solicitud.",
        "Atender soporte, proteger la plataforma, prevenir fraude y cumplir deberes legales aplicables.",
      ] },
      { title: "Permisos del dispositivo", paragraphs: ["La ubicación y las notificaciones requieren permisos que administras desde tu dispositivo. Negarlos no afecta los datos básicos de tu cuenta, aunque puede limitar funciones como sugerir direcciones cercanas o recibir actualizaciones en tiempo real."] },
      { title: "Tus derechos", paragraphs: ["Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización cuando sea procedente. Para ejercerlos, usa el canal de soporte y describe tu solicitud. Podremos pedir la información mínima necesaria para verificar tu identidad."] },
    ],
  },
  "eliminar-cuenta": {
    eyebrow: "Control de tu cuenta",
    title: "Eliminar cuenta y datos",
    summary: "Cómo solicitar la eliminación de tu cuenta y qué ocurre con la información asociada.",
    sections: [
      { title: "Cómo solicitarla", paragraphs: ["Inicia sesión en la aplicación y abre Ajustes > Soporte. Indica que deseas eliminar tu cuenta. También puedes incluir solicitudes de acceso, corrección o supresión de datos personales.", "Para proteger tu cuenta, podremos confirmar tu identidad antes de procesar la solicitud."] },
      { title: "Qué eliminamos", paragraphs: ["Al aprobar una solicitud, Piddop desactiva la cuenta y elimina o anonimiza los datos personales y registros no financieros que ya no sean necesarios, como credenciales de acceso, tokens de sesión y notificaciones, datos de perfil, direcciones guardadas, solicitudes de soporte y actividad no requerida para obligaciones posteriores."] },
      { title: "Pedidos, pagos y reservas pendientes", paragraphs: ["No es posible finalizar la eliminación mientras existan pedidos o reservas activos, porque necesitamos la información mínima para cumplirlos o gestionarlos. Cuando se hayan cerrado, podrás continuar con la solicitud.", "Podemos conservar de forma restringida y, cuando sea posible, anonimizada, comprobantes y registros que deban mantenerse por obligaciones legales, contables, fiscales, de seguridad o para resolver reclamaciones. Esos datos no se usarán para reactivar tu cuenta."] },
    ],
  },
  soporte: {
    eyebrow: "Estamos para ayudarte",
    title: "Soporte Piddop",
    summary: "Envía una solicitud privada al equipo de soporte desde la aplicación.",
    sections: [
      { title: "Canal de atención", paragraphs: ["Para recibir ayuda, inicia sesión en Piddop y ve a Ajustes > Soporte. Allí puedes enviar el asunto de tu solicitud, un número de pedido si aplica, un teléfono de contacto y los detalles necesarios para atenderte.", "Usa este canal para pedir ayuda con tu cuenta, pedidos, pagos, reservas, privacidad o eliminación de cuenta."] },
      { title: "Para cuidarte", items: ["No compartas contraseñas, códigos de verificación ni información bancaria completa por mensajes o llamadas no verificadas.", "Incluye el número de pedido o reserva cuando lo tengas; esto ayuda a encontrar tu solicitud sin compartir información innecesaria.", "Conserva las comunicaciones dentro de los canales oficiales de Piddop y reporta cualquier intento de suplantación."] },
    ],
  },
};

const navigation = [
  { page: "privacidad", label: "Privacidad" }, { page: "terminos", label: "Términos" },
  { page: "datos", label: "Datos" }, { page: "eliminar-cuenta", label: "Eliminar cuenta" },
  { page: "soporte", label: "Soporte" },
] as const;

export const Route = createFileRoute("/legal/$page")({ component: LegalPage });

function LegalPage() {
  const { page } = Route.useParams();
  const document = documents[page];
  if (!document) return <UnavailablePage />;

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-slate-950">pidd<span className="text-primary">o</span>p<span className="text-accent">.</span></Link>
        <Link to="/" className="text-sm font-semibold text-slate-600 transition hover:text-primary">Volver al inicio</Link>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Legal Piddop</p>
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" aria-label="Documentos legales">
            {navigation.map((item) => <Link key={item.page} to="/legal/$page" params={{ page: item.page }} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${item.page === page ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}>{item.label}</Link>)}
          </nav>
        </aside>
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,0.32)]">
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-primary px-6 py-10 text-white sm:px-10 sm:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">{document.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">{document.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{document.summary}</p>
            <p className="mt-7 text-sm text-slate-300">Última actualización: 9 de noviembre de 2026</p>
          </div>
          <div className="space-y-10 px-6 py-10 sm:px-10 sm:py-12">
            {document.sections.map((section) => <section key={section.title}>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 max-w-3xl text-[0.975rem] leading-7 text-slate-600">{paragraph}</p>)}
              {section.items ? <ul className="mt-5 space-y-3">{section.items.map((item) => <li key={item} className="flex gap-3 text-[0.975rem] leading-7 text-slate-600"><span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" /><span>{item}</span></li>)}</ul> : null}
            </section>)}
          </div>
        </article>
      </div>
    </div>
  </main>;
}

function UnavailablePage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] p-6">
    <article className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold text-primary">Piddop</p><h1 className="mt-3 text-2xl font-bold text-slate-950">Documento no disponible</h1>
      <p className="mt-3 leading-7 text-slate-600">La página que buscas no existe o fue trasladada.</p>
      <Link to="/legal/$page" params={{ page: "privacidad" }} className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary">Ver política de privacidad</Link>
    </article>
  </main>;
}
