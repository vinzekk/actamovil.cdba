const PLANTILLAS = {
  contravencional: {
    nombre: "1. Acta de Inicio Contravencional (Ley 10.326)",
    campos: [
      { id: "LOCALIDAD", label: "Localidad (ciudad)", def: "Río Cuarto" },
      { id: "DEPARTAMENTO", label: "Departamento", def: "Río Cuarto" },
      { id: "DIA", label: "Día" },
      { id: "MES", label: "Mes" },
      { id: "AÑO", label: "Año (dos mil...)" },
      { id: "HORA", label: "Hora (HH)" },
      { id: "MINUTOS", label: "Minutos (MM)" },
      { id: "FUNCIONARIO", label: "Funcionario Policial que suscribe", perfil: true },
      { id: "DEPENDENCIA", label: "Adscripto al personal de", perfil: true },
      { id: "CALLE_HECHO", label: "Constituido en calle" },
      { id: "NRO_HECHO", label: "N° (calle del hecho)" },
      { id: "CIUDAD_HECHO", label: "Ciudad del hecho", def: "Río Cuarto" },
      { id: "TESTIGO_NOMBRE", label: "Testigo hábil Sr/a" },
      { id: "TESTIGO_EDAD", label: "Testigo: edad" },
      { id: "TESTIGO_DNI", label: "Testigo: D.N.I. N°" },
      { id: "TESTIGO_CALLE", label: "Testigo: domicilio, calle" },
      { id: "TESTIGO_NRO", label: "Testigo: N°" },
      { id: "TESTIGO_CIUDAD", label: "Testigo: ciudad", def: "Río Cuarto" },
      { id: "TESTIGO_ESTADO_CIVIL", label: "Testigo: estado civil" },
      { id: "TESTIGO_PROFESION", label: "Testigo: profesión" },
      { id: "RELATO", label: "Declara (acción, naturaleza, circunstancias, características, elementos, instrumentos)", area: true },
      { id: "SECUESTRO", label: "Se procede al secuestro de" },
      { id: "INFRACTOR", label: "Supuesto/s infractor/es, quien/es dijo/eron llamarse" },
      { id: "UNIDAD_JUDICIAL", label: "Unidad Judicial N°" },
      { id: "ARTICULOS", label: "Art/s infringidos (ley 10326)" },
      { id: "FIRMA_SI", label: "El supuesto infractor va a suscribir el acta (SI / NO)", def: "SI" }
    ],
    texto: (d) => `ACTA DE INICIO CONTRAVENCIONAL\n\nEn la ciudad de ${d.LOCALIDAD}, Departamento ${d.DEPARTAMENTO}, Provincia de Córdoba, a los ${d.DIA} días del mes de ${d.MES} del año dos mil ${d.AÑO}, siendo las ${d.HORA}:${d.MINUTOS} horas, el Funcionario Policial que Suscribe ${d.FUNCIONARIO}, adscripto al personal de ${d.DEPENDENCIA}, dependiente de la Unidad Regional Departamental Rio Cuarto, a los efectos legales que correspondan se hace CONSTAR: Que constituido en calle ${d.CALLE_HECHO} N° ${d.NRO_HECHO} de la ciudad de ${d.CIUDAD_HECHO}, y en presencia del testigo hábil para el acto Sr/a ${d.TESTIGO_NOMBRE}, de ${d.TESTIGO_EDAD} años de edad, D.N.I. N° ${d.TESTIGO_DNI} con domicilio en calle ${d.TESTIGO_CALLE} N° ${d.TESTIGO_NRO} de la ciudad de ${d.TESTIGO_CIUDAD}, de estado civil ${d.TESTIGO_ESTADO_CIVIL} de profesión ${d.TESTIGO_PROFESION}. Siguiendo con las previsiones determinadas en la ley 10326 (código de convivencia ciudadana) en los art 130 (Acta Inicial), 132 (Carácter del acta), y con las formalidades de ley estipuladas en los art 227 y 230 del Código Procesal Penal de la Provincia de Córdoba; seguidamente Declara, ${d.RELATO}\n\nQue en el mismo acto se procede al SECUESTRO de: ${d.SECUESTRO}\n\nAtento a lo narrado se identifica a los supuesto/s infractor/es quien/es dijo/eron llamarse: ${d.INFRACTOR}\n\nA continuación se les hace saber los derechos estipulado en el art 133 del código de convivencia, a saber; que se traslada al encartado a la Unidad Contravencional, donde queda a disposición del Ayte Fiscal de Turno a cargo de la Unidad Judicial N° ${d.UNIDAD_JUDICIAL} por supuesto infractor a/los Art/s ${d.ARTICULOS} enmarcado/s en la ley 10326 del Código de Convivencia Ciudadana de la Provincia de Córdoba. Que tiene facultad de requerir copia de la presente acta que se le inicia. Siguiendo con los derechos que le asisten, los cuales están estipulados en los art. 40 y 42 de la Constitución Provincial, se le hace conocer, que tiene derecho de designar un abogado defensor que lo asista y en caso contrario que no pueda costearlo, el Estado le designara un defensor de oficio. Que puede dar aviso de su situación a la persona que lo tenga por conveniente, para ello se le facilitara los medios existentes en la dependencia. Que puede guardar silencio sin que ello presuma culpabilidad en su contra. Terminado el acto se le pregunta al supuesto infractor si va suscribir la presente acta, a lo que DIJO; ${d.FIRMA_SI}. Por lo que se da por finalizado el acto previa lectura y ratificación de todo su contenido, firmando para constancia.\n\n\nFirma testigo          Firma S.I.          Funcionario Actuante`
  },

  secuestro: {
    nombre: "2. Acta de Secuestro",
    campos: [
      { id: "LOCALIDAD", label: "Localidad", def: "Río Cuarto" },
      { id: "DEPARTAMENTO", label: "Departamento", def: "Río Cuarto" },
      { id: "DIA", label: "Día" },
      { id: "MES", label: "Mes" },
      { id: "AÑO", label: "Año (dos mil...)" },
      { id: "HORA", label: "Hora (HH)" },
      { id: "MINUTOS", label: "Minutos (MM)" },
      { id: "FUNCIONARIO", label: "Funcionario policial que suscribe", perfil: true },
      { id: "DEPENDENCIA", label: "Adscrito al personal de", perfil: true },
      { id: "CALLE_HECHO", label: "Constituido en calle" },
      { id: "NRO_HECHO", label: "Nº (calle del hecho)" },
      { id: "BARRIO_HECHO", label: "Barrio (del hecho)" },
      { id: "TESTIGO_NOMBRE", label: "Testigo hábil Sr/Sra." },
      { id: "TESTIGO_EDAD", label: "Testigo: edad" },
      { id: "TESTIGO_CALLE", label: "Testigo: domicilio, calle" },
      { id: "TESTIGO_NRO", label: "Testigo: Nº" },
      { id: "TESTIGO_BARRIO", label: "Testigo: barrio" },
      { id: "TESTIGO_CIUDAD", label: "Testigo: ciudad", def: "Río Cuarto" },
      { id: "TESTIGO_DNI", label: "Testigo: D.N.I. Nº" },
      { id: "SECUESTRO", label: "Acta de secuestro de (elemento/s)" },
      { id: "RELATO", label: "Detalle del secuestro", area: true }
    ],
    texto: (d) => `ACTA DE SECUESTRO\n\nEn la Localidad de ${d.LOCALIDAD}, Departamento ${d.DEPARTAMENTO}, Provincia de Córdoba, a los ${d.DIA} días del mes de ${d.MES} del Año dos mil ${d.AÑO}. Siendo las ${d.HORA}:${d.MINUTOS} horas, el funcionario policial que suscribe ${d.FUNCIONARIO} adscrito al personal de ${d.DEPENDENCIA}, a los efectos legales que corresponda HACE CONSTAR que en fecha y hora indicada y constituido en calle ${d.CALLE_HECHO} Nº ${d.NRO_HECHO} de Barrio ${d.BARRIO_HECHO} y en presencia del testigo hábil para el acto el/la Sr/Sra. ${d.TESTIGO_NOMBRE} de ${d.TESTIGO_EDAD} años de edad domiciliado en calle ${d.TESTIGO_CALLE} Nº ${d.TESTIGO_NRO} de Barrio ${d.TESTIGO_BARRIO} de la ciudad de ${d.TESTIGO_CIUDAD} acreditando su identidad mediante D.N.I. Nº ${d.TESTIGO_DNI} se procede a labrar un ACTA DE SECUESTRO DE: ${d.SECUESTRO}\n\n${d.RELATO}`
  },

  inspeccion: {
    nombre: "3. Acta de Inspección Ocular",
    campos: [
      { id: "LOCALIDAD", label: "Localidad", def: "Río Cuarto" },
      { id: "DEPARTAMENTO", label: "Departamento", def: "Río Cuarto" },
      { id: "DIA", label: "Día" },
      { id: "MES", label: "Mes" },
      { id: "AÑO", label: "Año (dos mil...)" },
      { id: "HORA", label: "Hora (HH)" },
      { id: "MINUTOS", label: "Minutos (MM)" },
      { id: "FUNCIONARIO", label: "Funcionario Policial que suscribe", perfil: true },
      { id: "DEPENDENCIA", label: "Adscripto al personal de", perfil: true },
      { id: "CALLE_HECHO", label: "Constituido en la calle" },
      { id: "NRO_HECHO", label: "Nº (calle del hecho)" },
      { id: "BARRIO_HECHO", label: "Barrio (del hecho)" },
      { id: "TESTIGO_NOMBRE", label: "Testigo hábil el/la Señor/a" },
      { id: "TESTIGO_EDAD", label: "Testigo: edad" },
      { id: "TESTIGO_DNI", label: "Testigo: D.N.I." },
      { id: "TESTIGO_CALLE", label: "Testigo: domicilio, calle" },
      { id: "TESTIGO_NRO", label: "Testigo: Nº" },
      { id: "TESTIGO_BARRIO", label: "Testigo: barrio" },
      { id: "RELATO", label: "Inspección ocular (descripción de lo constatado)", area: true }
    ],
    texto: (d) => `ACTA DE INSPECCIÓN OCULAR\n\nEn la Localidad de ${d.LOCALIDAD}, Departamento ${d.DEPARTAMENTO}, Provincia de Córdoba, a los ${d.DIA} días del mes de ${d.MES} del año Dos Mil ${d.AÑO} siendo las ${d.HORA}:${d.MINUTOS} hs., el funcionario Policial que suscribe ${d.FUNCIONARIO} adscripto al personal de ${d.DEPENDENCIA} a los efectos legales que correspondan, hace CONSTAR: Que constituido en la calle ${d.CALLE_HECHO} Nº ${d.NRO_HECHO} de Barrio ${d.BARRIO_HECHO} y en presencia del testigo hábil para el acto el/la Señor/a ${d.TESTIGO_NOMBRE} de ${d.TESTIGO_EDAD} años de edad D.N.I. ${d.TESTIGO_DNI} con domicilio en calle ${d.TESTIGO_CALLE} Nº ${d.TESTIGO_NRO} del Barrio ${d.TESTIGO_BARRIO}, se procede a realizar la siguiente ACTA DE INSPECCIÓN OCULAR:\n\n${d.RELATO}\n\nQue es todo cuanto hay que hacer constar, con lo que se da por finalizado el acto, previa lectura y ratificación de todo su contenido, firmando para constancia los presentes, por ante mi, Funcionario Policial que suscribe y Certifica.--\n\n\nFirma`
  },

  aprehension: {
    nombre: "4. Acta de Aprehensión",
    campos: [
      { id: "LOCALIDAD", label: "Localidad", def: "Río Cuarto" },
      { id: "DEPARTAMENTO", label: "Departamento", def: "Río Cuarto" },
      { id: "DIA", label: "Día" },
      { id: "MES", label: "Mes" },
      { id: "AÑO", label: "Año (dos mil...)" },
      { id: "HORA", label: "Hora (HH)" },
      { id: "MINUTOS", label: "Minutos (MM)" },
      { id: "FUNCIONARIO", label: "Funcionario policial que suscribe", perfil: true },
      { id: "DEPENDENCIA", label: "Adscripto al personal de", perfil: true },
      { id: "CALLE_HECHO", label: "Constituido en calle" },
      { id: "NRO_HECHO", label: "Nº (calle del hecho)" },
      { id: "BARRIO_HECHO", label: "Barrio (del hecho)" },
      { id: "TESTIGO_NOMBRE", label: "Testigo hábil Sr/Sra" },
      { id: "TESTIGO_CALLE", label: "Testigo: domicilio, calle" },
      { id: "TESTIGO_NRO", label: "Testigo: Nº" },
      { id: "TESTIGO_PISO", label: "Testigo: Piso/Dpto" },
      { id: "TESTIGO_BARRIO", label: "Testigo: barrio" },
      { id: "TESTIGO_CIUDAD", label: "Testigo: ciudad", def: "Río Cuarto" },
      { id: "TESTIGO_DNI", label: "Testigo: D.N.I. Nº" },
      { id: "APREHENDIDO_NOMBRE", label: "Aprehendido/a (ciudadano/a)" },
      { id: "APREHENDIDO_EDAD", label: "Aprehendido/a: edad" },
      { id: "APREHENDIDO_PROFESION", label: "Aprehendido/a: profesión" },
      { id: "APREHENDIDO_CALLE", label: "Aprehendido/a: domicilio, calle" },
      { id: "APREHENDIDO_NRO", label: "Aprehendido/a: Nº" },
      { id: "APREHENDIDO_PISO", label: "Aprehendido/a: Piso/Dpto" },
      { id: "APREHENDIDO_BARRIO", label: "Aprehendido/a: barrio" },
      { id: "APREHENDIDO_DNI", label: "Aprehendido/a: D.N.I. Nº" },
      { id: "DISPOSICION", label: "A disposición de" },
      { id: "CUTIS", label: "Cutis" },
      { id: "ALTURA", label: "Altura (metros)" },
      { id: "CONTEXTURA", label: "Contextura física" },
      { id: "CABELLO", label: "Cabello color" },
      { id: "VESTIMENTA", label: "Viste (vestimenta)", area: true }
    ],
    texto: (d) => `ACTA DE APREHENSIÓN\n\nEn la Localidad de ${d.LOCALIDAD}, Departamento ${d.DEPARTAMENTO}, Provincia de Córdoba, a los ${d.DIA} días del mes de ${d.MES} del año dos mil ${d.AÑO}. Siendo las ${d.HORA}:${d.MINUTOS} Horas, el funcionario policial que suscribe ${d.FUNCIONARIO} adscripto al personal de ${d.DEPENDENCIA}, a los efectos legales que corresponda, HACE CONSTAR: Que constituido en calle ${d.CALLE_HECHO} Nº${d.NRO_HECHO} de barrio ${d.BARRIO_HECHO}, y en presencia del testigo hábil para el acto. Sr/Sra ${d.TESTIGO_NOMBRE} domiciliado en calle ${d.TESTIGO_CALLE} Nº ${d.TESTIGO_NRO} Piso/Dpto ${d.TESTIGO_PISO} de barrio ${d.TESTIGO_BARRIO}, de la ciudad de ${d.TESTIGO_CIUDAD} quien acredita identidad mediante D.N.I. Nº ${d.TESTIGO_DNI} se procede a notificar por este acto al ciudadano/a ${d.APREHENDIDO_NOMBRE} de ${d.APREHENDIDO_EDAD} años de edad, de profesión ${d.APREHENDIDO_PROFESION}, con domicilio en calle ${d.APREHENDIDO_CALLE} Nº ${d.APREHENDIDO_NRO} Piso/Dpto ${d.APREHENDIDO_PISO} de barrio ${d.APREHENDIDO_BARRIO}, quien acredita identidad mediante D.N.I. Nº ${d.APREHENDIDO_DNI} que a partir de este momento se encuentra Aprehendido a disposición de ${d.DISPOSICION} por la supuesta comisión de un hecho de carácter delictual. Como así también se lo notifica al aprehendido/a su derechos y garantías constitucionales, amparados en los artículos 40, 41, y 42 de la Constitución Provincial, los que por este acto les son leídos en voz alta, que puede guardar silencio sin que ello implique presunción alguna de culpabilidad en su contra, que tiene derecho a la defensa técnica de un abogado defensor, si es su voluntad y que la privación de su libertad estará encuadrada dentro de los limites que fija la Constitución, además puede dar aviso de su situación a quien crea conveniente. Sus datos filiatorios y la vestimenta de la persona aprehendida, siendo el/la mismo/a de cutis ${d.CUTIS} de ${d.ALTURA} metros de altura, de contextura física ${d.CONTEXTURA}, cabello color ${d.CABELLO}, el/la cual viste: ${d.VESTIMENTA}\n\n\n__________________\nAprehendido/a\n\n__________________\nTestigo Hábil\n\n__________________\nFuncionario Policial`
  }
};

const FRASES_RAPIDAS = [
  "Que siendo la hora indicada, mientras este personal realizaba patrullaje preventivo...",
  "Que comisionados por la Central de Comunicaciones (101) nos constituimos en el lugar...",
  "Se procede al palpado preventivo de seguridad sobre sus prendas de vestir...",
  "No habiendo sido habido testigo civil hábil en las inmediaciones pese a las diligencias practicadas..."
];

const CHECKLIST_CPP = [
  "Fecha consignada (su omisión anula el acta, Art. 137 CPP); lugar y hora exactos (Art. 135 CPP)",
  "Testigo hábil: no menor de 16 años, lúcido y no ebrio (Art. 136 CPP)",
  "Diligencias realizadas y su resultado indicadas en el acta (Art. 135 CPP)",
  "Lectura de derechos constitucionales (Arts. 40, 42 y 49 Const. Cba.)",
  "Si hay ciego o analfabeto: informar derecho a lectura/firma por persona de confianza (Art. 135)",
  "Firma del funcionario actuante, testigo e intervinientes (o constancia de negativa)"
];

const ENCUADRE_TABLA = [
  ["Concepto", "Detalle Operativo / Legal"],
  ["Nulidades del Acta (Art. 137 CPP)", "Falta de fecha; falta de firma del funcionario actuante, del Secretario o del testigo; falta de la información al ciego o analfabeto sobre lectura y firma (Art. 135, última parte)."],
  ["Testigos Inhábiles (Art. 136 CPP)", "Menores de 16 años, dementes y personas en estado de ebriedad."],
  ["Comisaría / Unidad Judicial", "Recepta denuncia o inicia actuaciones por Acta del personal. Diligencias del Ayte. Fiscal."],
  ["Fiscalía de Turno (Río Cuarto)", "4 Fiscalías con turnos de 15 días. Imparten directivas de investigación."],
  ["Juzgado de Control y Faltas", "Ordena medidas cautelares (allanamiento, requisa, intervenciones telefónicas)."]
];

