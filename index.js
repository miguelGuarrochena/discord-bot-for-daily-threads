const { Client, GatewayIntentBits } = require("discord.js");
const cron = require("node-cron");
require("dotenv").config();

/*
====================================
CONFIGURACIÓN SIMPLE
====================================
AUTO   → Se ejecuta todos los días automáticamente
MANUAL → Se ejecuta una sola vez al iniciar
====================================
*/

const MODO = "MANUAL"; // Cambiar a "MANUAL" cuando sea necesario

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

let isRunning = false;

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
  `**Bloqueos:** [Ninguno / Tengo duda con…]\n\n` +
  `─────────────────────\n\n` +
  `**Tasks:** [What you'll be working on today]\n` +
  `**Materials:** [Do you need anything to work?]\n` +
  `**Workspace & Equipment:** [Status of your equipment]\n` +
  `**Blockers:** [None / I have a question about…]`;

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function crearHilos() {
  if (isRunning) {
    log("Ya se está ejecutando.");
    return;
  }

  isRunning = true;

  try {
    const canal = await client.channels.fetch(CHANNEL_ID);

    if (!canal || !canal.isTextBased()) {
      throw new Error("Canal inválido.");
    }

    const fecha = new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const activeThreads = await canal.threads.fetchActive();

    for (const area of AREAS) {
      const nombreHilo = `${area.nombre} — ${fecha}`;

      const yaExiste = activeThreads.threads.find((t) => t.name === nombreHilo);

      if (yaExiste) {
        log(`Ya existe: ${nombreHilo}`);
        continue;
      }

      const hilo = await canal.threads.create({
        name: nombreHilo,
        autoArchiveDuration: 1440,
        type: 11,
      });

      await hilo.send(MENSAJE(area.rol));
      log(`Creado: ${nombreHilo}`);

      await new Promise((r) => setTimeout(r, 1000));
    }
  } catch (err) {
    log(`Error: ${err.message}`);
  }

  isRunning = false;
}

client.once("ready", async () => {
  log(`Conectado como ${client.user.tag}`);

  if (MODO === "MANUAL") {
    log("Modo MANUAL activado");
    const dia = new Date().getDay();
    if (dia === 0 || dia === 6) {
      log("Fin de semana, no se ejecuta.");
    } else {
      await crearHilos();
    }
  }

  if (MODO === "AUTO") {
    log("Modo AUTO activado");
    cron.schedule("0 9 * * 1-5", crearHilos, {
      timezone: "America/Argentina/Buenos_Aires",
    });
  }
});

client.login(TOKEN);
