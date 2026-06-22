const { Events, InteractionType, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const i18n = require('../utils/i18n');
const GuildConfig = require('../utils/models/GuildConfig');

// ─── ROLE NAMES (for display only, IDs come from GuildConfig) ───
const ROLE_NAMES = {
  native: {
    pt: 'Portugues (Portuguese)',
    en: 'English',
    es: 'Espanol (Spanish)',
    ru: 'Russkij (Russian)',
    fr: 'Francais (French)'
  },
  learning: {
    pt: 'Learning Portugues (Portuguese)',
    en: 'Learning English',
    es: 'Learning Espanol (Spanish)',
    ru: 'Learning Russkij (Russian)',
    fr: 'Learning Francais (French)'
  },
  region: {
    europe: 'Europe',
    north_america: 'North America',
    south_america: 'South America',
    eastern_europe: 'Eastern Europe / CIS',
    africa_me: 'Africa & Middle East',
    asia_oceania: 'Asia & Oceania'
  },
  age: {
    '11-13': '11-13 years',
    '14-16': '14-16 years',
    '17-19': '17-19 years',
    '20-22': '20-22 years'
  },
  gender: {
    male: 'Male',
    female: 'Female',
    other: 'Other'
  }
};

// ─── TICKET CONFIG ───
const TICKET_CATEGORY_ID = '1518043327814041640';
const STAFF_ROLE_ID = '1515151599503282227';
const LOGS_CHANNEL_ID = '1515419876859314306';

const TICKET_LABELS = {
  general: 'General Support',
  report: 'Report User',
  language: 'Language Help',
  other: 'Other / Partnership'
};

const TICKET_ABBREV = {
  general: 'gen',
  report: 'rep',
  language: 'lang',
  other: 'oth'
};

// ─── LANGUAGE ROLE TO STAFF ACCESS MAP ───
const LANG_STAFF_ROLES = {
  pt: ['1515151237740498996'],
  en: ['1515151352966156449'],
  es: ['1515151464367128586'],
  ru: ['1515151422721622239'],
  fr: ['1515151532704923739']
};

// ─── TICKET UI TRANSLATIONS ───
const TICKET_UI = {
  pt: {
    title: 'ORBITAL HUB - TICKET ABERTO',
    userInfo: 'Informacao do Utilizador',
    accountAge: 'Conta criada ha',
    accountAgeFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + ' ano' + (y > 1 ? 's' : ''));
      if (m > 0) s.push(m + ' mes' + (m > 1 ? 'es' : ''));
      if (d > 0 || s.length === 0) s.push(d + ' dia' + (d > 1 ? 's' : ''));
      return s.join(', ') + ' (' + days + ' dias)';
    },
    joinedAgo: 'Na comunidade ha',
    joinedAgoFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + 'a');
      if (m > 0) s.push(m + 'm');
      if (d > 0 || s.length === 0) s.push(d + 'd');
      return s.join(' ');
    },
    age: 'Idade',
    gender: 'Genero',
    notSet: 'Nao definido',
    warning: 'Aviso Importante',
    warningText: 'Abrir tickets de brincadeira ou fazer denuncias falsas para incomodar a Staff resultara num Mute ou Kick imediato.',
    desc: (member, reason, langName) =>
      'Bem-vindo ao suporte, ' + member + '!\n\n**Motivo:** ' + TICKET_LABELS[reason] + '\n**Idioma:** ' + langName + '\n\nA Staff sera notificada em breve. Por favor, descreve o teu problema de forma clara.',
    staffMention: (staffList) => '**Staff:** ' + staffList,
    closeBtn: 'Fechar Ticket',
    transcriptBtn: 'Transcript',
    claimBtn: 'Claim',
    unclaimBtn: 'Unclaim',
    notTicket: 'Este comando so funciona dentro de um canal de ticket.',
    closeMsg: 'A fechar ticket e a gerar transcript...',
    transcriptTitle: 'TRANSCRIPT DO TICKET',
    channel: 'Canal',
    closedBy: 'Fechado por',
    date: 'Data',
    messages: 'Mensagens',
    end: 'FIM DO TRANSCRIPT',
    htmlTitle: 'Orbital International - Transcript',
    existing: (ch) => 'Ja tens um ticket aberto: ' + ch,
    errorClose: 'Erro ao fechar o ticket.',
    closeReason: 'Motivo de fecho',
    closeReasonPlaceholder: 'Opcional: motivo do fecho...',
    closeReasonLabel: 'Motivo',
    closeModalTitle: 'Fechar Ticket',
    claimMsg: (user) => user + ' assumiu este ticket.',
    unclaimMsg: (user) => user + ' libertou este ticket.',
    alreadyClaimed: 'Este ticket ja foi assumido por outro membro da Staff.',
    notClaimed: 'Este ticket ainda nao foi assumido.',
    notStaff: 'Apenas Staff pode usar este botao.',
    ticketOpened: (user, reason, langName) =>
      '**Novo Ticket Aberto**\n\n**Utilizador:** ' + user + '\n**Motivo:** ' + TICKET_LABELS[reason] + '\n**Idioma:** ' + langName
  },
  en: {
    title: 'ORBITAL HUB - TICKET OPEN',
    userInfo: 'User Information',
    accountAge: 'Account created',
    accountAgeFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + ' year' + (y > 1 ? 's' : ''));
      if (m > 0) s.push(m + ' month' + (m > 1 ? 's' : ''));
      if (d > 0 || s.length === 0) s.push(d + ' day' + (d > 1 ? 's' : ''));
      return s.join(', ') + ' (' + days + ' days)';
    },
    joinedAgo: 'In community for',
    joinedAgoFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + 'y');
      if (m > 0) s.push(m + 'm');
      if (d > 0 || s.length === 0) s.push(d + 'd');
      return s.join(' ');
    },
    age: 'Age',
    gender: 'Gender',
    notSet: 'Not set',
    warning: 'Important Warning',
    warningText: 'Opening troll tickets or making fake reports to disturb the Staff will result in an immediate Mute or Kick.',
    desc: (member, reason, langName) =>
      'Welcome to support, ' + member + '!\n\n**Reason:** ' + TICKET_LABELS[reason] + '\n**Language:** ' + langName + '\n\nStaff will be notified shortly. Please describe your issue clearly.',
    staffMention: (staffList) => '**Staff:** ' + staffList,
    closeBtn: 'Close Ticket',
    transcriptBtn: 'Transcript',
    claimBtn: 'Claim',
    unclaimBtn: 'Unclaim',
    notTicket: 'This command only works inside a ticket channel.',
    closeMsg: 'Closing ticket and generating transcript...',
    transcriptTitle: 'TICKET TRANSCRIPT',
    channel: 'Channel',
    closedBy: 'Closed by',
    date: 'Date',
    messages: 'Messages',
    end: 'END OF TRANSCRIPT',
    htmlTitle: 'Orbital International - Transcript',
    existing: (ch) => 'You already have an open ticket: ' + ch,
    errorClose: 'Error closing ticket.',
    closeReason: 'Close reason',
    closeReasonPlaceholder: 'Optional: reason for closing...',
    closeReasonLabel: 'Reason',
    closeModalTitle: 'Close Ticket',
    claimMsg: (user) => user + ' claimed this ticket.',
    unclaimMsg: (user) => user + ' unclaimed this ticket.',
    alreadyClaimed: 'This ticket has already been claimed by another Staff member.',
    notClaimed: 'This ticket has not been claimed yet.',
    notStaff: 'Only Staff can use this button.',
    ticketOpened: (user, reason, langName) =>
      '**New Ticket Opened**\n\n**User:** ' + user + '\n**Reason:** ' + TICKET_LABELS[reason] + '\n**Language:** ' + langName
  },
  ru: {
    title: 'ORBITAL HUB - TIKET OTKRYT',
    userInfo: 'Informacija o polzovatele',
    accountAge: 'Akkaunt sozdan',
    accountAgeFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + ' god' + (y > 1 ? (y > 4 ? 'ov' : 'a') : ''));
      if (m > 0) s.push(m + ' mesjac' + (m > 1 ? (m > 4 ? 'ev' : 'a') : ''));
      if (d > 0 || s.length === 0) s.push(d + ' dn' + (d > 1 ? (d > 4 ? 'ej' : 'ja') : 'en'));
      return s.join(', ') + ' (' + days + ' dnej)';
    },
    joinedAgo: 'V soobschestve',
    joinedAgoFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + 'g');
      if (m > 0) s.push(m + 'm');
      if (d > 0 || s.length === 0) s.push(d + 'd');
      return s.join(' ');
    },
    age: 'Vozrast',
    gender: 'Pol',
    notSet: 'Ne ukazano',
    warning: 'Vazhnoe preduprezhdenie',
    warningText: 'Otkrytie troll-tiketov ili lozhnye zhaloby, chtoby bespokoit Staff, privedut k nemedlennomu Mute ili Kick.',
    desc: (member, reason, langName) =>
      'Dobro pozhalovat v podderzhku, ' + member + '!\n\n**Prichina:** ' + TICKET_LABELS[reason] + '\n**Jazyk:** ' + langName + '\n\nStaff skoro budet uvedomlen. Pozhalujsta, opishi svoju problemu chetko.',
    staffMention: (staffList) => '**Staff:** ' + staffList,
    closeBtn: 'Zakryt tiket',
    transcriptBtn: 'Transkript',
    claimBtn: 'Vzjat',
    unclaimBtn: 'Otpustit',
    notTicket: 'Eta komanda rabotaet tolko v kanale tiketa.',
    closeMsg: 'Zakrytie tiketa i generacija transkripta...',
    transcriptTitle: 'TRANSKRIPT TIKETA',
    channel: 'Kanal',
    closedBy: 'Zakryto',
    date: 'Data',
    messages: 'Soobschenija',
    end: 'KONEC TRANSKRIPTA',
    htmlTitle: 'Orbital International - Transkript',
    existing: (ch) => 'U tebja uzhe est otkrytyj tiket: ' + ch,
    errorClose: 'Oshibka pri zakrytii tiketa.',
    closeReason: 'Prichina zakrytija',
    closeReasonPlaceholder: 'Neobjazatelno: prichina zakrytija...',
    closeReasonLabel: 'Prichina',
    closeModalTitle: 'Zakryt tiket',
    claimMsg: (user) => user + ' vzjal etot tiket.',
    unclaimMsg: (user) => user + ' otpustil etot tiket.',
    alreadyClaimed: 'Etot tiket uzhe vzjat drugim chlenom Staff.',
    notClaimed: 'Etot tiket eshche ne vzjat.',
    notStaff: 'Tolko Staff mozhet ispolzovat etu knopku.',
    ticketOpened: (user, reason, langName) =>
      '**Otkryt novyj tiket**\n\n**Polzovatel:** ' + user + '\n**Prichina:** ' + TICKET_LABELS[reason] + '\n**Jazyk:** ' + langName
  },
  es: {
    title: 'ORBITAL HUB - TICKET ABIERTO',
    userInfo: 'Informacion del Usuario',
    accountAge: 'Cuenta creada hace',
    accountAgeFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + ' año' + (y > 1 ? 's' : ''));
      if (m > 0) s.push(m + ' mes' + (m > 1 ? 'es' : ''));
      if (d > 0 || s.length === 0) s.push(d + ' día' + (d > 1 ? 's' : ''));
      return s.join(', ') + ' (' + days + ' días)';
    },
    joinedAgo: 'En la comunidad desde hace',
    joinedAgoFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + 'a');
      if (m > 0) s.push(m + 'm');
      if (d > 0 || s.length === 0) s.push(d + 'd');
      return s.join(' ');
    },
    age: 'Edad',
    gender: 'Genero',
    notSet: 'No definido',
    warning: 'Advertencia Importante',
    warningText: 'Abrir tickets de broma o hacer denuncias falsas para molestar al Staff resultara en un Mute o Kick inmediato.',
    desc: (member, reason, langName) =>
      'Bienvenido al soporte, ' + member + '!\n\n**Motivo:** ' + TICKET_LABELS[reason] + '\n**Idioma:** ' + langName + '\n\nEl Staff sera notificado pronto. Por favor, describe tu problema claramente.',
    staffMention: (staffList) => '**Staff:** ' + staffList,
    closeBtn: 'Cerrar Ticket',
    transcriptBtn: 'Transcripcion',
    claimBtn: 'Reclamar',
    unclaimBtn: 'Liberar',
    notTicket: 'Este comando solo funciona dentro de un canal de ticket.',
    closeMsg: 'Cerrando ticket y generando transcripcion...',
    transcriptTitle: 'TRANSCRIPCION DEL TICKET',
    channel: 'Canal',
    closedBy: 'Cerrado por',
    date: 'Fecha',
    messages: 'Mensajes',
    end: 'FIN DE LA TRANSCRIPCION',
    htmlTitle: 'Orbital International - Transcripcion',
    existing: (ch) => 'Ya tienes un ticket abierto: ' + ch,
    errorClose: 'Error al cerrar el ticket.',
    closeReason: 'Motivo de cierre',
    closeReasonPlaceholder: 'Opcional: motivo del cierre...',
    closeReasonLabel: 'Motivo',
    closeModalTitle: 'Cerrar Ticket',
    claimMsg: (user) => user + ' reclamo este ticket.',
    unclaimMsg: (user) => user + ' libero este ticket.',
    alreadyClaimed: 'Este ticket ya ha sido reclamado por otro miembro del Staff.',
    notClaimed: 'Este ticket aun no ha sido reclamado.',
    notStaff: 'Solo el Staff puede usar este boton.',
    ticketOpened: (user, reason, langName) =>
      '**Nuevo Ticket Abierto**\n\n**Usuario:** ' + user + '\n**Motivo:** ' + TICKET_LABELS[reason] + '\n**Idioma:** ' + langName
  },
  fr: {
    title: 'ORBITAL HUB - TICKET OUVERT',
    userInfo: 'Informations Utilisateur',
    accountAge: 'Compte cree il y a',
    accountAgeFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + ' an' + (y > 1 ? 's' : ''));
      if (m > 0) s.push(m + ' mois');
      if (d > 0 || s.length === 0) s.push(d + ' jour' + (d > 1 ? 's' : ''));
      return s.join(', ') + ' (' + days + ' jours)';
    },
    joinedAgo: 'Dans la communaute depuis',
    joinedAgoFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(y + 'a');
      if (m > 0) s.push(m + 'm');
      if (d > 0 || s.length === 0) s.push(d + 'j');
      return s.join(' ');
    },
    age: 'Age',
    gender: 'Genre',
    notSet: 'Non defini',
    warning: 'Avertissement Important',
    warningText: 'Ouvrir des tickets pour plaisanter ou faire de fausses declarations pour deranger le Staff entrainera un Mute ou Kick immediat.',
    desc: (member, reason, langName) =>
      'Bienvenue au support, ' + member + '!\n\n**Raison:** ' + TICKET_LABELS[reason] + '\n**Langue:** ' + langName + '\n\nLe Staff sera notifie sous peu. Veuillez decrire votre probleme clairement.',
    staffMention: (staffList) => '**Staff:** ' + staffList,
    closeBtn: 'Fermer le Ticket',
    transcriptBtn: 'Transcription',
    claimBtn: 'Prendre',
    unclaimBtn: 'Liberer',
    notTicket: 'Cette commande ne fonctionne que dans un canal de ticket.',
    closeMsg: 'Fermeture du ticket et generation de la transcription...',
    transcriptTitle: 'TRANSCRIPTION DU TICKET',
    channel: 'Canal',
    closedBy: 'Ferme par',
    date: 'Date',
    messages: 'Messages',
    end: 'FIN DE LA TRANSCRIPTION',
    htmlTitle: 'Orbital International - Transcription',
    existing: (ch) => 'Tu as deja un ticket ouvert: ' + ch,
    errorClose: 'Erreur lors de la fermeture du ticket.',
    closeReason: 'Raison de fermeture',
    closeReasonPlaceholder: 'Optionnel: raison de la fermeture...',
    closeReasonLabel: 'Raison',
    closeModalTitle: 'Fermer le Ticket',
    claimMsg: (user) => user + ' a pris ce ticket.',
    unclaimMsg: (user) => user + ' a libere ce ticket.',
    alreadyClaimed: 'Ce ticket a deja ete pris par un autre membre du Staff.',
    notClaimed: 'Ce ticket n'a pas encore ete pris.',
    notStaff: 'Seul le Staff peut utiliser ce bouton.',
    ticketOpened: (user, reason, langName) =>
      '**Nouveau Ticket Ouvert**\n\n**Utilisateur:** ' + user + '\n**Raison:** ' + TICKET_LABELS[reason] + '\n**Langue:** ' + langName
  }
};

// ─── LOG MESSAGES ───
const LOG_MSG = {
  created: (ch, user, reason) => '**Ticket Created**\nChannel: ' + ch + '\nUser: ' + user + '\nReason: ' + reason,
  closed: (ch, user, count, reason) => '**Ticket Closed**\nChannel: ' + ch + '\nClosed by: ' + user + '\nMessages: ' + count + (reason ? '\nReason: ' + reason : ''),
  claimed: (ch, user) => '**Ticket Claimed**\nChannel: ' + ch + '\nBy: ' + user,
  unclaimed: (ch, user) => '**Ticket Unclaimed**\nChannel: ' + ch + '\nBy: ' + user
};

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    if (interaction.type === InteractionType.ApplicationCommand) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Error executing ' + interaction.commandName + ':', error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
          await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral }).catch(() => {});
        }
      }
      return;
    }

    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    const customId = interaction.customId;

    // ─── CONFIGME HANDLERS ───
    if (customId === 'configme_native') {
      return await handleConfigmeNative(interaction, client);
    }
    if (customId === 'configme_learning') {
      return await handleConfigmeLearning(interaction, client);
    }
    if (customId === 'configme_age') {
      return await handleConfigmeAge(interaction, client);
    }
    if (customId === 'configme_region') {
      return await handleConfigmeRegion(interaction, client);
    }
    if (customId === 'configme_gender') {
      return await handleConfigmeGender(interaction, client);
    }

    // ─── ONBOARDING HANDLERS ───
    if (customId.startsWith('onboarding_')) {
      return await handleOnboarding(interaction);
    }

    // ─── VERIFICATION ───
    if (customId === 'verify_member') {
      return await handleVerification(interaction);
    }

    // ─── TICKET CREATE ───
    if (customId === 'ticket_create') {
      return await handleTicketLanguageSelect(interaction, client);
    }
    if (customId.startsWith('ticket_reason_')) {
      return await handleTicketCreate(interaction, client);
    }

    // ─── TICKET BUTTONS ───
    if (customId === 'ticket_close') {
      return await handleTicketCloseModal(interaction, client);
    }
    if (customId === 'ticket_claim') {
      return await handleTicketClaim(interaction, client);
    }
    if (customId === 'ticket_unclaim') {
      return await handleTicketUnclaim(interaction, client);
    }
    if (customId === 'ticket_transcript') {
      return await handleTicketTranscript(interaction, client);
    }

    // ─── MODAL SUBMITS ───
    if (customId === 'close_ticket_modal') {
      return await handleTicketClose(interaction, client);
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Get Role IDs from GuildConfig
// ═══════════════════════════════════════════════════════════════

async function getRoleIds(guildId) {
  const config = await GuildConfig.findOne({ guildId });
  if (!config) return null;

  const roles = {
    native: {},
    learning: {},
    age: {},
    region: {},
    gender: {},
    member: config.roles.member || ''
  };

  // Handle both Map (from Mongoose) and plain object
  const extract = (mapOrObj) => {
    if (!mapOrObj) return {};
    if (mapOrObj instanceof Map || (typeof mapOrObj.entries === 'function')) {
      const obj = {};
      for (const [k, v] of mapOrObj.entries()) obj[k] = v;
      return obj;
    }
    return mapOrObj;
  };

  Object.assign(roles.native, extract(config.roles.native));
  Object.assign(roles.learning, extract(config.roles.learning));
  Object.assign(roles.age, extract(config.roles.age));
  Object.assign(roles.region, extract(config.roles.region));
  Object.assign(roles.gender, extract(config.roles.gender));

  return roles;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGME HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleConfigmeNative(interaction, client) {
  const nativeLang = interaction.values[0];
  const lang = await i18n.getUserLang(interaction.user.id);

  const ROLE_IDS = await getRoleIds(interaction.guild.id);
  if (!ROLE_IDS) {
    return await interaction.reply({
      content: 'Server not configured. Ask an admin to run /setuproles.',
      flags: MessageFlags.Ephemeral
    });
  }

  const nativeRoleId = ROLE_IDS.native[nativeLang];

  if (!client.configmeTemp) client.configmeTemp = new Map();
  client.configmeTemp.set(interaction.user.id, { nativeLanguage: nativeLang });

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (nativeRoleId) await member.roles.add(nativeRoleId);
  } catch (e) {
    console.error('Erro ao atribuir cargo nativo:', e);
  }

  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('configme_learning')
      .setPlaceholder(i18n.get(lang, 'configme.learning_placeholder'))
      .addOptions([
        { label: 'Portugues (Portuguese)', value: 'pt', description: 'Portugues', emoji: { name: '🇵🇹' } },
        { label: 'English', value: 'en', description: 'English', emoji: { name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
        { label: 'Russkij (Russian)', value: 'ru', description: 'Russkij', emoji: { name: '🇷🇺' } },
        { label: 'Espanol (Spanish)', value: 'es', description: 'Espanol', emoji: { name: '🇪🇸' } },
        { label: 'Francais (French)', value: 'fr', description: 'Francais', emoji: { name: '🇫🇷' } }
      ])
  );

  await interaction.update({
    content: i18n.get(lang, 'configme.step2'),
    components: [menu]
  });
}

async function handleConfigmeLearning(interaction, client) {
  const learningLang = interaction.values[0];
  const lang = await i18n.getUserLang(interaction.user.id);

  const ROLE_IDS = await getRoleIds(interaction.guild.id);
  if (!ROLE_IDS) {
    return await interaction.reply({
      content: 'Server not configured. Ask an admin to run /setuproles.',
      flags: MessageFlags.Ephemeral
    });
  }

  const learningRoleId = ROLE_IDS.learning[learningLang];

  const temp = client.configmeTemp?.get(interaction.user.id) || {};
  temp.learningLanguage = learningLang;
  client.configmeTemp.set(interaction.user.id, temp);

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (learningRoleId) await member.roles.add(learningRoleId);
  } catch (e) {
    console.error('Erro ao atribuir cargo learning:', e);
  }

  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('configme_age')
      .setPlaceholder(i18n.get(lang, 'configme.age_placeholder'))
      .addOptions([
        { label: '11-13 years', value: '11-13', description: '11-13 years old', emoji: { name: '🟢' } },
        { label: '14-16 years', value: '14-16', description: '14-16 years old', emoji: { name: '🟡' } },
        { label: '17-19 years', value: '17-19', description: '17-19 years old', emoji: { name: '🔵' } },
        { label: '20-22 years', value: '20-22', description: '20-22 years old', emoji: { name: '🟣' } }
      ])
  );

  await interaction.update({
    content: i18n.get(lang, 'configme.step3'),
    components: [menu]
  });
}

async function handleConfigmeAge(interaction, client) {
  const ageValue = interaction.values[0];
  const lang = await i18n.getUserLang(interaction.user.id);

  const ROLE_IDS = await getRoleIds(interaction.guild.id);
  if (!ROLE_IDS) {
    return await interaction.reply({
      content: 'Server not configured. Ask an admin to run /setuproles.',
      flags: MessageFlags.Ephemeral
    });
  }

  const ageRoleId = ROLE_IDS.age[ageValue];

  const temp = client.configmeTemp?.get(interaction.user.id) || {};
  temp.age = ageValue;
  client.configmeTemp.set(interaction.user.id, temp);

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (ageRoleId) await member.roles.add(ageRoleId);
  } catch (e) {
    console.error('Erro ao atribuir cargo age:', e);
  }

  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('configme_region')
      .setPlaceholder(i18n.get(lang, 'configme.region_placeholder'))
      .addOptions([
        { label: 'Europe', value: 'europe', description: 'Europe', emoji: { name: '🇪🇺' } },
        { label: 'North America', value: 'north_america', description: 'North America', emoji: { name: '🌎' } },
        { label: 'South America', value: 'south_america', description: 'South America', emoji: { name: '🌎' } },
        { label: 'Eastern Europe / CIS', value: 'eastern_europe', description: 'Eastern Europe / CIS', emoji: { name: '🇷🇺' } },
        { label: 'Africa & Middle East', value: 'africa_me', description: 'Africa & Middle East', emoji: { name: '🌍' } },
        { label: 'Asia & Oceania', value: 'asia_oceania', description: 'Asia & Oceania', emoji: { name: '🌏' } }
      ])
  );

  await interaction.update({
    content: i18n.get(lang, 'configme.step4'),
    components: [menu]
  });
}

async function handleConfigmeRegion(interaction, client) {
  const regionValue = interaction.values[0];
  const lang = await i18n.getUserLang(interaction.user.id);

  const ROLE_IDS = await getRoleIds(interaction.guild.id);
  if (!ROLE_IDS) {
    return await interaction.reply({
      content: 'Server not configured. Ask an admin to run /setuproles.',
      flags: MessageFlags.Ephemeral
    });
  }

  const regionRoleId = ROLE_IDS.region[regionValue];

  const temp = client.configmeTemp?.get(interaction.user.id) || {};
  temp.region = regionValue;
  client.configmeTemp.set(interaction.user.id, temp);

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (regionRoleId) await member.roles.add(regionRoleId);
  } catch (e) {
    console.error('Erro ao atribuir cargo region:', e);
  }

  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('configme_gender')
      .setPlaceholder(i18n.get(lang, 'configme.gender_placeholder'))
      .addOptions([
        { label: 'Male', value: 'male', description: 'Male', emoji: { name: '♂️' } },
        { label: 'Female', value: 'female', description: 'Female', emoji: { name: '♀️' } },
        { label: 'Other', value: 'other', description: 'Other', emoji: { name: '⚧' } }
      ])
  );

  await interaction.update({
    content: i18n.get(lang, 'configme.step5'),
    components: [menu]
  });
}

async function handleConfigmeGender(interaction, client) {
  const genderValue = interaction.values[0];
  const lang = await i18n.getUserLang(interaction.user.id);

  const ROLE_IDS = await getRoleIds(interaction.guild.id);
  if (!ROLE_IDS) {
    return await interaction.reply({
      content: 'Server not configured. Ask an admin to run /setuproles.',
      flags: MessageFlags.Ephemeral
    });
  }

  const genderRoleId = ROLE_IDS.gender[genderValue];

  const temp = client.configmeTemp?.get(interaction.user.id) || {};
  temp.gender = genderValue;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (genderRoleId) await member.roles.add(genderRoleId);
    if (ROLE_IDS.member) await member.roles.add(ROLE_IDS.member);
  } catch (e) {
    console.error('Erro ao atribuir cargos finais:', e);
  }

  try {
    const UserProfile = require('../utils/models/UserProfile');
    await UserProfile.findOneAndUpdate(
      { userId: interaction.user.id },
      {
        userId: interaction.user.id,
        nativeLanguage: temp.nativeLanguage,
        learningLanguage: temp.learningLanguage,
        age: temp.age,
        region: temp.region,
        gender: temp.gender,
        level: 1,
        xp: 0,
        messagesSent: 0,
        voiceMinutes: 0
      },
      { upsert: true, new: true }
    );
  } catch (e) {
    console.error('Erro ao guardar perfil:', e);
  }

  client.configmeTemp.delete(interaction.user.id);

  const embed = new EmbedBuilder()
    .setTitle(i18n.get(lang, 'configme.welcome_title'))
    .setDescription(i18n.get(lang, 'configme.welcome_desc'))
    .setColor(0x57F287)
    .addFields(
      { name: i18n.get(lang, 'mystats.native'), value: (temp.nativeLanguage || 'EN').toUpperCase(), inline: true },
      { name: i18n.get(lang, 'mystats.learning'), value: (temp.learningLanguage || 'PT').toUpperCase(), inline: true },
      { name: i18n.get(lang, 'mystats.age') || 'Age', value: temp.age || '?', inline: true }
    );

  await interaction.update({
    content: i18n.get(lang, 'configme.completed'),
    components: [],
    embeds: [embed]
  });
}

// ═══════════════════════════════════════════════════════════════
// ONBOARDING HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleOnboarding(interaction) {
  const member = interaction.member;
  const type = interaction.customId.replace('onboarding_', '');
  const selected = interaction.values;

  const ROLE_IDS = await getRoleIds(interaction.guild.id);
  if (!ROLE_IDS) {
    return await interaction.reply({
      content: 'Server not configured. Ask an admin to run /setuproles.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (type === 'age') {
    const hasAgeRole = Object.values(ROLE_IDS.age).some(id => member.roles.cache.has(id));
    if (hasAgeRole) {
      return interaction.reply({
        content: 'This option is not available at the moment. Please try again later.',
        flags: MessageFlags.Ephemeral
      });
    }
  }

  if (type === 'gender') {
    const hasGenderRole = Object.values(ROLE_IDS.gender).some(id => member.roles.cache.has(id));
    if (hasGenderRole) {
      return interaction.reply({
        content: 'This option is not available at the moment. Please try again later.',
        flags: MessageFlags.Ephemeral
      });
    }
  }

  const roleMap = ROLE_IDS[type === 'speak' ? 'native' : type === 'learn' ? 'learning' : type];
  const nameMap = ROLE_NAMES[type === 'speak' ? 'native' : type === 'learn' ? 'learning' : type];

  if (!roleMap) return;

  const allCategoryRoleIds = Object.values(roleMap);
  const rolesToRemove = member.roles.cache.filter(r => allCategoryRoleIds.includes(r.id));
  if (rolesToRemove.size > 0) {
    await member.roles.remove(rolesToRemove).catch(() => {});
  }

  const added = [];
  for (const val of selected) {
    const roleId = roleMap[val];
    if (roleId) {
      await member.roles.add(roleId).catch(() => {});
      added.push(nameMap[val] || val);
    }
  }

  let emoji = '';
  if (type === 'speak') emoji = '🗣️ ';
  if (type === 'learn') emoji = '📚 ';
  if (type === 'region') emoji = '🌍 ';
  if (type === 'age') emoji = '🎂 ';
  if (type === 'gender') emoji = '⚧️ ';

  const label = type === 'speak' ? 'Languages you speak' :
                type === 'learn' ? 'Languages you want to learn' :
                type === 'region' ? 'Region' :
                type === 'gender' ? 'Gender' : 'Age';

  await interaction.reply({
    content: emoji + '**' + label + '** updated:
' + added.map(a => '• ' + a).join('\n'),
    flags: MessageFlags.Ephemeral
  });
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleVerification(interaction) {
  const ROLE_IDS = await getRoleIds(interaction.guild.id);
  if (!ROLE_IDS) {
    return await interaction.reply({
      content: 'Server not configured. Please contact a Staff member.',
      flags: MessageFlags.Ephemeral
    });
  }

  const memberRoleId = ROLE_IDS.member;

  const memberRole = interaction.guild.roles.cache.get(memberRoleId);
  if (!memberRole) {
    return await interaction.reply({
      content: 'Member role not found. Please contact a Staff member.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (interaction.member.roles.cache.has(memberRoleId)) {
    return await interaction.reply({
      content: 'You have already accepted the rules.',
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.member.roles.add(memberRoleId);
  await interaction.reply({
    content: 'Welcome aboard, Orbiter! Rules accepted.',
    flags: MessageFlags.Ephemeral
  });
}

// ═══════════════════════════════════════════════════════════════
// TICKET HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleTicketLanguageSelect(interaction, client) {
  const lang = await i18n.getUserLang(interaction.user.id);

  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('ticket_reason_select')
      .setPlaceholder('Select ticket reason')
      .addOptions([
        { label: 'General Support', value: 'general', emoji: '👤' },
        { label: 'Report User', value: 'report', emoji: '🛡️' },
        { label: 'Language Help', value: 'language', emoji: '🌍' },
        { label: 'Other / Partnership', value: 'other', emoji: '🛸' }
      ])
  );

  await interaction.reply({
    content: 'Please select the reason for your ticket:',
    components: [menu],
    flags: MessageFlags.Ephemeral
  });
}

async function handleTicketCreate(interaction, client) {
  const reason = interaction.values[0];
  const lang = await i18n.getUserLang(interaction.user.id);
  const t = TICKET_UI[lang] || TICKET_UI.en;
  const member = interaction.member;

  const existingTicket = interaction.guild.channels.cache.find(
    ch => ch.type === ChannelType.GuildText && ch.name.startsWith('ticket-' + interaction.user.id)
  );

  if (existingTicket) {
    return await interaction.reply({
      content: t.existing(existingTicket.toString()),
      flags: MessageFlags.Ephemeral
    });
  }

  const langRole = member.roles.cache.find(r =>
    Object.values(LANG_STAFF_ROLES).flat().includes(r.id)
  );
  const userLang = langRole ? Object.keys(LANG_STAFF_ROLES).find(k => LANG_STAFF_ROLES[k].includes(langRole.id)) || 'en' : 'en';
  const langName = ROLE_NAMES.native[userLang] || userLang.toUpperCase();

  const staffMentions = (LANG_STAFF_ROLES[userLang] || [STAFF_ROLE_ID])
    .map(id => '<@&' + id + '>')
    .join(' ');

  const abbrev = TICKET_ABBREV[reason] || 'oth';
  const ticketName = 'ticket-' + interaction.user.id + '-' + abbrev;

  const channel = await interaction.guild.channels.create({
    name: ticketName,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] }
    ]
  });

  const accountAgeDays = Math.floor((Date.now() - interaction.user.createdTimestamp) / 86400000);
  const joinedDays = member.joinedTimestamp ? Math.floor((Date.now() - member.joinedTimestamp) / 86400000) : 0;

  const UserProfile = require('../utils/models/UserProfile');
  const profile = await UserProfile.findOne({ userId: interaction.user.id });

  const embed = new EmbedBuilder()
    .setTitle(t.title)
    .setDescription(t.desc(member.toString(), reason, langName))
    .setColor(0x5865F2)
    .addFields(
      { name: t.userInfo, value:
        '**' + t.accountAge + ':** ' + t.accountAgeFmt(accountAgeDays) + '\n' +
        '**' + t.joinedAgo + ':** ' + t.joinedAgoFmt(joinedDays) + '\n' +
        '**' + t.age + ':** ' + (profile?.age || t.notSet) + '\n' +
        '**' + t.gender + ':** ' + (profile?.gender || t.notSet),
        inline: false },
      { name: t.warning, value: t.warningText, inline: false }
    )
    .setFooter({ text: 'ID: ' + interaction.user.id })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel(t.closeBtn).setStyle(ButtonStyle.Danger).setEmoji('🔒'),
    new ButtonBuilder().setCustomId('ticket_transcript').setLabel(t.transcriptBtn).setStyle(ButtonStyle.Secondary).setEmoji('📄'),
    new ButtonBuilder().setCustomId('ticket_claim').setLabel(t.claimBtn).setStyle(ButtonStyle.Primary).setEmoji('✋')
  );

  await channel.send({
    content: t.staffMention(staffMentions),
    embeds: [embed],
    components: [row]
  });

  await interaction.update({
    content: 'Ticket created: ' + channel.toString(),
    components: [],
    flags: MessageFlags.Ephemeral
  });

  // Log
  const logsChannel = interaction.guild.channels.cache.get(LOGS_CHANNEL_ID);
  if (logsChannel) {
    await logsChannel.send(LOG_MSG.created(channel.toString(), member.toString(), TICKET_LABELS[reason]));
  }
}

async function handleTicketCloseModal(interaction, client) {
  const modal = new ModalBuilder()
    .setCustomId('close_ticket_modal')
    .setTitle('Close Ticket');

  const input = new TextInputBuilder()
    .setCustomId('close_reason')
    .setLabel('Reason (optional)')
    .setPlaceholder('Optional: reason for closing...')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(500);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function handleTicketClose(interaction, client) {
  const lang = await i18n.getUserLang(interaction.user.id);
  const t = TICKET_UI[lang] || TICKET_UI.en;
  const channel = interaction.channel;

  if (!channel.name.startsWith('ticket-')) {
    return await interaction.reply({ content: t.notTicket, flags: MessageFlags.Ephemeral });
  }

  const reason = interaction.fields.getTextInputValue('close_reason') || '';

  await interaction.reply({ content: t.closeMsg });

  // Generate transcript
  const messages = [];
  let lastId;
  while (true) {
    const fetched = await channel.messages.fetch({ limit: 100, before: lastId });
    if (fetched.size === 0) break;
    messages.push(...fetched.values());
    lastId = fetched.last().id;
  }
  messages.reverse();

  const transcriptLines = messages.map(m => {
    const time = m.createdAt.toISOString();
    const content = m.content || '[embed/attachment]';
    return '[' + time + '] ' + m.author.tag + ': ' + content;
  }).join('\n');

  const transcriptText = '=== ' + t.transcriptTitle + ' ===\n' +
    'Channel: ' + channel.name + '\n' +
    'Closed by: ' + interaction.user.tag + '\n' +
    'Date: ' + new Date().toISOString() + '\n' +
    'Messages: ' + messages.length + '\n' +
    (reason ? 'Reason: ' + reason + '\n' : '') +
    '============================\n\n' + transcriptLines + '\n\n=== ' + t.end + ' ===';

  const buffer = Buffer.from(transcriptText, 'utf-8');
  const attachment = new AttachmentBuilder(buffer, { name: 'transcript-' + channel.name + '.txt' });

  const logsChannel = interaction.guild.channels.cache.get(LOGS_CHANNEL_ID);
  if (logsChannel) {
    await logsChannel.send({
      content: LOG_MSG.closed(channel.toString(), interaction.user.toString(), messages.length, reason),
      files: [attachment]
    });
  }

  setTimeout(() => channel.delete().catch(() => {}), 3000);
}

async function handleTicketClaim(interaction, client) {
  const lang = await i18n.getUserLang(interaction.user.id);
  const t = TICKET_UI[lang] || TICKET_UI.en;
  const channel = interaction.channel;

  if (!channel.name.startsWith('ticket-')) {
    return await interaction.reply({ content: t.notTicket, flags: MessageFlags.Ephemeral });
  }

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return await interaction.reply({ content: t.notStaff, flags: MessageFlags.Ephemeral });
  }

  const topic = channel.topic || '';
  if (topic.includes('Claimed by:') && !topic.includes(interaction.user.id)) {
    return await interaction.reply({ content: t.alreadyClaimed, flags: MessageFlags.Ephemeral });
  }

  await channel.setTopic('Claimed by: ' + interaction.user.id);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel(t.closeBtn).setStyle(ButtonStyle.Danger).setEmoji('🔒'),
    new ButtonBuilder().setCustomId('ticket_transcript').setLabel(t.transcriptBtn).setStyle(ButtonStyle.Secondary).setEmoji('📄'),
    new ButtonBuilder().setCustomId('ticket_unclaim').setLabel(t.unclaimBtn).setStyle(ButtonStyle.Primary).setEmoji('🔓')
  );

  await interaction.update({ components: [row] });
  await channel.send(t.claimMsg(interaction.user.toString()));

  const logsChannel = interaction.guild.channels.cache.get(LOGS_CHANNEL_ID);
  if (logsChannel) {
    await logsChannel.send(LOG_MSG.claimed(channel.toString(), interaction.user.toString()));
  }
}

async function handleTicketUnclaim(interaction, client) {
  const lang = await i18n.getUserLang(interaction.user.id);
  const t = TICKET_UI[lang] || TICKET_UI.en;
  const channel = interaction.channel;

  if (!channel.name.startsWith('ticket-')) {
    return await interaction.reply({ content: t.notTicket, flags: MessageFlags.Ephemeral });
  }

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return await interaction.reply({ content: t.notStaff, flags: MessageFlags.Ephemeral });
  }

  const topic = channel.topic || '';
  if (!topic.includes(interaction.user.id)) {
    return await interaction.reply({ content: t.notClaimed, flags: MessageFlags.Ephemeral });
  }

  await channel.setTopic('');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel(t.closeBtn).setStyle(ButtonStyle.Danger).setEmoji('🔒'),
    new ButtonBuilder().setCustomId('ticket_transcript').setLabel(t.transcriptBtn).setStyle(ButtonStyle.Secondary).setEmoji('📄'),
    new ButtonBuilder().setCustomId('ticket_claim').setLabel(t.claimBtn).setStyle(ButtonStyle.Primary).setEmoji('✋')
  );

  await interaction.update({ components: [row] });
  await channel.send(t.unclaimMsg(interaction.user.toString()));

  const logsChannel = interaction.guild.channels.cache.get(LOGS_CHANNEL_ID);
  if (logsChannel) {
    await logsChannel.send(LOG_MSG.unclaimed(channel.toString(), interaction.user.toString()));
  }
}

async function handleTicketTranscript(interaction, client) {
  const lang = await i18n.getUserLang(interaction.user.id);
  const t = TICKET_UI[lang] || TICKET_UI.en;
  const channel = interaction.channel;

  if (!channel.name.startsWith('ticket-')) {
    return await interaction.reply({ content: t.notTicket, flags: MessageFlags.Ephemeral });
  }

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
    return await interaction.reply({ content: t.notStaff, flags: MessageFlags.Ephemeral });
  }

  const messages = [];
  let lastId;
  while (true) {
    const fetched = await channel.messages.fetch({ limit: 100, before: lastId });
    if (fetched.size === 0) break;
    messages.push(...fetched.values());
    lastId = fetched.last().id;
  }
  messages.reverse();

  const transcriptLines = messages.map(m => {
    const time = m.createdAt.toISOString();
    const content = m.content || '[embed/attachment]';
    return '[' + time + '] ' + m.author.tag + ': ' + content;
  }).join('\n');

  const transcriptText = '=== ' + t.transcriptTitle + ' ===\n' +
    'Channel: ' + channel.name + '\n' +
    'Generated by: ' + interaction.user.tag + '\n' +
    'Date: ' + new Date().toISOString() + '\n' +
    'Messages: ' + messages.length + '\n' +
    '============================\n\n' + transcriptLines + '\n\n=== ' + t.end + ' ===';

  const buffer = Buffer.from(transcriptText, 'utf-8');
  const attachment = new AttachmentBuilder(buffer, { name: 'transcript-' + channel.name + '.txt' });

  await interaction.reply({
    content: 'Here is the transcript:',
    files: [attachment],
    flags: MessageFlags.Ephemeral
  });
}
