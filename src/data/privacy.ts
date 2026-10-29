import { siteConfig } from './site'

export type PrivacySection = {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
  paragraphsAfter?: string[]
}

export const privacyPolicyVersion = '2026-10-28'
export const privacyPolicyUpdated = '28 de octubre de 2026'

export const privacyPolicyIntro =
  `${siteConfig.brand}, estudio de mirada y belleza con domicilio en Bogotá D.C., Colombia, es respetuoso de los datos personales de las personas que visitan este sitio web, solicitan una cita, se comunican por WhatsApp o Instagram o utilizan los canales de atención del estudio. En esta Política de Privacidad y Tratamiento de Datos Personales se establecen las finalidades, el alcance, las medidas y los procedimientos del tratamiento de los datos, así como los mecanismos con que los titulares cuentan para conocer, actualizar, rectificar o suprimir la información suministrada o revocar la autorización otorgada.`

export const privacyPolicySections: PrivacySection[] = [
  {
    id: 'responsable',
    title: '1. Responsable del tratamiento',
    paragraphs: [
      `El responsable del tratamiento es ${siteConfig.brand} — Tathiana, estudio de mirada y belleza especializado en pestañas, cejas, lifting, depilación y cuidado facial, con domicilio en Bogotá D.C., Colombia. La razón social y el NIT se incorporarán a esta política cuando estén disponibles.`,
      `Canal de privacidad: ${siteConfig.privacyEmail}. WhatsApp: ${siteConfig.privacyPhone}. Sitio web: este sitio y sus páginas de reserva.`,
      `${siteConfig.brand} actúa como responsable del tratamiento de los datos personales registrados en sus bases de datos, en los términos del artículo 3 de la Ley 1581 de 2012.`,
    ],
  },
  {
    id: 'marco-legal',
    title: '2. Marco legal',
    paragraphs: [
      'Esta política se rige por la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013, el Decreto 886 de 2014, el Decreto Único Reglamentario 1074 de 2015, la Ley 1266 de 2008 y demás normas colombianas aplicables sobre protección de datos personales y habeas data.',
    ],
  },
  {
    id: 'definiciones',
    title: '3. Definiciones',
    items: [
      'Autorización: consentimiento previo, expreso e informado del titular para que el estudio trate sus datos personales.',
      'Base de datos: conjunto organizado de datos personales que son objeto de tratamiento.',
      'Dato personal: información vinculada o que pueda asociarse a una persona determinada o determinable, como el nombre, el teléfono o el correo electrónico.',
      'Dato sensible: dato que afecta la intimidad del titular o cuyo uso indebido puede generar discriminación, como los datos de salud, biométricos, religiosos, políticos o de orientación sexual.',
      'Encargado del tratamiento: persona natural o jurídica que trata datos personales por cuenta del responsable.',
      'Responsable del tratamiento: persona natural o jurídica que decide sobre la finalidad de las bases de datos y el tratamiento.',
      'Titular: persona natural cuyos datos personales son objeto de tratamiento.',
      'Tratamiento: cualquier operación sobre datos personales, como recolección, almacenamiento, uso, circulación, actualización o supresión.',
    ],
  },
  {
    id: 'principios',
    title: '4. Principios del tratamiento',
    items: [
      'Legalidad: el tratamiento se sujeta a la ley y a las demás disposiciones aplicables.',
      'Finalidad: el tratamiento obedece a una finalidad legítima e informada al titular.',
      'Libertad: el tratamiento se ejerce con la autorización previa, expresa e informada del titular, salvo las excepciones legales.',
      'Veracidad o calidad: la información debe ser veraz, completa, exacta, actualizada y comprensible.',
      'Transparencia: el titular puede conocer la existencia de datos que le conciernan.',
      'Acceso y circulación restringida: los datos solo se tratan para las finalidades autorizadas.',
      'Seguridad: se adoptan medidas técnicas, humanas y administrativas para proteger la información.',
      'Confidencialidad: las personas que intervienen en el tratamiento están obligadas a guardar reserva.',
    ],
  },
  {
    id: 'alcance',
    title: '5. Alcance',
    paragraphs: [
      'Esta política aplica al sitio web de Perfect Woman T, al formulario de reservas, a los canales de contacto del estudio y al panel privado de gestión de citas. No aplica a sitios, redes sociales o servicios de terceros que tengan sus propias políticas, como WhatsApp, Instagram o los proveedores de infraestructura tecnológica.',
    ],
  },
  {
    id: 'finalidades',
    title: '6. Finalidades del tratamiento',
    paragraphs: [
      'Los datos personales se tratan para las siguientes finalidades:',
    ],
    items: [
      'Gestionar solicitudes de disponibilidad, reservas, confirmaciones, reprogramaciones, cancelaciones y atención de los servicios del estudio.',
      'Contactar a la titular por WhatsApp, llamada, mensaje de texto o correo electrónico para confirmar o recordar su cita y atender consultas relacionadas.',
      'Llevar el historial de servicios, preferencias y observaciones necesarias para prestar una atención adecuada.',
      'Cumplir obligaciones legales, contables, administrativas y de seguridad de la información.',
      'Atender peticiones, consultas, reclamos y solicitudes de ejercicio de derechos.',
      'Prevenir fraudes, accesos no autorizados, reservas duplicadas y abusos de los canales de reserva.',
      'Realizar análisis estadísticos y comerciales con información agregada para mejorar la atención y los servicios.',
      'Enviar comunicaciones comerciales o promociones únicamente cuando exista autorización previa del titular.',
    ],
    paragraphsAfter: [
      'Perfect Woman T no vende ni comercializa los datos personales de los titulares a terceros.',
    ],
  },
  {
    id: 'datos',
    title: '7. Datos personales que recopilamos',
    items: [
      'Datos de identificación y contacto: nombre y apellidos, número de teléfono y correo electrónico opcional.',
      'Datos de la reserva: servicio solicitado, profesional, fecha y hora, estado de la cita, código de confirmación y notas que la titular decida incluir.',
      'Datos de consentimiento: versión de la política aceptada, fecha, canal y hash de la dirección IP cuando se realiza una reserva en línea.',
      'Datos técnicos de seguridad: hashes de IP y registros de control de intentos de reserva para prevenir abusos.',
    ],
    paragraphsAfter: [
      'No solicitamos número de identificación, dirección de residencia, fecha de nacimiento, datos financieros, datos biométricos ni datos de salud. Si la titular decide incluir información de salud, alergias, embarazo, medicamentos o cualquier dato sensible en las notas de la reserva, lo hará de forma voluntaria y el estudio lo tratará únicamente para prestar el servicio y con su consentimiento.',
      'Los datos de menores de edad solo se tratan cuando sea necesario para su bienestar y con la autorización previa de sus representantes legales. Si no se cuenta con esa autorización, el estudio procederá a su supresión.',
    ],
  },
  {
    id: 'autorizacion',
    title: '8. Autorización',
    paragraphs: [
      'Al marcar la casilla de consentimiento y enviar el formulario de reserva, la titular autoriza de forma previa, expresa e informada el tratamiento de sus datos para las finalidades descritas en esta política. La autorización es voluntaria; sin embargo, si no se otorga, no será posible gestionar la reserva en línea.',
      'La titular puede revocar la autorización o solicitar la supresión de sus datos cuando no exista un deber legal o contractual de conservarlos, mediante los canales indicados en esta política.',
    ],
  },
  {
    id: 'usos',
    title: '9. Usos autorizados de la información',
    items: [
      'Establecer comunicación con la titular para cualquier propósito relacionado con las finalidades descritas, mediante llamadas, mensajes, correos electrónicos u otros medios.',
      'Prestar, mantener y mejorar los servicios, cumplir la propuesta de valor y las obligaciones adquiridas.',
      'Auditar, estudiar y analizar la información de las bases de datos para diseñar estrategias administrativas, técnicas y comerciales.',
      'Realizar actividades de mercadeo o promoción solo con autorización previa de la titular.',
      'Enviar notificaciones y alertas relacionadas con los servicios, cambios en los términos y asuntos de seguridad.',
      'Compartir la información con encargados del tratamiento para cumplir las finalidades descritas.',
      'Revelar la información cuando sea requerido por leyes, regulaciones, procesos judiciales o autoridades competentes, o para prevenir fraudes y proteger derechos.',
    ],
  },
  {
    id: 'terceros',
    title: '10. Tratamiento por terceros y transferencias',
    paragraphs: [
      'Perfect Woman T puede transmitir datos personales a encargados del tratamiento que prestan servicios de infraestructura, base de datos, autenticación, hosting, mensajería o soporte, siempre bajo sus instrucciones y con medidas de seguridad y confidencialidad. En particular:',
    ],
    items: [
      'Supabase: base de datos, autenticación y funciones del sistema de reservas. La base de datos se aloja en la región us-east-1, Estados Unidos.',
      'Vercel: hosting y entrega del sitio web.',
      'WhatsApp e Instagram: canales de contacto y mensajería. Cuando la titular se comunica por estos canales, también aplican las políticas de dichas plataformas.',
      'Google Fonts, Material Symbols y el CDN de imágenes de Google: recursos tipográficos, iconos e imágenes que pueden recibir la dirección IP del visitante al cargar el sitio.',
      'Autoridades competentes: cuando la ley o una orden judicial lo exija.',
    ],
    paragraphsAfter: [
      'Estos proveedores pueden actuar como encargados o como terceros independientes según el caso. Cuando exista transferencia internacional de datos a países que no ofrezcan un nivel adecuado de protección, Perfect Woman T adoptará las garantías previstas en la normativa colombiana, incluyendo las disposiciones del Decreto 1074 de 2015 y el Decreto 886 de 2014.',
    ],
  },
  {
    id: 'cookies',
    title: '11. Cookies y tecnologías de almacenamiento',
    paragraphs: [
      'En esta versión del sitio no se utilizan cookies de publicidad ni herramientas de analítica de terceros. Se utiliza almacenamiento técnico del navegador para mantener la sesión del panel administrativo y para evitar reservas duplicadas durante un reintento.',
      'Algunos recursos del sitio, como fuentes, iconos e imágenes, se cargan desde servicios de Google y pueden registrar la dirección IP del visitante. Cuando se incorporen herramientas de analítica, SEO o marketing, esta política se actualizará y se solicitará el consentimiento que corresponda.',
    ],
  },
  {
    id: 'derechos',
    title: '12. Derechos de los titulares',
    paragraphs: [
      'Conforme al artículo 8 de la Ley 1581 de 2012, la titular tiene los siguientes derechos:',
    ],
    items: [
      'Conocer, actualizar y rectificar sus datos personales frente a Perfect Woman T.',
      'Solicitar prueba de la autorización otorgada.',
      'Ser informada, previa solicitud, respecto del uso que se le ha dado a sus datos.',
      'Presentar ante la Superintendencia de Industria y Comercio quejas por infracciones a la ley.',
      'Revocar la autorización o solicitar la supresión del dato cuando no exista un deber contractual o legal de conservarlo.',
      'Acceder en forma gratuita a sus datos personales que hayan sido objeto de tratamiento.',
      'Abstenerse de responder preguntas sobre datos sensibles o sobre datos de niños, niñas y adolescentes.',
    ],
  },
  {
    id: 'procedimiento',
    title: '13. Procedimiento para ejercer los derechos',
    paragraphs: [
      `Las peticiones, consultas y reclamos se atienden a través del correo ${siteConfig.privacyEmail} o del WhatsApp ${siteConfig.privacyPhone}. La solicitud debe incluir la identificación de la titular, la descripción de los hechos, la dirección o correo de contacto y los documentos que desee hacer valer.`,
      'Consultas: la respuesta se dará en un plazo máximo de diez (10) días hábiles. Si no es posible atenderla en ese término, se informarán los motivos y la fecha de respuesta, que no podrá superar los cinco (5) días hábiles siguientes.',
      'Reclamos: se tramitarán en un plazo máximo de quince (15) días hábiles contados desde el día siguiente a su recibo. Si no es posible atenderlos en ese término, se informarán los motivos y la fecha de respuesta, que no podrá superar los ocho (8) días hábiles siguientes. Si el reclamo está incompleto, se solicitará su subsanación dentro de los cinco (5) días siguientes; transcurridos dos (2) meses sin respuesta, se entenderá que la titular desistió.',
      'Si Perfect Woman T no es competente para resolver el reclamo, dará traslado a quien corresponda en un término máximo de dos (2) días hábiles e informará la situación a la titular. Una vez recibido el reclamo completo, se incluirá en la base de datos una leyenda de «reclamo en trámite» hasta que sea decidido.',
    ],
  },
  {
    id: 'seguridad',
    title: '14. Medidas de seguridad',
    paragraphs: [
      'Perfect Woman T implementa medidas humanas, administrativas y técnicas razonables para proteger los datos contra adulteración, pérdida, consulta, uso o acceso no autorizado. Estas medidas incluyen transmisión cifrada mediante HTTPS, autenticación para el panel administrativo, reglas de seguridad a nivel de fila en la base de datos, acceso restringido, minimización de datos, hash de direcciones IP y cláusulas de confidencialidad con los encargados.',
      'El frontend público no utiliza claves de servicio administrativas ni almacena contraseñas de la base de datos. El acceso al panel de gestión está limitado a usuarios autorizados.',
    ],
  },
  {
    id: 'conservacion',
    title: '15. Conservación de la información',
    paragraphs: [
      'Los datos se conservan durante el tiempo necesario para cumplir las finalidades descritas, gestionar el historial de citas y atender obligaciones legales, contables o de seguridad. Cuando dejen de ser necesarios y no exista un deber legal o contractual de conservarlos, se suprimirán o anonimizarán de forma segura. Los registros técnicos de seguridad y control de intentos se conservan por tiempo limitado.',
    ],
  },
  {
    id: 'vigencia',
    title: '16. Vigencia y cambios',
    paragraphs: [
      `Esta política entra en vigencia el ${privacyPolicyUpdated} y corresponde a la versión ${privacyPolicyVersion}. Podrá ser modificada para cumplir nuevas disposiciones legales, jurisprudenciales o cambios internos. Los cambios sustanciales se publicarán en esta misma página y, cuando la normativa lo exija, se informarán oportunamente a las titulares.`,
    ],
  },
  {
    id: 'contacto',
    title: '17. Contacto',
    paragraphs: [
      `Perfect Woman T — Bogotá D.C., Colombia. WhatsApp: ${siteConfig.privacyPhone}. Correo: ${siteConfig.privacyEmail}.`,
      'La autoridad de control en materia de protección de datos personales es la Superintendencia de Industria y Comercio (SIC), ante la cual la titular puede presentar sus quejas por el tratamiento indebido de sus datos.',
    ],
  },
]
