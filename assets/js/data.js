/*
  Datos de la cafetería (ficticios).
  Para cambiar precios, horarios, charlas o ponentes, edita solo este archivo.
*/
window.SOBREMESA = {
  // Horario por día de la semana (0 = domingo … 6 = sábado), en hora de Madrid.
  horario: [
    { dia: "Domingo",   abre: "08:30", cierra: "14:30" },
    { dia: "Lunes",     abre: "07:30", cierra: "21:30" },
    { dia: "Martes",    abre: "07:30", cierra: "21:30" },
    { dia: "Miércoles", abre: "07:30", cierra: "21:30" },
    { dia: "Jueves",    abre: "07:30", cierra: "21:30" },
    { dia: "Viernes",   abre: "07:30", cierra: "21:30" },
    { dia: "Sábado",    abre: "08:30", cierra: "22:00" }
  ],

  // Descuento al pedir una bebida y un bollo juntos.
  descuentoDesayuno: 0.5,

  carta: {
    bebidas: [
      { id: "solo", nombre: "Café solo", desc: "Nuestra mezcla de Brasil y Etiopía, tostada en Alicante.", precio: 1.3 },
      { id: "cortado", nombre: "Cortado", desc: "Espresso con una nube de leche cremosa.", precio: 1.4 },
      { id: "con-leche", nombre: "Café con leche", desc: "En taza grande. Leche sin lactosa o de avena sin coste extra.", precio: 1.6 },
      { id: "bombon", nombre: "Café bombón", desc: "Espresso sobre leche condensada, en vaso de cristal.", precio: 1.7 },
      { id: "cortado-horchata", nombre: "Cortado de horchata", desc: "Espresso con horchata de chufa en lugar de leche.", precio: 1.9, casa: true },
      { id: "capuchino", nombre: "Capuchino con canela", desc: "Espuma densa y canela de Ceilán.", precio: 2.0 },
      { id: "blanco-negro", nombre: "Blanco y negro", desc: "Granizado de café con leche merengada hecha en casa.", precio: 2.6, casa: true },
      { id: "filtro", nombre: "Café de filtro del día", desc: "Un origen distinto cada semana, preparado en V60.", precio: 2.5 },
      { id: "chocolate", nombre: "Chocolate a la taza", desc: "Espeso, como el de las tardes de invierno.", precio: 2.1 },
      { id: "infusion", nombre: "Infusión de la huerta", desc: "Hierbaluisa, menta y piel de naranja.", precio: 1.5 }
    ],
    bolleria: [
      { id: "croissant", nombre: "Croissant de mantequilla", desc: "Hojaldre de 27 capas, recién salido del horno.", precio: 1.4 },
      { id: "croissant-turron", nombre: "Croissant de turrón de Jijona", desc: "Relleno de crema de turrón blando y almendra tostada.", precio: 2.1, casa: true },
      { id: "napolitana-horchata", nombre: "Napolitana de horchata", desc: "Hojaldre relleno de crema de horchata de chufa.", precio: 1.9, casa: true },
      { id: "napolitana-chocolate", nombre: "Napolitana de chocolate", desc: "Con chocolate negro al 60 %.", precio: 1.6 },
      { id: "ensaimada", nombre: "Ensaimada de cabello de ángel", desc: "Masa con dos días de fermentación.", precio: 1.9 },
      { id: "tortada", nombre: "Tortada de almendra marcona", desc: "Porción de tarta de almendra, sin harina.", precio: 2.3, casa: true },
      { id: "coca-llanda", nombre: "Coca de llanda de naranja", desc: "El bizcocho alicantino de siempre, con aceite de oliva.", precio: 1.5 },
      { id: "pastissets", nombre: "Pastissets de boniato (2 uds.)", desc: "Empanadillas dulces de boniato con un toque de anís.", precio: 1.6 },
      { id: "cana-crema", nombre: "Caña de crema", desc: "Hojaldre crujiente y crema pastelera.", precio: 1.5 },
      { id: "rollitos", nombre: "Rollitos de anís (3 uds.)", desc: "Fritos en casa y pasados por azúcar.", precio: 1.2 }
    ]
  },

  // Preguntas para las cartas de conversación.
  conversacion: {
    amistad: [
      "¿Qué es lo mejor que te ha pasado este mes?",
      "¿Qué plan llevamos años diciendo que haremos?",
      "¿Qué canción te devuelve a los quince años?",
      "¿Qué estás aprendiendo últimamente?",
      "¿A quién te gustaría volver a ver?",
      "¿Qué recuerdo nuestro te hace reír sin querer?",
      "Si mañana tuvieras el día libre, ¿qué harías?",
      "¿Qué te tiene ilusionado o ilusionada ahora mismo?"
    ],
    familia: [
      "¿Cómo era San Juan cuando tenías mi edad?",
      "¿Qué receta de la familia no debería perderse?",
      "¿Cuál fue tu primer trabajo?",
      "¿Qué fiesta recuerdas con más cariño?",
      "¿Qué consejo te dieron que sigues usando?",
      "¿Cuál es el viaje que más te ha gustado?",
      "¿Qué te gustaría que hiciéramos juntos este año?",
      "¿Qué juguete o juego no te quitabas de las manos de pequeño o pequeña?"
    ],
    pareja: [
      "¿Qué momento de esta semana te ha hecho feliz?",
      "¿Qué recuerdas de nuestra primera cita?",
      "¿Qué lugar quieres que conozcamos juntos?",
      "¿Qué pequeña cosa que hago te gusta?",
      "¿Qué te apetece cambiar de nuestra rutina?",
      "¿Qué sueño tienes pendiente?",
      "¿Cómo te imaginas dentro de diez años?",
      "¿Qué canción pondrías para describirnos?"
    ]
  },

  // Charlas de los martes (mujeres) y los jueves (hombres).
  charlas: {
    plazas: 20,
    inicio: "19:00",
    fin: "21:00",
    ellas: {
      diaSemana: 2, // martes
      nombre: "Entre nosotras",
      temas: [
        { titulo: "Menopausia: qué cambia y cómo llevarlo bien", ponente: "Dra. Elena Rives, ginecóloga" },
        { titulo: "Suelo pélvico en todas las etapas de la vida", ponente: "Marta Llorca, fisioterapeuta" },
        { titulo: "Dormir mejor: insomnio y cambios hormonales", ponente: "Dra. Pilar Sempere, médica de familia" },
        { titulo: "Huesos fuertes: cómo prevenir la osteoporosis", ponente: "Dra. Carmen Ivars, reumatóloga" },
        { titulo: "Perimenopausia: los años de antes que nadie explica", ponente: "Dra. Elena Rives, ginecóloga" },
        { titulo: "Alimentación a partir de los 40", ponente: "Lucía Ferrándiz, dietista-nutricionista" },
        { titulo: "Ansiedad y estrés del día a día", ponente: "Nuria Cerdà, psicóloga" },
        { titulo: "Posparto: el cuerpo y la cabeza después del bebé", ponente: "Rosa Maciá, matrona" },
        { titulo: "Endometriosis: reconocerla y pedir ayuda", ponente: "Dra. Elena Rives, ginecóloga" },
        { titulo: "Cuidar a quien cuida: cuando atiendes a un familiar mayor", ponente: "Nuria Cerdà, psicóloga" }
      ]
    },
    ellos: {
      diaSemana: 4, // jueves
      nombre: "Entre nosotros",
      temas: [
        { titulo: "Próstata a partir de los 50: revisiones y señales de aviso", ponente: "Dr. Andrés Pastor, urólogo" },
        { titulo: "Corazón y tensión: lo que dicen tus análisis", ponente: "Dr. Vicente Lloret, médico de familia" },
        { titulo: "Estrés y ansiedad: cuándo y cómo pedir ayuda", ponente: "Javier Miralles, psicólogo" },
        { titulo: "Testosterona y edad: qué es normal y qué no", ponente: "Dr. Rafael Soler, endocrino" },
        { titulo: "Ronquidos y apnea del sueño", ponente: "Dr. Joan Ripoll, neumólogo" },
        { titulo: "Espalda y rodillas: moverse sin dolor después de los 40", ponente: "Toni Berenguer, fisioterapeuta" },
        { titulo: "Salud sexual y disfunción eréctil, sin tabúes", ponente: "Dr. Andrés Pastor, urólogo" },
        { titulo: "Prevenir la diabetes tipo 2 desde la mesa", ponente: "Sergio Amorós, dietista-nutricionista" },
        { titulo: "Duelo y soledad: cuando falta alguien", ponente: "Javier Miralles, psicólogo" },
        { titulo: "Cáncer de colon: la prueba que conviene hacerse", ponente: "Dr. Vicente Lloret, médico de familia" }
      ]
    }
  }
};
