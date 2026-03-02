// const { Client, GatewayIntentBits } = require("discord.js");
// const cron = require("node-cron");

// const client = new Client({
//   intents: [GatewayIntentBits.Guilds],
// });

// require("dotenv").config();

// const TOKEN = process.env.DISCORD_TOKEN;
// const CHANNEL_ID = process.env.CHANNEL_ID;

// const AREAS = [
//   {
//     nombre: "Producción",
//     rol: "1271136515971485748",
//   },
//   {
//     nombre: "EA Leads",
//     rol: "1436365943482617989",
//   },
//   {
//     nombre: "Layout",
//     rol: "1338882968176951407",
//   },
//   {
//     nombre: "Animación",
//     rol: "1349879849237479464",
//   },
//   {
//     nombre: "Assit",
//     rol: "1435342725636427840",
//   },
//   {
//     nombre: "Clean up",
//     rol: "1349880578572423178",
//   },
//   {
//     nombre: "BG color",
//     rol: "1349880301899481198",
//   },
//   {
//     nombre: "Compo",
//     rol: "1349880945125228565",
//   },
//   {
//     nombre: "Calesita",
//     rol: "1423368772483420250",
//   },
// ];

// const MENSAJE = (rol) =>
//   `<@&${rol}>\n\n` +
//   `**Tareas:** [Lo que vas a hacer hoy]\n` +
//   `**Materiales:** [Te falta algo para trabajar?]\n` +
//   `**Espacio de trabajo y equipo:** [Estado de tu equipo]\n` +
//   `**Bloqueos:** [Ninguno / Tengo duda con…]\n` +
//   `**Completed tasks:** [Lo que avanzaste ayer, si entregaste o finalizaste algo]\n\n` +
//   `─────────────────────\n\n` +
//   `**Tasks:** [What you'll be working on today]\n` +
//   `**Materials:** [Do you need anything to work?]\n` +
//   `**Workspace & Equipment:** [Status of your equipment]\n` +
//   `**Blockers:** [None / I have a question about…]\n` +
//   `**Completed tasks:** [What you progressed on yesterday, if you delivered or finished something]`;

// async function crearHilos() {
//   const canal = await client.channels.fetch(CHANNEL_ID);
//   const fecha = new Date().toLocaleDateString("es-AR", {
//     weekday: "long",
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });

//   for (const area of AREAS) {
//     await canal.threads.create({
//       name: `${area.nombre} — ${fecha}`,
//       autoArchiveDuration: 1440,
//       message: { content: MENSAJE(area.rol) },
//     });

//     await new Promise((r) => setTimeout(r, 1000));
//   }

//   console.log(`✅ Hilos creados para ${fecha}`);
// }

// cron.schedule("0 9 * * 1-5", crearHilos, {
//   timezone: "America/Argentina/Buenos_Aires",
// });

// // client.once("ready", () => {
// //   console.log(`Bot conectado como ${client.user.tag}`);
// // });

// // Código para probar
// client.once("ready", async () => {
//   console.log(`Bot conectado como ${client.user.tag}`);
//   await crearHilos(); // ← quitar cuando ya funcione
// });

// client.login(TOKEN);

const { Client, GatewayIntentBits } = require("discord.js");
const cron = require("node-cron");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const AREAS = [
  { nombre: "Producción", rol: "1271136515971485748" },
  { nombre: "EA Leads", rol: "1436365943482617989" },
  { nombre: "Layout", rol: "1338882968176951407" },
  { nombre: "Animación", rol: "1349879849237479464" },
  { nombre: "Assit", rol: "1435342725636427840" },
  { nombre: "Clean up", rol: "1349880578572423178" },
  { nombre: "BG color", rol: "1349880301899481198" },
  { nombre: "Compo", rol: "1349880945125228565" },
  { nombre: "Calesita", rol: "1423368772483420250" },
];

const MENSAJE = (rol) =>
  `<@&${rol}>\n\n` +
  `**Tareas:** [Lo que vas a hacer hoy]\n` +
  `**Materiales:** [Te falta algo para trabajar?]\n` +
  `**Espacio de trabajo y equipo:** [Estado de tu equipo]\n` +
  `**Bloqueos:** [Ninguno / Tengo duda con…]\n` +
  `**Completed tasks:** [Lo que avanzaste ayer, si entregaste o finalizaste algo]\n\n` +
  `─────────────────────\n\n` +
  `**Tasks:** [What you'll be working on today]\n` +
  `**Materials:** [Do you need anything to work?]\n` +
  `**Workspace & Equipment:** [Status of your equipment]\n` +
  `**Blockers:** [None / I have a question about…]\n` +
  `**Completed tasks:** [What you progressed on yesterday, if you delivered or finished something]`;

async function crearHilos() {
  try {
    const canal = await client.channels.fetch(CHANNEL_ID);

    if (!canal) throw new Error("No se pudo encontrar el canal con ese ID.");
    if (!canal.isTextBased())
      throw new Error("El canal no es de texto ni forum.");

    const fecha = new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    for (const area of AREAS) {
      try {
        // Crear hilo (funciona en forum y canales de texto normales)
        const hilo = await canal.threads.create({
          name: `${area.nombre} — ${fecha}`,
          autoArchiveDuration: 1440,
          type: 11, // Public thread
        });

        // Enviar mensaje dentro del hilo
        await hilo.send(MENSAJE(area.rol));

        // Espera 1 segundo para no spamear la API
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error(
          `❌ Error creando hilo para ${area.nombre}:`,
          err.message,
        );
      }
    }

    console.log(`✅ Hilos creados para ${fecha}`);
  } catch (err) {
    console.error("❌ Error general al crear hilos:", err.message);
  }
}

// Cron: lunes a viernes 09:00 AM hora Argentina
cron.schedule("0 9 * * 1-5", crearHilos, {
  timezone: "America/Argentina/Buenos_Aires",
});

// Conexión del bot
client.once("ready", async () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  // Descomentá la siguiente línea para pruebas inmediatas
  await crearHilos();
});

client.login(TOKEN);
