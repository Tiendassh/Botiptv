"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  MessageSquare, 
  Settings, 
  Terminal, 
  ArrowRight, 
  Upload, 
  Check, 
  CheckCheck, 
  RefreshCw, 
  Bot, 
  Smartphone, 
  Copy, 
  FileCode, 
  Trash, 
  Plus, 
  Cpu, 
  Coins, 
  User, 
  Key, 
  QrCode, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Download,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ==========================================
// UTILIDADES AUXILIARES EXTERNAS (EVITAN ADVERTENCIAS DE PUREZA DE REACT)
// ==========================================

const getStaticTimestamp = (offsetMinutes = 0): string => {
  const d = new Date(Date.now() - offsetMinutes * 60 * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const generateRandomId = (): string => {
  return Math.random().toString();
};

const generateRandomDemoCredentials = (prefix: string) => {
  const pass = Math.random().toString(36).substring(2, 8).toUpperCase();
  const user = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  return { user, pass };
};

const generateRandomPremiumCredentials = () => {
  const user = `vip_${Math.random().toString(36).substring(2, 7)}`;
  const pass = Math.floor(100000 + Math.random() * 900000).toString();
  return { user, pass };
};

// ==========================================
// COMPONENTES PRINCIPALES
// ==========================================

interface Message {
  id: string;
  sender: "bot" | "client" | "system";
  text: string;
  timestamp: string;
  mediaUrl?: string;
  isReceipt?: boolean;
}

interface AdminMessage {
  id: string;
  clientNumber: string;
  text: string;
  timestamp: string;
  mediaUrl?: string;
  approved?: boolean;
  rejected?: boolean;
}

interface DemoAccount {
  id: string;
  user: string;
  pass: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "expired";
}

export default function Home() {
  // Configuración del bot
  const [config, setConfig] = useState({
    adminNumber: "5493764515506",
    panelName: "VIP IPTV Premium",
    price1Month: "$3500 ARS",
    price3Months: "$9000 ARS",
    paymentAlias: "iptv.venta.mp",
    downloaderCode: "82541",
    installGuideUrl: "https://guias-iptv.com/instalacion",
    demoPrefix: "DEMO_",
    aiSupportEnabled: true
  });

  // Estado del Bot de WhatsApp
  const [botStatus, setBotStatus] = useState<"DISCONNECTED" | "SCANNING" | "CONNECTED">("CONNECTED");
  const [activeTab, setActiveTab] = useState<"chat" | "dashboard" | "admin" | "code">("chat");
  const [isTyping, setIsTyping] = useState(false);
  const [currentClientNumber] = useState("5493764999999");
  
  // Lista de Demos generadas inicialmente con valores estáticos para evitar impurezas en render
  const [demos, setDemos] = useState<DemoAccount[]>([
    {
      id: "demo-static-1",
      user: "DEMO_7241",
      pass: "XW8392",
      createdAt: "10:30",
      expiresAt: "Vence en 1h 00m",
      status: "active"
    },
    {
      id: "demo-static-2",
      user: "DEMO_1054",
      pass: "RE8492",
      createdAt: "09:30",
      expiresAt: "Expirado",
      status: "expired"
    }
  ]);

  // Mensajes del simulador de chat (Cliente <-> Bot) - Estáticos inicialmente para evitar impurezas
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "👋 ¡Hola! Te doy la bienvenida a nuestro servicio de *IPTV Premium* 📺.\n\nPor favor, elige una opción del menú enviando el número correspondiente:\n\n1️⃣ *Generar demo gratuita* (prueba de 2 horas)\n2️⃣ *Ver precios y datos de pago* (planes mensuales)\n3️⃣ *Recibir guías de instalación* (Downloader / Smart TV)\n\n_Escribe cualquier duda y nuestra Inteligencia Artificial te ayudará al instante._",
      timestamp: "12:00"
    }
  ]);

  // Mensajes de la bandeja del Administrador (Reenvío de comprobantes)
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);

  // Estados de carga de comprobante
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll para los chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    adminMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [adminMessages]);

  // Manejar el envío de mensajes por parte del cliente
  const handleClientSend = async (text: string, isMedia: boolean = false, mediaUrl?: string) => {
    if (botStatus !== "CONNECTED") {
      alert("El bot de WhatsApp está desconectado. Conéctalo desde la pestaña de Configuración.");
      return;
    }

    const currentTimestamp = getStaticTimestamp();
    const newMessage: Message = {
      id: generateRandomId(),
      sender: "client",
      text: text,
      timestamp: currentTimestamp,
      mediaUrl: mediaUrl,
      isReceipt: isMedia
    };

    setMessages(prev => [...prev, newMessage]);

    // Simular typing del bot
    setIsTyping(true);
    
    // Si el cliente envía una imagen/comprobante de pago
    if (isMedia && mediaUrl) {
      setTimeout(() => {
        setIsTyping(false);
        const receiptText = "✅ *¡Comprobante de pago recibido!* 🧾\n\nHe reenviado la captura a nuestro administrador para su validación manual inmediata. Te avisaré por aquí en cuanto se verifique tu pago para enviarte tus accesos premium.";
        const botTimestamp = getStaticTimestamp();
        setMessages(prev => [...prev, {
          id: generateRandomId(),
          sender: "bot",
          text: receiptText,
          timestamp: botTimestamp
        }]);

        // Reenviar al Administrador
        setAdminMessages(prev => [...prev, {
          id: generateRandomId(),
          clientNumber: currentClientNumber,
          text: `🔔 *Nuevo comprobante recibido* de Gus (${currentClientNumber}) para validar pago.`,
          timestamp: botTimestamp,
          mediaUrl: mediaUrl,
          approved: false,
          rejected: false
        }]);
      }, 1500);
      return;
    }

    // Respuestas automáticas por palabra clave (hola, menu, 1, 2, 3)
    const normalizedText = text.trim().toLowerCase();

    setTimeout(async () => {
      setIsTyping(false);
      let reply = "";

      if (normalizedText === "hola" || normalizedText === "menu" || normalizedText === "menú" || normalizedText === "inicio") {
        reply = `👋 ¡Hola nuevamente! Te presento el menú principal 📺:\n\n1️⃣ *Generar demo gratuita* (prueba de 2 horas)\n2️⃣ *Ver precios y datos de pago* (planes mensuales)\n3️⃣ *Recibir guías de instalación* (Downloader / Smart TV)\n\n_Escribe tu pregunta y te responderé con gusto._`;
      } else if (normalizedText === "1") {
        // Generar demo utilizando la función externa pura
        const { user: randUser, pass: randPass } = generateRandomDemoCredentials(config.demoPrefix);
        const demoTimestamp = getStaticTimestamp();
        
        const newDemo: DemoAccount = {
          id: generateRandomId(),
          user: randUser,
          pass: randPass,
          createdAt: demoTimestamp,
          expiresAt: "Vence en 2h 00m",
          status: "active"
        };
        setDemos(prev => [newDemo, ...prev]);

        reply = `📺 *¡Demo gratuita generada con éxito!* 🎉\n\nAquí tienes tus credenciales de acceso válidas por *2 horas*:\n\n👤 *Usuario:* \`${randUser}\`\n🔑 *Contraseña:* \`${randPass}\`\n\n📱 *Guía de instalación:* ${config.installGuideUrl}\n🔢 *Código Downloader:* \`${config.downloaderCode}\`\n\n_Recuerda que solo se permite una demo gratuita por cliente para evitar abusos._`;
      } else if (normalizedText === "2") {
        // Precios y pago
        reply = `💰 *Planes y Precios del Servicio* 📺\n\nDisfruta de la mejor televisión sin cortes:\n\n⭐ *1 Mes Premium:* \`${config.price1Month}\`\n⭐ *3 Meses Premium:* \`${config.price3Months}\` (¡Descuento!)\n\n📱 *Método de Pago (Mercado Pago / Transferencia):*\n👉 *Alias:* \`${config.paymentAlias}\`\n👉 *Titular:* IPTV Ventas S.A.\n\n⚠️ *IMPORTANTE:* Una vez realizado el pago, envía la captura del comprobante por este chat para que el bot active tus accesos premium automáticamente.`;
      } else if (normalizedText === "3") {
        // Guías de instalación
        reply = `🛠️ *Guías de Instalación y Soporte* ⚙️\n\nInstala nuestro servicio IPTV en cualquier dispositivo de forma simple:\n\n🔥 *Fire TV Stick / TV Box:* \n1. Instala la app *Downloader* desde la tienda de Amazon.\n2. Ingresa el código Downloader: \`${config.downloaderCode}\` para bajar la aplicación oficial.\n\n📺 *Smart TV (Samsung/LG):*\nDescarga la app *Smartters Player Lite* o *ibo Player* desde la tienda oficial.\n\n🌐 *Manual web y enlaces:* ${config.installGuideUrl}\n\n_Si tienes problemas de compatibilidad, escríbeme tu duda por aquí._`;
      } else {
        // Usar Gemini AI para responder preguntas libres si está activado
        if (config.aiSupportEnabled) {
          try {
            const aiRes = await fetch("/api/gemini/iptv", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: text, config })
            });
            const data = await aiRes.json();
            reply = data.text || "Disculpa, he tenido un inconveniente técnico al procesar tu consulta con la IA. ¿Puedes volver a intentar?";
          } catch (err) {
            reply = "🤖 *[Soporte AI]* Lo lamento, estoy experimentando dificultades de conexión. ¿Podrías consultarme nuevamente o elegir una opción del menú?";
          }
        } else {
          reply = "❌ Opción no reconocida. Por favor, escribe *menu* para ver el menú principal, o presiona 1, 2 o 3.";
        }
      }

      const replyTimestamp = getStaticTimestamp();
      setMessages(prev => [...prev, {
        id: generateRandomId(),
        sender: "bot",
        text: reply,
        timestamp: replyTimestamp
      }]);
    }, 1200);
  };

  // Manejar simulación de carga de comprobante
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            const objectUrl = URL.createObjectURL(file);
            handleClientSend("Enviando comprobante de pago...", true, objectUrl);
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  // Aprobar comprobante de pago desde panel Admin
  const handleApprovePayment = (adminMsgId: string, clientNo: string) => {
    setAdminMessages(prev => prev.map(m => m.id === adminMsgId ? { ...m, approved: true } : m));

    // Generar accesos premium reales/simulados utilizando la función externa pura
    const { user: userPremium, pass: passPremium } = generateRandomPremiumCredentials();
    const approvedTimestamp = getStaticTimestamp();

    // Notificar al cliente en el chat simulado
    setMessages(prev => [...prev, {
      id: generateRandomId(),
      sender: "bot",
      text: `🎉 *¡Tu pago ha sido verificado con éxito por el administrador!* 🧾\n\nAquí tienes tus credenciales de acceso premium *activas por 30 días*:\n\n👤 *Usuario:* \`${userPremium}\`\n🔑 *Contraseña:* \`${passPremium}\`\n\n📺 *Guías y enlaces de acceso:* ${config.installGuideUrl}\n\n¡Gracias por elegirnos! Tu servicio está listo para usar. Disfruta de la mejor televisión 🍿.`,
      timestamp: approvedTimestamp
    }]);
  };

  // Rechazar comprobante de pago desde panel Admin
  const handleRejectPayment = (adminMsgId: string, clientNo: string) => {
    setAdminMessages(prev => prev.map(m => m.id === adminMsgId ? { ...m, rejected: true } : m));
    const rejectTimestamp = getStaticTimestamp();

    // Notificar al cliente
    setMessages(prev => [...prev, {
      id: generateRandomId(),
      sender: "bot",
      text: `❌ *Comprobante de Pago Rechazado* ⚠️\n\nNuestro administrador ha revisado tu comprobante y parece ser inválido o no coincide con los registros bancarios.\n\nPor favor, verifica los datos del pago y vuelve a enviar el comprobante correcto o ponte en contacto con soporte si crees que es un error.`,
      timestamp: rejectTimestamp
    }]);
  };

  // Copiar código de exportación
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Formatear texto con soporte básico de markdown de whatsapp (*negrita*, _cursiva_, `mono`)
  const formatWhatsappMessage = (text: string) => {
    if (!text) return "";
    let formatted = text;
    // Negrita *texto*
    formatted = formatted.replace(/\*([^*]+)\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
    // Cursiva _texto_
    formatted = formatted.replace(/_([^_]+)_/g, '<em class="italic text-gray-700">$1</em>');
    // Monocromo `texto`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 border border-gray-200 rounded px-1 text-xs font-mono text-pink-600">$1</code>');
    // Saltos de línea
    formatted = formatted.replace(/\n/g, "<br />");
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Generar dinámicamente el contenido de configuracion.js
  const configuracionJsCode = `// configuracion.js
// Archivo de parámetros del bot para paneles, precios y administrador

module.exports = {
  // Número de WhatsApp del administrador (con código de país, sin el signo +)
  admin_number: "${config.adminNumber}",

  // Nombre comercial de tu servicio IPTV
  panel_name: "${config.panelName}",

  // Tarifas configuradas de tus planes
  price_1_month: "${config.price1Month}",
  price_3_months: "${config.price3Months}",

  // Alias o CBU para recibir los pagos
  payment_alias: "${config.paymentAlias}",

  // Parámetros de instalación rápida
  downloader_code: "${config.downloaderCode}",
  install_guide_url: "${config.installGuideUrl}",

  // Prefijo para identificar las cuentas demo automáticas en tu panel
  demo_prefix: "${config.demoPrefix}",

  // Si está activado, procesa preguntas libres utilizando la API de Inteligencia Artificial (Gemini)
  ai_support_enabled: ${config.aiSupportEnabled}
};`;

  // Generar dinámicamente el contenido de demoManager.js
  const demoManagerJsCode = `// demoManager.js
// Módulo para la generación de contraseñas rotativas y control de demos

const configuracion = require("./configuracion");

// Generador de contraseña aleatoria de longitud fija
function generateRandomPassword(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Genera datos simulados que puedes integrar mediante la API de tu Panel IPTV
function generateDemo() {
  const demoUser = \`\${configuracion.demo_prefix}\${Math.floor(1000 + Math.random() * 9000)}\`;
  const demoPass = generateRandomPassword();
  
  return {
    usuario: demoUser,
    contrasena: demoPass,
    url: configuracion.install_guide_url,
    downloader_code: configuracion.downloader_code,
    creadoEn: new Date().toISOString()
  };
}

module.exports = {
  generateDemo,
  generateRandomPassword
};`;

  // Generar dinámicamente el contenido de index.js
  const indexJsCode = `// index.js
// Código principal para la conexión con Baileys WhatsApp API y automatización

const { 
  makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion, 
  delay 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const configuracion = require("./configuracion");
const demoManager = require("./demoManager");

// Control de memoria y listeners máximos para reconexión infinita
require("events").EventEmitter.defaultMaxListeners = 50;

async function conectarBot() {
  console.log("🚀 Iniciando Bot IPTV Auto-Venta...");
  
  // Guardar credenciales de sesión en auth_info
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true, // Muestra el QR en la consola para escanear
    auth: state,
    logger: pino({ level: "silent" })
  });

  // Guardar credenciales de forma reactiva ante cambios
  sock.ev.on("creds.update", saveCreds);

  // Gestión de reconexión infinita
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("👉 Escanea el código QR impreso abajo con tu celular que usará el bot:");
    }

    if (connection === "close") {
      const debeReconectarse = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(\`⚠️ Conexión cerrada debido a: \${lastDisconnect?.error || "Desconexión manual"}. Reconectando en 5s...\`);
      
      // Limpiar listeners antes de reconectar para evitar fugas de memoria
      sock.ev.removeAllListeners();
      
      if (debeReconectarse) {
        setTimeout(conectarBot, 5000);
      } else {
        console.log("❌ Sesión cerrada permanentemente. Borra la carpeta 'auth_info' y vuelve a iniciar para escanear nuevo QR.");
      }
    } else if (connection === "open") {
      console.log("✅ ¡Bot IPTV conectado exitosamente a WhatsApp! Listo para recibir mensajes.");
    }
  });

  // Escucha universal de mensajes entrantes
  sock.ev.on("messages.upsert", async (m) => {
    if (m.type !== "notify") return;
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const clientNumber = from.split("@")[0];

    // Marcar mensaje leído de inmediato (doble check azul)
    await sock.readMessages([msg.key]);

    // Extraer texto o descripción si es imagen
    const type = Object.keys(msg.message)[0];
    let bodyText = "";

    if (type === "conversation") {
      bodyText = msg.message.conversation;
    } else if (type === "extendedTextMessage") {
      bodyText = msg.message.extendedTextMessage.text;
    } else if (type === "imageMessage") {
      bodyText = msg.message.imageMessage.caption || "";
    }

    const normalizedText = bodyText.trim().toLowerCase();
    console.log(\`💬 Mensaje de [\${clientNumber}]: \${bodyText}\`);

    // 1. Reenvío automático de imágenes/comprobantes al administrador
    if (type === "imageMessage") {
      await sock.sendMessage(from, { 
        text: "✅ *¡Comprobante de pago recibido!* 🧾\\n\\nLo he reenviado a nuestro administrador para su verificación inmediata. Te avisaré por aquí en cuanto se valide tu pago para enviarte tus credenciales de acceso premium." 
      });

      // Reenviar al número del administrador configurado
      const adminJid = \`\${configuracion.admin_number}@s.whatsapp.net\`;
      
      // Reenvía el mismo mensaje de imagen al administrador con los detalles
      await sock.sendMessage(adminJid, {
        forward: msg,
        contextInfo: {
          isForwarded: true
        }
      });
      
      await sock.sendMessage(adminJid, { 
        text: \`🔔 *IPTV BOT:* El cliente Gus (\${clientNumber}) ha enviado este comprobante. Valídalo y respóndele por este chat para activar sus accesos premium o denegarlo.\` 
      });
      return;
    }

    // 2. Respuestas automáticas según palabras clave y opciones del menú
    if (normalizedText === "hola" || normalizedText === "menu" || normalizedText === "menú" || normalizedText === "inicio") {
      const menu = \`👋 ¡Hola! Te doy la bienvenida a nuestro servicio de *IPTV Premium* 📺.

Elige una opción enviando el número correspondiente:

1️⃣ *Generar demo gratuita* (prueba de 2 horas)
2️⃣ *Ver precios y datos de pago* (planes mensuales)
3️⃣ *Recibir guías de instalación* (Downloader / Smart TV)

_Escribe tu duda y te ayudaré con gusto._\`;

      await sock.sendMessage(from, { text: menu });
      
    } else if (normalizedText === "1") {
      // Opción 1: Generar demo con credenciales rotativas automáticas
      const demo = demoManager.generateDemo();
      
      const respuestaDemo = \`📺 *¡Demo gratuita generada con éxito!* 🎉

Aquí tienes tus credenciales de acceso válidas por *2 horas*:

👤 *Usuario:* \`\${demo.usuario}\`
🔑 *Contraseña:* \`\${demo.contrasena}\`

📱 *Guía de instalación:* \${demo.url}
🔢 *Código Downloader:* \`\${demo.downloader_code}\`

_Recuerda que solo se permite una demo por número de celular para evitar abusos._\`;

      await sock.sendMessage(from, { text: respuestaDemo });
      
    } else if (normalizedText === "2") {
      // Opción 2: Mostrar precios y datos de pago
      const respuestaPrecios = \`💰 *Planes y Precios del Servicio* 📺

Disfruta del mejor entretenimiento sin interrupciones:

⭐ *1 Mes Premium:* \`\${configuracion.price_1_month}\`
⭐ *3 Meses Premium:* \`\${configuracion.price_3_months}\` (¡Con descuento!)

📱 *Método de Pago (Mercado Pago / Transferencia):*
👉 *Alias:* \`\${configuracion.payment_alias}\`
👉 *Titular:* IPTV Ventas S.A.

⚠️ *IMPORTANTE:* Una vez realizado el pago, envía la captura del comprobante por este chat para que activemos tus accesos premium automáticamente.\`;

      await sock.sendMessage(from, { text: respuestaPrecios });
      
    } else if (normalizedText === "3") {
      // Opción 3: Enviar guías de instalación
      const respuestaGuias = \`🛠️ *Guías de Instalación y Soporte* ⚙️

Instala nuestro servicio IPTV en cualquier dispositivo de forma simple:

🔥 *Fire TV Stick / TV Box:* 
1. Descarga la app *Downloader* desde la tienda de Amazon.
2. Ingresa el código Downloader: \`\${configuracion.downloader_code}\` para bajar la app oficial.

📺 *Smart TV (Samsung/LG):*
Descarga la app *Smartters Player Lite* o *ibo Player* desde la tienda oficial.

🌐 *Manual web de instalación:* \${configuracion.install_guide_url}\`;

      await sock.sendMessage(from, { text: respuestaGuias });
      
    } else {
      // Si el cliente escribe otra cosa e Inteligencia Artificial está activada
      if (configuracion.ai_support_enabled) {
        // Integrar llamada a la API de tu IA o responder mensaje de cortesía inteligente
        console.log("Procesando consulta con Inteligencia Artificial...");
        await sock.sendMessage(from, { 
          text: \`🤖 *[Asistente AI]* Gracias por tu consulta: "\${bodyText}". Estamos analizando tu consulta para darte soporte técnico personalizado. Si deseas ver opciones, escribe *menu*.\` 
        });
      } else {
        await sock.sendMessage(from, { 
          text: "❌ Opción no reconocida. Escribe *menu* para ver las opciones disponibles." 
        });
      }
    }
  });
}

conectarBot().catch(err => console.error("❌ Error grave en ejecución:", err));`;

  // package.json exportable
  const packageJsonCode = `{
  "name": "iptv-bot-v2",
  "version": "2.0.0",
  "description": "Bot automático para la venta y gestión de servicios IPTV por WhatsApp",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.5.0",
    "axios": "^1.6.8",
    "pino": "^8.14.1",
    "qrcode-terminal": "^0.12.0"
  },
  "author": "Gustavo Abettiol",
  "license": "MIT"
}`;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-800 font-sans antialiased pb-12 flex flex-col">
      {/* HEADER DE LA APP */}
      <header className="bg-[#075E54] text-white shadow-lg border-b border-[#054c44] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 rounded-xl shadow-inner text-white animate-pulse">
              <Bot size={28} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Bot IPTV Auto-Venta</h1>
              <p className="text-xs text-emerald-200 font-mono tracking-wide">WhatsApp Web API (Baileys) • v2.0</p>
            </div>
          </div>

          {/* Estado de Conexión */}
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-semibold text-emerald-100 hidden md:inline">Estado de WhatsApp:</span>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                botStatus === "CONNECTED" ? "bg-green-400" : botStatus === "SCANNING" ? "bg-amber-400 animate-ping" : "bg-red-500"
              }`} />
              <span className="text-sm font-bold tracking-wider">
                {botStatus === "CONNECTED" && "CONECTADO"}
                {botStatus === "SCANNING" && "ESCANEAR QR"}
                {botStatus === "DISCONNECTED" && "DESCONECTADO"}
              </span>
            </div>
            {botStatus === "CONNECTED" ? (
              <button 
                onClick={() => setBotStatus("DISCONNECTED")}
                className="text-xs bg-red-600/30 text-red-100 hover:bg-red-600/50 px-2 py-1 rounded transition border border-red-500/20 cursor-pointer"
              >
                Desconectar
              </button>
            ) : (
              <button 
                onClick={() => setBotStatus("CONNECTED")}
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded transition font-medium cursor-pointer"
              >
                Conectar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* TABS DE NAVEGACIÓN */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-[73px] sm:top-[76px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                activeTab === "chat"
                  ? "border-[#128C7E] text-[#128C7E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MessageSquare size={18} />
              Simulador de Chat
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition relative whitespace-nowrap cursor-pointer ${
                activeTab === "admin"
                  ? "border-[#128C7E] text-[#128C7E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Smartphone size={18} />
              Bandeja Administrador
              {adminMessages.filter(m => !m.approved && !m.rejected).length > 0 && (
                <span className="absolute top-2.5 -right-3.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                  {adminMessages.filter(m => !m.approved && !m.rejected).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                activeTab === "dashboard"
                  ? "border-[#128C7E] text-[#128C7E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Settings size={18} />
              Configuración & Demos
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                activeTab === "code"
                  ? "border-[#128C7E] text-[#128C7E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileCode size={18} />
              Exportar Código Bot
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SIMULADOR DE CHAT CLIENTE */}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Instrucciones Rápidas del Simulador */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Info size={18} className="text-[#128C7E]" />
                    ¿Cómo probar la simulación?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Este panel simula la perspectiva de un cliente real escribiendo al WhatsApp de tu bot.
                  </p>
                  
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase block">Atajos rápidos:</span>
                    
                    <button 
                      onClick={() => handleClientSend("hola")}
                      className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-[#128C7E] hover:bg-[#F2F9F7] text-sm font-medium text-gray-700 transition flex justify-between items-center group cursor-pointer"
                    >
                      <span>Menú principal (&quot;hola&quot;)</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition text-[#128C7E]" />
                    </button>

                    <button 
                      onClick={() => handleClientSend("1")}
                      className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-[#128C7E] hover:bg-[#F2F9F7] text-sm font-medium text-gray-700 transition flex justify-between items-center group cursor-pointer"
                    >
                      <span>Opción 1: Generar demo</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition text-[#128C7E]" />
                    </button>

                    <button 
                      onClick={() => handleClientSend("2")}
                      className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-[#128C7E] hover:bg-[#F2F9F7] text-sm font-medium text-gray-700 transition flex justify-between items-center group cursor-pointer"
                    >
                      <span>Opción 2: Precios y Pago</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition text-[#128C7E]" />
                    </button>

                    <button 
                      onClick={() => handleClientSend("3")}
                      className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-[#128C7E] hover:bg-[#F2F9F7] text-sm font-medium text-gray-700 transition flex justify-between items-center group cursor-pointer"
                    >
                      <span>Opción 3: Guías de instalación</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition text-[#128C7E]" />
                    </button>

                    {config.aiSupportEnabled && (
                      <button 
                        onClick={() => handleClientSend("¿Tienen canales de fútbol de Argentina en vivo y películas de estreno?")}
                        className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-[#128C7E] hover:bg-[#F2F9F7] text-sm font-medium text-gray-700 transition flex justify-between items-center group cursor-pointer"
                      >
                        <span className="line-clamp-1">Preguntar sobre canales (Inteligencia Artificial)</span>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition text-[#128C7E]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card de Configuración de IA */}
                <div className="bg-gradient-to-br from-[#075E54]/5 to-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Cpu size={16} className="text-[#128C7E]" />
                      IA Soporte (Gemini)
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      config.aiSupportEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {config.aiSupportEnabled ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    Si el usuario realiza una pregunta que no coincide con las opciones del menú, Gemini responderá de forma inteligente con información de compatibilidad, canales y soporte.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition">
                    <input 
                      type="checkbox"
                      checked={config.aiSupportEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, aiSupportEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-[#128C7E] focus:ring-[#128C7E]"
                    />
                    <span className="text-xs font-semibold text-gray-700">Habilitar IA de Gemini</span>
                  </label>
                </div>
              </div>

              {/* Contenedor del Chat de WhatsApp */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col h-[640px]">
                {/* Cabecera del Chat */}
                <div className="bg-[#075E54] text-white px-5 py-3 flex justify-between items-center border-b border-[#054c44]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow">
                        B
                      </div>
                      {botStatus === "CONNECTED" && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-[#075E54]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base">{config.panelName} • Bot de Ventas</h4>
                      <p className="text-[11px] text-emerald-200">
                        {isTyping ? "Escribiendo..." : botStatus === "CONNECTED" ? "En línea (Automático)" : "Fuera de línea"}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs bg-[#128C7E]/40 border border-emerald-500/20 px-2.5 py-1 rounded font-mono">
                    Cliente: {currentClientNumber}
                  </div>
                </div>

                {/* Cuerpo del Chat (Mensajes) */}
                <div 
                  className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#E5DDD5]" 
                  style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "overlay" }}
                >
                  {messages.map((msg) => {
                    const isClient = msg.sender === "client";
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isClient ? "justify-end" : "justify-start"} items-end gap-1`}
                      >
                        {!isClient && (
                          <div className="h-6 w-6 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                            AI
                          </div>
                        )}
                        
                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-xl px-3.5 py-2 shadow-sm relative ${
                          isClient 
                            ? "bg-[#DCF8C6] text-gray-800 rounded-tr-none" 
                            : "bg-white text-gray-800 rounded-tl-none"
                        }`}>
                          {/* Contenido multimedia si existe */}
                          {msg.mediaUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-gray-200/50 max-w-[260px]">
                              <Image 
                                src={msg.mediaUrl} 
                                alt="Comprobante cargado" 
                                width={260}
                                height={176}
                                className="object-cover w-full h-44 cursor-pointer hover:scale-105 transition duration-200"
                                unoptimized
                              />
                              <div className="bg-black/5 p-1.5 text-center text-[10px] font-mono text-gray-500">
                                📎 archivo_comprobante.jpg
                              </div>
                            </div>
                          )}

                          {/* Texto formateado */}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {formatWhatsappMessage(msg.text)}
                          </p>

                          {/* Footer de mensaje con hora y checkmarks */}
                          <div className="text-[9px] text-gray-400 mt-1.5 flex justify-end items-center gap-1">
                            <span>{msg.timestamp}</span>
                            {isClient ? (
                              <CheckCheck size={13} className="text-[#34B7F1]" />
                            ) : (
                              <CheckCheck size={13} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start items-center gap-1">
                      <div className="h-6 w-6 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                        AI
                      </div>
                      <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 shadow-sm text-xs text-gray-500 italic flex items-center gap-2">
                        <span className="flex space-x-1">
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                        El bot está procesando...
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Footer de Entrada de Texto (Enviar mensajes / Comprobantes) */}
                <div className="bg-[#F0F0F0] p-3 border-t border-gray-200 flex items-center gap-3">
                  {/* Botón de Enviar Imagen / Comprobante */}
                  <div className="relative">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 bg-white rounded-full hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 shadow-sm transition flex items-center justify-center cursor-pointer"
                      title="Simular subir comprobante de pago"
                    >
                      <ImageIcon size={20} />
                    </button>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Input de texto para simular al usuario */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const input = form.elements.namedItem("clientMessage") as HTMLInputElement;
                      if (!input.value.trim()) return;
                      handleClientSend(input.value);
                      input.value = "";
                    }}
                    className="flex-grow flex gap-2"
                  >
                    <input 
                      type="text"
                      name="clientMessage"
                      placeholder="Escribe un mensaje al bot (ej: hola, 1, o tu pregunta)..."
                      className="flex-grow bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-[#128C7E] shadow-inner"
                      disabled={botStatus !== "CONNECTED"}
                    />
                    <button 
                      type="submit"
                      className="bg-[#128C7E] hover:bg-[#0b6359] text-white p-2.5 rounded-full shadow transition-all duration-150 flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                      disabled={botStatus !== "CONNECTED"}
                    >
                      <ArrowRight size={20} />
                    </button>
                  </form>
                </div>

                {/* Barra de Progreso de Subida de Archivo */}
                {uploadProgress !== null && (
                  <div className="bg-[#075E54] text-white px-4 py-2 flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      Cargando comprobante de pago...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: BANDEJA DE ENTRADA DEL ADMIN (COMPROBANTES REENVIADOS) */}
          {activeTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Información sobre el Reenvío automático */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Smartphone size={18} className="text-[#075E54]" />
                    ¿Qué es este panel?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Aquí se visualiza la bandeja de mensajes que recibe el celular del <strong>Administrador</strong> (<code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs text-emerald-800">{config.adminNumber}</code>).
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Cuando un cliente sube una imagen al bot, el bot la descarga e inmediatamente la reenvía por WhatsApp al administrador para su aprobación.
                  </p>
                  
                  <div className="mt-5 p-3.5 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <span className="text-xs font-bold text-yellow-800 flex items-center gap-1.5 mb-1">
                      <AlertCircle size={14} />
                      Prueba el Flujo Completo:
                    </span>
                    <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Ve a la pestaña <strong>Simulador de Chat</strong>.</li>
                      <li>Haz clic en el ícono de imagen (<ImageIcon size={12} className="inline mx-0.5" />) y sube una foto cualquiera.</li>
                      <li>Regresa aquí para ver el comprobante reenviado en tiempo real.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Mensajes del Administrador */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col h-[600px]">
                <div className="bg-[#075E54] text-white px-5 py-4 border-b border-[#054c44] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-lg border border-white/20">
                      Ad
                    </div>
                    <div>
                      <h4 className="font-bold text-base">Chat Administrador ({config.adminNumber})</h4>
                      <p className="text-xs text-emerald-200">Reenvío automático de recibos del bot</p>
                    </div>
                  </div>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded border border-white/10 font-mono font-semibold">
                    Inbox
                  </span>
                </div>

                {/* Lista de Mensajes Reenviados */}
                <div 
                  className="flex-grow p-4 sm:p-6 overflow-y-auto bg-slate-50 space-y-4"
                >
                  {adminMessages.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center p-6 text-gray-400">
                      <ImageIcon size={48} className="mb-3 text-gray-300 stroke-1" />
                      <p className="text-base font-semibold">No se han recibido comprobantes todavía</p>
                      <p className="text-xs max-w-sm mt-1">Sube una foto desde el Simulador de Chat para verla reflejada aquí de inmediato.</p>
                    </div>
                  ) : (
                    adminMessages.map((msg) => (
                      <div key={msg.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                        {/* Cabecera del mensaje */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-[#128C7E] font-mono">Remitente: {msg.clientNumber}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">Fecha: {msg.timestamp}</span>
                          </div>
                          
                          {/* Insignias de estado */}
                          {msg.approved && (
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              PAGO APROBADO
                            </span>
                          )}
                          {msg.rejected && (
                            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                              <AlertCircle size={13} />
                              PAGO RECHAZADO
                            </span>
                          )}
                          {!msg.approved && !msg.rejected && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold animate-pulse">
                              PENDIENTE DE VERIFICACIÓN
                            </span>
                          )}
                        </div>

                        {/* Contenido */}
                        <p className="text-sm text-gray-700 font-medium">
                          {formatWhatsappMessage(msg.text)}
                        </p>

                        {/* Imagen del comprobante */}
                        {msg.mediaUrl && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden max-w-xs relative bg-gray-50 group">
                            <Image 
                              src={msg.mediaUrl} 
                              alt="Captura de comprobante" 
                              width={320}
                              height={224}
                              className="object-contain w-full h-56 hover:opacity-95 transition"
                              unoptimized
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                              comprobante_banco.png
                            </div>
                          </div>
                        )}

                        {/* Acciones del Administrador */}
                        {!msg.approved && !msg.rejected && (
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleApprovePayment(msg.id, msg.clientNumber)}
                              className="flex-1 bg-[#128C7E] hover:bg-[#0b6359] text-white py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow cursor-pointer"
                            >
                              <UserCheck size={14} />
                              Aprobar Pago y Entregar IPTV Premium
                            </button>
                            <button
                              onClick={() => handleRejectPayment(msg.id, msg.clientNumber)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}

                        {msg.approved && (
                          <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 flex items-center gap-2">
                            <Check size={14} className="stroke-2 text-green-600" />
                            <span>
                              <strong>Acción completada:</strong> El bot ha generado un nuevo usuario premium de 30 días y se lo ha enviado automáticamente al cliente.
                            </span>
                          </div>
                        )}

                        {msg.rejected && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-center gap-2">
                            <AlertCircle size={14} className="stroke-2 text-red-600" />
                            <span>
                              <strong>Rechazado:</strong> Se notificó al cliente que el comprobante enviado es incorrecto.
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={adminMessagesEndRef} />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CONFIGURACIÓN & DEMOS */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Sección superior: Configuración Modular del Archivo */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-[#075E54]/10 rounded-lg text-[#075E54]">
                    <Settings size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Configuración Modular (`configuracion.js`)</h2>
                    <p className="text-xs text-gray-500">Ajusta los parámetros para cambiar la respuesta del simulador y actualizar dinámicamente el código de exportación.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Número de Admin */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Número del Administrador</label>
                    <input 
                      type="text"
                      value={config.adminNumber}
                      onChange={(e) => setConfig(prev => ({ ...prev, adminNumber: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#128C7E]"
                      placeholder="Ej: 5493764515506"
                    />
                    <p className="text-[10px] text-gray-500">Donde se reciben los comprobantes de pago.</p>
                  </div>

                  {/* Nombre del Panel */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Nombre Comercial del Panel</label>
                    <input 
                      type="text"
                      value={config.panelName}
                      onChange={(e) => setConfig(prev => ({ ...prev, panelName: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#128C7E]"
                      placeholder="Ej: VIP IPTV Premium"
                    />
                    <p className="text-[10px] text-gray-500">Se muestra en el saludo inicial.</p>
                  </div>

                  {/* Alias de pago */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Alias / CBU de Cobro</label>
                    <input 
                      type="text"
                      value={config.paymentAlias}
                      onChange={(e) => setConfig(prev => ({ ...prev, paymentAlias: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#128C7E]"
                      placeholder="Ej: iptv.venta.mp"
                    />
                    <p className="text-[10px] text-gray-500">Mostrado en la opción 2.</p>
                  </div>

                  {/* Tarifas de planes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Precio 1 Mes Premium</label>
                    <input 
                      type="text"
                      value={config.price1Month}
                      onChange={(e) => setConfig(prev => ({ ...prev, price1Month: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#128C7E]"
                      placeholder="Ej: $3500 ARS"
                    />
                  </div>

                  {/* Tarifas de planes 3 meses */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Precio 3 Meses Premium</label>
                    <input 
                      type="text"
                      value={config.price3Months}
                      onChange={(e) => setConfig(prev => ({ ...prev, price3Months: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#128C7E]"
                      placeholder="Ej: $9000 ARS"
                    />
                  </div>

                  {/* Código downloader */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Código de Downloader (App)</label>
                    <input 
                      type="text"
                      value={config.downloaderCode}
                      onChange={(e) => setConfig(prev => ({ ...prev, downloaderCode: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#128C7E]"
                      placeholder="Ej: 82541"
                    />
                  </div>

                  {/* Link Guía */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">URL de Guía de Instalación</label>
                    <input 
                      type="text"
                      value={config.installGuideUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, installGuideUrl: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#128C7E]"
                      placeholder="Ej: https://guias-iptv.com/instalacion"
                    />
                  </div>

                  {/* Prefijo Demo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Prefijo de Demos</label>
                    <input 
                      type="text"
                      value={config.demoPrefix}
                      onChange={(e) => setConfig(prev => ({ ...prev, demoPrefix: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#128C7E]"
                      placeholder="Ej: DEMO_"
                    />
                  </div>
                </div>
              </div>

              {/* Sección inferior: Gestión de Demos & Emparejamiento QR de WhatsApp */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Gestión de Demos Rotativas */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md flex flex-col">
                  <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Coins size={18} className="text-amber-500" />
                      Demos Generadas en Tiempo Real
                    </h3>
                    
                    {/* Botón para generar demo manualmente en la tabla */}
                    <button
                      onClick={() => {
                        const { user: randUser, pass: randPass } = generateRandomDemoCredentials(config.demoPrefix);
                        const demoTimestamp = getStaticTimestamp();
                        
                        const newDemo: DemoAccount = {
                          id: generateRandomId(),
                          user: randUser,
                          pass: randPass,
                          createdAt: demoTimestamp,
                          expiresAt: "Vence en 2h 00m",
                          status: "active"
                        };
                        setDemos(prev => [newDemo, ...prev]);
                      }}
                      className="bg-[#128C7E] hover:bg-[#0b6359] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Plus size={14} />
                      Crear Demo
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Estas cuentas simulan las demos con contraseñas temporales que entrega el bot automáticamente cuando el usuario digita <strong>1</strong>.
                  </p>

                  <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider bg-slate-50/50">
                          <th className="py-2.5 px-3">Usuario</th>
                          <th className="py-2.5 px-3">Contraseña</th>
                          <th className="py-2.5 px-3">Generada</th>
                          <th className="py-2.5 px-3">Validez</th>
                          <th className="py-2.5 px-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demos.map(demo => (
                          <tr key={demo.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition">
                            <td className="py-3 px-3 font-mono font-bold text-gray-800">{demo.user}</td>
                            <td className="py-3 px-3 font-mono text-pink-600 bg-pink-50/40 rounded px-1.5">{demo.pass}</td>
                            <td className="py-3 px-3 text-gray-500">{demo.createdAt}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                demo.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {demo.expiresAt}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setDemos(prev => prev.filter(d => d.id !== demo.id))}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                                title="Eliminar demo"
                              >
                                <Trash size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Simulador de QR y Estado de Baileys */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <QrCode size={18} className="text-[#075E54]" />
                    Vinculación de WhatsApp Web (QR)
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Baileys simula una sesión de WhatsApp Web para leer y responder. El bot genera un código QR que debes escanear una única vez con tu teléfono desde la opción &quot;Dispositivos vinculados&quot; de WhatsApp.
                  </p>

                  <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl p-6 bg-slate-50 relative overflow-hidden">
                    {botStatus === "CONNECTED" ? (
                      <div className="text-center space-y-3 py-6">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                          <Check size={36} className="stroke-3" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">¡Bot Conectado con Éxito!</p>
                          <p className="text-xs text-gray-500 mt-0.5">La sesión de Baileys está activa y respondiendo.</p>
                        </div>
                        <button
                          onClick={() => setBotStatus("DISCONNECTED")}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-bold transition mx-auto block cursor-pointer"
                        >
                          Cerrar Sesión (Simulado)
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4 py-3">
                        {/* Mock QR Code con animación de scanner */}
                        <div className="relative border-4 border-gray-800 rounded-lg p-2.5 bg-white mx-auto shadow-md">
                          <div className="absolute left-0 right-0 h-0.5 bg-green-500 animate-[bounce_2s_infinite]" />
                          <div className="grid grid-cols-4 gap-1 h-32 w-32 bg-gray-100 opacity-80 select-none">
                            {/* Esquinas del QR */}
                            <div className="bg-gray-800 rounded-sm m-1" />
                            <div className="bg-gray-200" />
                            <div className="bg-gray-200" />
                            <div className="bg-gray-800 rounded-sm m-1" />
                            <div className="bg-gray-200" />
                            <div className="bg-gray-800" />
                            <div className="bg-gray-800" />
                            <div className="bg-gray-200" />
                            <div className="bg-gray-200" />
                            <div className="bg-gray-800" />
                            <div className="bg-gray-800" />
                            <div className="bg-gray-200" />
                            <div className="bg-gray-800 rounded-sm m-1" />
                            <div className="bg-gray-200" />
                            <div className="bg-gray-200" />
                            <div className="bg-gray-800 rounded-sm m-1" />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-gray-700">QR Listo para Escanear</p>
                          <p className="text-[10px] text-gray-400 mt-1 max-w-xs">Simula el emparejamiento desde tu teléfono celular para arrancar el bot.</p>
                        </div>

                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setBotStatus("CONNECTED");
                            }}
                            className="bg-[#128C7E] hover:bg-[#0b6359] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer"
                          >
                            Simular Escaneo Exitoso 🎉
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: EXPORTAR CÓDIGO BOT */}
          {activeTab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Card de cabecera de exportación */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-600">
                      <Terminal size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Código de Producción Listo para tu Servidor</h2>
                      <p className="text-xs text-gray-500">Todo el código se adapta en tiempo real a tus variables configuradas en este panel.</p>
                    </div>
                  </div>
                  
                  {/* Botón de instrucciones rápidas */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-600 font-medium">
                    <Info size={14} />
                    <span>Listo para usar localmente o en VPS</span>
                  </div>
                </div>

                {/* Explicación de instalación */}
                <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl mb-6">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Pasos para arrancar el bot en tu PC o servidor:</h4>
                  <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Crea una carpeta vacía en tu computadora llamada <code className="bg-gray-200 px-1 py-0.5 rounded text-pink-600 font-mono">iptv-bot</code>.</li>
                    <li>Crea los 4 archivos mostrados abajo copiando sus contenidos.</li>
                    <li>Instala las dependencias ejecutando en tu consola: <code className="bg-gray-200 px-1 py-0.5 rounded text-pink-600 font-mono">npm install</code>.</li>
                    <li>Inicia el bot corriendo el comando: <code className="bg-gray-200 px-1 py-0.5 rounded text-pink-600 font-mono">node index.js</code>.</li>
                    <li>Escanea el código QR que se imprimirá en tu consola con el celular que recibirá las ventas de IPTV.</li>
                  </ol>
                </div>

                {/* Grid de Archivos del Proyecto */}
                <div className="space-y-6">
                  
                  {/* configuracion.js */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <span className="text-xs font-bold font-mono text-gray-700">configuracion.js</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode("configuracion.js", configuracionJsCode)}
                        className="text-xs font-semibold text-[#128C7E] hover:text-[#0b6359] flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white transition cursor-pointer"
                      >
                        {copiedFile === "configuracion.js" ? (
                          <>
                            <Check size={14} className="text-green-600" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copiar Código
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed max-h-[300px]">
                      {configuracionJsCode}
                    </pre>
                  </div>

                  {/* demoManager.js */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold font-mono text-gray-700">demoManager.js</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode("demoManager.js", demoManagerJsCode)}
                        className="text-xs font-semibold text-[#128C7E] hover:text-[#0b6359] flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white transition cursor-pointer"
                      >
                        {copiedFile === "demoManager.js" ? (
                          <>
                            <Check size={14} className="text-green-600" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copiar Código
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed max-h-[300px]">
                      {demoManagerJsCode}
                    </pre>
                  </div>

                  {/* index.js */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="text-xs font-bold font-mono text-gray-700">index.js (Lógica principal Baileys)</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode("index.js", indexJsCode)}
                        className="text-xs font-semibold text-[#128C7E] hover:text-[#0b6359] flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white transition cursor-pointer"
                      >
                        {copiedFile === "index.js" ? (
                          <>
                            <Check size={14} className="text-green-600" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copiar Código
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed max-h-[500px]">
                      {indexJsCode}
                    </pre>
                  </div>

                  {/* package.json */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-xs font-bold font-mono text-gray-700">package.json</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode("package.json", packageJsonCode)}
                        className="text-xs font-semibold text-[#128C7E] hover:text-[#0b6359] flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white transition cursor-pointer"
                      >
                        {copiedFile === "package.json" ? (
                          <>
                            <Check size={14} className="text-green-600" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copiar Código
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed max-h-[250px]">
                      {packageJsonCode}
                    </pre>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
