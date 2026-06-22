const { Events, InteractionType, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const i18n = require('../utils/i18n');

// ─── ROLE IDs ───
const ROLE_IDS = {
  native: {
    pt: '1515151237740498996',
    en: '1515151352966156449',
    es: '1515151464367128586',
    ru: '1515151422721622239',
    fr: '1515151532704923739'
  },
  learning: {
    pt: '1517689052990541824',
    en: '1517690503024349354',
    es: '1517689212990656542',
    ru: '1517689430846996550',
    fr: '1517689522714841120'
  },
  age: {
    '11-13': '1515739553804189826',
    '14-16': '1515739597064376441',
    '17-19': '1515739642937479308',
    '20-22': '1517699843928228112'
  },
  region: {
    europe: '1515739900929118278',
    north_america: '1515740225123389500',
    south_america: '1515740107985125560',
    eastern_europe: '1515741344117559467',
    africa_me: '1515740271835349022',
    asia_oceania: '1515740516338241679'
  },
  gender: {
    male: '1517998164400013373',
    female: '1517998323498487838',
    other: '1517998404133982268'
  },
  member: '1515151179019980931'
};

const ROLE_NAMES = {
  native: {
    pt: 'Português (Portuguese)',
    en: 'English',
    es: 'Español (Spanish)',
    ru: 'Русский (Russian)',
    fr: 'Français (French)'
  },
  learning: {
    pt: 'Learning Português (Portuguese)',
    en: 'Learning English',
    es: 'Learning Español (Spanish)',
    ru: 'Learning Русский (Russian)',
    fr: 'Learning Français (French)'
  },
  region: {
    europe: 'Europe 🌍',
    north_america: 'North America 🌎',
    south_america: 'South America 🌎',
    eastern_europe: 'Eastern Europe / CIS 🌍',
    africa_me: 'Africa & Middle East 🌍',
    asia_oceania: 'Asia & Oceania 🌏'
  },
  age: {
    '11-13': '11-13 years',
    '14-16': '14-16 years',
    '17-19': '17-19 years',
    '20-22': '20-22 years'
  },
  gender: {
    male: 'Male 🟦',
    female: 'Female 🟥',
    other: 'Other 🟪'
  }
};

// ─── TICKET CONFIG ───
const TICKET_CATEGORY_ID = '1518043327814041640';
const STAFF_ROLE_ID = '1515151599503282227';
const LOGS_CHANNEL_ID = '1515419876859314306';

const TICKET_LABELS = {
  general: '👤 General Support',
  report: '🛡️ Report User',
  language: '🌍 Language Help',
  other: '🛸 Other / Partnership'
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
    title: '🌌 ORBITAL HUB • TICKET ABERTO',
    userInfo: '👤 Informação do Utilizador',
    accountAge: 'Conta criada há',
    accountAgeFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(`${y} ano${y > 1 ? 's' : ''}`);
      if (m > 0) s.push(`${m} mês${m > 1 ? 'es' : ''}`);
      if (d > 0 || s.length === 0) s.push(`${d} dia${d > 1 ? 's' : ''}`);
      return `${s.join(', ')} (${days} dias)`;
    },
    joinedAgo: 'Na comunidade há',
    joinedAgoFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(`${y}a`);
      if (m > 0) s.push(`${m}m`);
      if (d > 0 || s.length === 0) s.push(`${d}d`);
      return s.join(' ');
    },
    age: 'Idade',
    gender: 'Género',
    notSet: 'Não definido',
    warning: '⚠️ Aviso Importante',
    warningText: 'Abrir tickets de brincadeira ou fazer denúncias falsas para incomodar a Staff resultará num **Mute ou Kick imediato**.',
    desc: (member, reason, langName) => `Olá ${member}, o teu ticket foi criado.\n\n**Motivo:** ${TICKET_LABELS[reason]}\n**Idioma:** ${langName}\n**Utilizador:** ${member.user.tag}\n**ID:** ${member.id}\n\nPor favor descreve o teu problema em detalhe. Um membro da Staff irá ajudar-te brevemente.`,
    closeBtn: '🔒 Fechar Ticket',
    claimBtn: '✋ Assumir Ticket',
    created: (channel, langName) => `✅ O teu ticket foi criado: ${channel}\n**Idioma:** ${langName}`,
    existing: (channel) => `⚠️ Já tens um ticket aberto: ${channel}`,
    fail: '❌ Falha ao criar ticket. Contacta um membro da Staff.',
    closeMsg: '🔒 A gerar transcript e a fechar ticket...',
    notTicket: '❌ Este não é um canal de ticket.',
    transcriptTitle: '  ORBITAL INTERNATIONAL - TICKET TRANSCRIPT',
    channel: 'Canal',
    closedBy: 'Fechado por',
    date: 'Data',
    messages: 'Mensagens',
    end: 'Fim do transcript',
    errorClose: '❌ Erro ao gerar transcript. A fechar ticket mesmo assim...',
    htmlTitle: 'Ticket Transcript',
    closeReasonModal: 'Razão de Fecho',
    closeReasonPlaceholder: 'Descreve brevemente o que foi resolvido...',
    closeReasonLabel: 'Razão do fecho',
    claimMsg: (staff, opener) => `🟡 **Ticket assumido por ${staff}** — a ajudar ${opener} agora.`
  },
  en: {
    title: '🌌 ORBITAL HUB • TICKET OPENED',
    userInfo: '👤 User Information',
    accountAge: 'Account created',
    accountAgeFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(`${y} year${y > 1 ? 's' : ''}`);
      if (m > 0) s.push(`${m} month${m > 1 ? 's' : ''}`);
      if (d > 0 || s.length === 0) s.push(`${d} day${d > 1 ? 's' : ''}`);
      return `${s.join(', ')} (${days} days)`;
    },
    joinedAgo: 'In community for',
    joinedAgoFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(`${y}y`);
      if (m > 0) s.push(`${m}m`);
      if (d > 0 || s.length === 0) s.push(`${d}d`);
      return s.join(' ');
    },
    age: 'Age',
    gender: 'Gender',
    notSet: 'Not set',
    warning: '⚠️ Important Notice',
    warningText: 'Opening troll tickets or making fake reports to disturb the Staff will lead to an **immediate Mute or Kick**.',
    desc: (member, reason, langName) => `Hello ${member}, your ticket has been created.\n\n**Reason:** ${TICKET_LABELS[reason]}\n**Language:** ${langName}\n**User:** ${member.user.tag}\n**ID:** ${member.id}\n\nPlease describe your issue in detail. A Staff member will assist you shortly.`,
    closeBtn: '🔒 Close Ticket',
    claimBtn: '✋ Claim Ticket',
    created: (channel, langName) => `✅ Your ticket has been created: ${channel}\n**Language:** ${langName}`,
    existing: (channel) => `⚠️ You already have an open ticket: ${channel}`,
    fail: '❌ Failed to create ticket. Please contact a Staff member.',
    closeMsg: '🔒 Generating transcript and closing ticket...',
    notTicket: '❌ This is not a ticket channel.',
    transcriptTitle: '  ORBITAL INTERNATIONAL - TICKET TRANSCRIPT',
    channel: 'Channel',
    closedBy: 'Closed by',
    date: 'Date',
    messages: 'Messages',
    end: 'End of transcript',
    errorClose: '❌ Error generating transcript. Closing ticket anyway...',
    htmlTitle: 'Ticket Transcript',
    closeReasonModal: 'Close Reason',
    closeReasonPlaceholder: 'Briefly describe what was resolved...',
    closeReasonLabel: 'Reason for closing',
    claimMsg: (staff, opener) => `🟡 **Ticket claimed by ${staff}** — assisting ${opener} now.`
  },
  ru: {
    title: '🌌 ORBITAL HUB • ТИКЕТ ОТКРЫТ',
    userInfo: '👤 Информация о пользователе',
    accountAge: 'Аккаунт создан',
    accountAgeFmt: (days) => `${Math.floor(days / 365)} лет, ${Math.floor((days % 365) / 30)} мес (${days} дн)`,
    joinedAgo: 'В сообществе',
    joinedAgoFmt: (days) => `${Math.floor(days / 365)}г ${Math.floor((days % 365) / 30)}м ${days % 30}д`,
    age: 'Возраст',
    gender: 'Пол',
    notSet: 'Не указано',
    warning: '⚠️ Важное предупреждение',
    warningText: 'Открытие тролль-тикетов или ложные жалобы приведут к немедленному **Mute или Kick**.',
    desc: (member, reason, langName) => `Привет ${member}, твой тикет создан.\n\n**Причина:** ${TICKET_LABELS[reason]}\n**Язык:** ${langName}\n**Пользователь:** ${member.user.tag}\n**ID:** ${member.id}\n\nПожалуйста, опиши свою проблему подробно. Сотрудник скоро тебе поможет.`,
    closeBtn: '🔒 Закрыть тикет',
    claimBtn: '✋ Взять тикет',
    created: (channel, langName) => `✅ Твой тикет создан: ${channel}\n**Язык:** ${langName}`,
    existing: (channel) => `⚠️ У тебя уже есть открытый тикет: ${channel}`,
    fail: '❌ Не удалось создать тикет. Свяжись с сотрудником.',
    closeMsg: '🔒 Генерация transcript и закрытие тикета...',
    notTicket: '❌ Это не канал тикета.',
    transcriptTitle: '  ORBITAL INTERNATIONAL - TICKET TRANSCRIPT',
    channel: 'Канал',
    closedBy: 'Закрыл',
    date: 'Дата',
    messages: 'Сообщений',
    end: 'Конец transcript',
    errorClose: '❌ Ошибка при генерации transcript. Закрываю тикет...',
    htmlTitle: 'Ticket Transcript',
    closeReasonModal: 'Причина закрытия',
    closeReasonPlaceholder: 'Кратко опиши, что было решено...',
    closeReasonLabel: 'Причина закрытия',
    claimMsg: (staff, opener) => `🟡 **Тикет взят ${staff}** — помогает ${opener}.`
  },
  es: {
    title: '🌌 ORBITAL HUB • TICKET ABIERTO',
    userInfo: '👤 Información del Usuario',
    accountAge: 'Cuenta creada hace',
    accountAgeFmt: (days) => `${Math.floor(days / 365)}a, ${Math.floor((days % 365) / 30)}m (${days}d)`,
    joinedAgo: 'En la comunidad hace',
    joinedAgoFmt: (days) => `${Math.floor(days / 365)}a ${Math.floor((days % 365) / 30)}m ${days % 30}d`,
    age: 'Edad',
    gender: 'Género',
    notSet: 'No definido',
    warning: '⚠️ Aviso Importante',
    warningText: 'Abrir tickets de broma o hacer denuncias falsas resultará en un **Mute o Kick inmediato**.',
    desc: (member, reason, langName) => `Hola ${member}, tu ticket ha sido creado.\n\n**Motivo:** ${TICKET_LABELS[reason]}\n**Idioma:** ${langName}\n**Usuario:** ${member.user.tag}\n**ID:** ${member.id}\n\nPor favor describe tu problema en detalle. Un miembro del Staff te ayudará pronto.`,
    closeBtn: '🔒 Cerrar Ticket',
    claimBtn: '✋ Asumir Ticket',
    created: (channel, langName) => `✅ Tu ticket ha sido creado: ${channel}\n**Idioma:** ${langName}`,
    existing: (channel) => `⚠️ Ya tienes un ticket abierto: ${channel}`,
    fail: '❌ Error al crear el ticket. Contacta con un miembro del Staff.',
    closeMsg: '🔒 Generando transcript y cerrando ticket...',
    notTicket: '❌ Este no es un canal de ticket.',
    transcriptTitle: '  ORBITAL INTERNATIONAL - TICKET TRANSCRIPT',
    channel: 'Canal',
    closedBy: 'Cerrado por',
    date: 'Fecha',
    messages: 'Mensajes',
    end: 'Fin del transcript',
    errorClose: '❌ Error al generar transcript. Cerrando ticket de todos modos...',
    htmlTitle: 'Ticket Transcript',
    closeReasonModal: 'Razón de Cierre',
    closeReasonPlaceholder: 'Describe brevemente qué se resolvió...',
    closeReasonLabel: 'Razón del cierre',
    claimMsg: (staff, opener) => `🟡 **Ticket asumido por ${staff}** — ayudando a ${opener} ahora.`
  },
  fr: {
    title: '🌌 ORBITAL HUB • TICKET OUVERT',
    userInfo: '👤 Informations Utilisateur',
    accountAge: 'Compte créé il y a',
    accountAgeFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(`${y} an${y > 1 ? 's' : ''}`);
      if (m > 0) s.push(`${m} mois`);
      if (d > 0 || s.length === 0) s.push(`${d} jour${d > 1 ? 's' : ''}`);
      return `${s.join(', ')} (${days} jours)`;
    },
    joinedAgo: 'Dans la communauté depuis',
    joinedAgoFmt: (days) => {
      const y = Math.floor(days / 365);
      const m = Math.floor((days % 365) / 30);
      const d = days % 30;
      let s = [];
      if (y > 0) s.push(`${y}a`);
      if (m > 0) s.push(`${m}m`);
      if (d > 0 || s.length === 0) s.push(`${d}j`);
      return s.join(' ');
    },
    age: 'Âge',
    gender: 'Genre',
    notSet: 'Non défini',
    warning: '⚠️ Avis Important',
    warningText: 'Ouvrir des tickets pour troller ou faire de fausses plaintes entraînera un **Mute ou Kick immédiat**.',
    desc: (member, reason, langName) => `Bonjour ${member}, ton ticket a été créé.\n\n**Raison:** ${TICKET_LABELS[reason]}\n**Langue:** ${langName}\n**Utilisateur:** ${member.user.tag}\n**ID:** ${member.id}\n\nMerci de décrire ton problème en détail. Un membre du Staff t'assistera sous peu.`,
    closeBtn: '🔒 Fermer le Ticket',
    claimBtn: '✋ Prendre le Ticket',
    created: (channel, langName) => `✅ Ton ticket a été créé : ${channel}\n**Langue :** ${langName}`,
    existing: (channel) => `⚠️ Tu as déjà un ticket ouvert : ${channel}`,
    fail: '❌ Échec de la création du ticket. Contacte un membre du Staff.',
    closeMsg: '🔒 Génération du transcript et fermeture du ticket...',
    notTicket: '❌ Ce n\'est pas un canal de ticket.',
    transcriptTitle: '  ORBITAL INTERNATIONAL - TICKET TRANSCRIPT',
    channel: 'Canal',
    closedBy: 'Fermé par',
    date: 'Date',
    messages: 'Messages',
    end: 'Fin du transcript',
    errorClose: '❌ Erreur lors de la génération du transcript. Fermeture du ticket quand même...',
    htmlTitle: 'Ticket Transcript',
    closeReasonModal: 'Raison de Fermeture',
    closeReasonPlaceholder: 'Décris brièvement ce qui a été résolu...',
    closeReasonLabel: 'Raison de la fermeture',
    claimMsg: (staff, opener) => `🟡 **Ticket pris par ${staff}** — assiste ${opener} maintenant.`
  }
};

// ─── LOG MESSAGES (always in English for staff) ───
const LOG_MSG = {
  created: (member, reason, langName, channel) => `**User:** ${member.user.tag} (${member.id})\n**Reason:** ${TICKET_LABELS[reason]}\n**Language:** ${langName}\n**Channel:** ${channel}`,
  claimed: (member, staff, channel) => `**Channel:** ${channel}\n**Opened by:** ${member.user.tag} (${member.id})\n**Claimed by:** ${staff.user.tag} (${staff.id})`,
  closed: (channel, member, count, reason) => `**Channel:** ${channel.name}\n**Closed by:** ${member.user.tag} (${member.id})\n**Messages:** ${count}\n**Reason:** ${reason || 'Not specified'}`
};

// ─── HELPER: Get user age/gender from roles ───
function getUserInfo(member) {
  let age = null;
  let gender = null;

  for (const [key, id] of Object.entries(ROLE_IDS.age)) {
    if (member.roles.cache.has(id)) {
      age = ROLE_NAMES.age[key];
      break;
    }
  }

  for (const [key, id] of Object.entries(ROLE_IDS.gender)) {
    if (member.roles.cache.has(id)) {
      gender = ROLE_NAMES.gender[key];
      break;
    }
  }

  const accountCreated = member.user.createdAt;
  const now = new Date();
  const diffTime = Math.abs(now - accountCreated);
  const accountDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const joinedAt = member.joinedAt;
  let joinedDays = null;
  if (joinedAt) {
    const joinedDiff = Math.abs(now - joinedAt);
    joinedDays = Math.ceil(joinedDiff / (1000 * 60 * 60 * 24));
  }

  return { age, gender, accountDays, joinedDays };
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // ─── SLASH COMMANDS ───
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const lang = await i18n.getUserLang(interaction.user.id);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '❌ ' + i18n.get(lang, 'common.error'), flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
          await interaction.reply({ content: '❌ ' + i18n.get(lang, 'common.error'), flags: MessageFlags.Ephemeral }).catch(() => {});
        }
      }
    }

    // ─── SELECT MENUS ───
    if (interaction.isStringSelectMenu()) {
      // ─── CONFIGME FLOW (5 STEPS) ───
      if (interaction.customId === 'configme_native') {
        await handleConfigmeNative(interaction, client);
        return;
      }
      if (interaction.customId === 'configme_learning') {
        await handleConfigmeLearning(interaction, client);
        return;
      }
      if (interaction.customId === 'configme_age') {
        await handleConfigmeAge(interaction, client);
        return;
      }
      if (interaction.customId === 'configme_region') {
        await handleConfigmeRegion(interaction, client);
        return;
      }
      if (interaction.customId === 'configme_gender') {
        await handleConfigmeGender(interaction, client);
        return;
      }

      // ─── ONBOARDING ───
      if (interaction.customId.startsWith('onboarding_')) {
        await handleOnboarding(interaction);
        return;
      }

      // ─── TICKETS ───
      if (interaction.customId === 'ticket_create') {
        await handleTicketLanguageSelect(interaction, client);
        return;
      }
      if (interaction.customId.startsWith('ticket_reason_')) {
        await handleTicketCreate(interaction, client);
        return;
      }
    }

    // ─── BUTTONS ───
    if (interaction.isButton()) {
      try {
        if (!interaction.isRepliable()) return;
        if (interaction.customId === 'verify_member') {
          await handleVerification(interaction);
        } else if (interaction.customId === 'ticket_close') {
          const modal = new ModalBuilder()
            .setCustomId('ticket_close_modal')
            .setTitle('Close Ticket');

          const reasonInput = new TextInputBuilder()
            .setCustomId('close_reason')
            .setLabel('Reason for closing (optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('e.g., Issue resolved, user banned...')
            .setRequired(false)
            .setMaxLength(500);

          const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
          modal.addComponents(firstActionRow);

          await interaction.showModal(modal);
        } else if (interaction.customId === 'ticket_claim') {
          await handleTicketClaim(interaction, client);
        }
      } catch (error) {
        console.error('Button interaction error:', error.message);
      }
    }

    // ─── MODAL SUBMITS ───
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ticket_close_modal') {
        const reason = interaction.fields.getTextInputValue('close_reason') || null;
        await handleTicketClose(interaction, client, reason);
      }
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// CONFIGME HANDLERS (5 STEPS)
// ═══════════════════════════════════════════════════════════════

async function handleConfigmeNative(interaction, client) {
  const nativeLang = interaction.values[0];
  const nativeRoleId = ROLE_IDS.native[nativeLang];
  const lang = await i18n.getUserLang(interaction.user.id);

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
  const learningRoleId = ROLE_IDS.learning[learningLang];
  const lang = await i18n.getUserLang(interaction.user.id);

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
  const ageRoleId = ROLE_IDS.age[ageValue];
  const lang = await i18n.getUserLang(interaction.user.id);

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
  const regionRoleId = ROLE_IDS.region[regionValue];
  const lang = await i18n.getUserLang(interaction.user.id);

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
  const genderRoleId = ROLE_IDS.gender[genderValue];
  const lang = await i18n.getUserLang(interaction.user.id);

  const temp = client.configmeTemp?.get(interaction.user.id) || {};
  temp.gender = genderValue;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (genderRoleId) await member.roles.add(genderRoleId);
    if (ROLE_IDS.member) await member.roles.add(ROLE_IDS.member);
  } catch (e) {
    console.error('Erro ao atribuir cargos finais:', e);
  }

  // Guarda no MongoDB
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
      { name: '🗣️ ' + i18n.get(lang, 'mystats.native'), value: (temp.nativeLanguage || 'EN').toUpperCase(), inline: true },
      { name: '📚 ' + i18n.get(lang, 'mystats.learning'), value: (temp.learningLanguage || 'PT').toUpperCase(), inline: true },
      { name: '🎂 Age', value: temp.age || '?', inline: true }
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

  if (type === 'age') {
    const hasAgeRole = Object.values(ROLE_IDS.age).some(id => member.roles.cache.has(id));
    if (hasAgeRole) {
      return interaction.reply({
        content: '⚠️ This option is not available at the moment. Please try again later.',
        flags: MessageFlags.Ephemeral
      });
    }
  }

  if (type === 'gender') {
    const hasGenderRole = Object.values(ROLE_IDS.gender).some(id => member.roles.cache.has(id));
    if (hasGenderRole) {
      return interaction.reply({
        content: '⚠️ This option is not available at the moment. Please try again later.',
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

  let emoji = '🗣️';
  if (type === 'learn') emoji = '📚';
  if (type === 'region') emoji = '🌍';
  if (type === 'age') emoji = '🎂';
  if (type === 'gender') emoji = '⚧️';

  const label = type === 'speak' ? 'Languages you speak' :
                type === 'learn' ? 'Languages you want to learn' :
                type === 'region' ? 'Region' :
                type === 'gender' ? 'Gender' : 'Age';

  await interaction.reply({
    content: `${emoji} **${label}** updated:\n${added.map(a => `• ${a}`).join('\n')}`,
    flags: MessageFlags.Ephemeral
  });
}

// ═══════════════════════════════════════════════════════════════
// TICKET HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleTicketLanguageSelect(interaction, client) {
  const member = interaction.member;
  const reason = interaction.values[0];

  const userLanguages = [];
  for (const [lang, roleId] of Object.entries(ROLE_IDS.native)) {
    if (member.roles.cache.has(roleId)) {
      userLanguages.push({ value: lang, label: ROLE_NAMES.native[lang], emoji: getLangEmoji(lang) });
    }
  }

  if (userLanguages.length === 0) {
    userLanguages.push(
      { value: 'pt', label: '🇵🇹 Português (Portuguese)', emoji: '🇵🇹' },
      { value: 'en', label: '🇬🇧 English', emoji: '🇬🇧' },
      { value: 'ru', label: '🇷🇺 Русский (Russian)', emoji: '🇷🇺' },
      { value: 'es', label: '🇪🇸 Español (Spanish)', emoji: '🇪🇸' },
      { value: 'fr', label: '🇫🇷 Français (French)', emoji: '🇫🇷' }
    );
  }

  const languageEmbed = new EmbedBuilder()
    .setTitle('🌌 ORBITAL HUB • SELECT TICKET LANGUAGE')
    .setDescription(`You selected: **${TICKET_LABELS[reason]}**\n\nPlease select the language you want to use for this ticket. Choose a language you are comfortable with:`)
    .setColor(0x2E0854)
    .addFields({
      name: '⚠️ Important Notice',
      value: 'Opening troll tickets or making fake reports to disturb the Staff will lead to an **immediate Mute or Kick**.',
      inline: false
    })
    .setFooter({ text: 'Orbital International • Support' });

  const languageMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`ticket_reason_${reason}`)
      .setPlaceholder('🌐 Select ticket language...')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...userLanguages.map(lang => ({
        label: lang.label,
        value: `${reason}_${lang.value}`,
        emoji: lang.emoji
      })))
  );

  await interaction.reply({
    embeds: [languageEmbed],
    components: [languageMenu],
    flags: MessageFlags.Ephemeral
  });
}

function getLangEmoji(lang) {
  const emojis = { pt: '🇵🇹', en: '🇬🇧', ru: '🇷🇺', es: '🇪🇸', fr: '🇫🇷' };
  return emojis[lang] || '🌐';
}

async function handleTicketCreate(interaction, client) {
  const member = interaction.member;
  const selectedValue = interaction.values[0];
  const [reason, language] = selectedValue.split('_');
  const guild = interaction.guild;

  const t = TICKET_UI[language] || TICKET_UI.en;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const usernameClean = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
  const existingTicket = guild.channels.cache.find(ch => 
    ch.name.startsWith(`t-${usernameClean}-`)
  );

  if (existingTicket) {
    return interaction.editReply({
      content: t.existing(existingTicket)
    });
  }

  try {
    const langName = ROLE_NAMES.native[language] || language.toUpperCase();
    const reasonAbbr = TICKET_ABBREV[reason] || reason;
    const channelName = `t-${usernameClean}-${reasonAbbr}-${language}`;

    const permissionOverwrites = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: member.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
      }
    ];

    permissionOverwrites.push({
      id: STAFF_ROLE_ID,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
    });

    const langStaffRoles = LANG_STAFF_ROLES[language] || [];
    for (const roleId of langStaffRoles) {
      if (roleId !== STAFF_ROLE_ID) {
        permissionOverwrites.push({
          id: roleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        });
      }
    }

    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites
    });

    const userInfo = getUserInfo(member);

    const ticketEmbed = new EmbedBuilder()
      .setTitle(t.title)
      .setDescription(t.desc(member, reason, langName))
      .setColor(0x2E0854)
      .addFields(
        {
          name: t.userInfo,
          value: `**Member:** ${member}\n**${t.accountAge}:** ${t.accountAgeFmt(userInfo.accountDays)}\n**${t.joinedAgo}:** ${userInfo.joinedDays ? t.joinedAgoFmt(userInfo.joinedDays) : t.notSet}\n**${t.age}:** ${userInfo.age || t.notSet}\n**${t.gender}:** ${userInfo.gender || t.notSet}`,
          inline: false
        },
        {
          name: t.warning,
          value: t.warningText,
          inline: false
        }
      )
      .setTimestamp();

    const closeRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel(t.closeBtn)
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel(t.claimBtn)
          .setStyle(ButtonStyle.Primary)
      );

    await ticketChannel.send({
      content: `${member} <@&${STAFF_ROLE_ID}>`,
      embeds: [ticketEmbed],
      components: [closeRow]
    });

    const redirectRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(`🔗 ${language.toUpperCase()} Ticket`)
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${guild.id}/${ticketChannel.id}`)
        .setEmoji('🎟️')
    );

    await interaction.editReply({
      content: t.created(ticketChannel, langName),
      components: [redirectRow]
    });

    const logsChannel = await client.channels.fetch(LOGS_CHANNEL_ID).catch(() => null);
    if (logsChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🟢 Ticket Opened')
        .setDescription(LOG_MSG.created(member, reason, langName, ticketChannel))
        .setColor(0x57F287)
        .setTimestamp();

      const logRedirectRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('🔗 Go to Ticket')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${guild.id}/${ticketChannel.id}`)
          .setEmoji('🎟️')
      );

      await logsChannel.send({ embeds: [logEmbed], components: [logRedirectRow] }).catch(() => {});
    }

  } catch (err) {
    console.error('Ticket creation error:', err);
    await interaction.editReply({
      content: t.fail
    });
  }
}

async function handleTicketClaim(interaction, client) {
  const channel = interaction.channel;
  const staff = interaction.member;

  if (!channel.name.startsWith('t-')) {
    return interaction.reply({
      content: '❌ This is not a ticket channel.',
      flags: MessageFlags.Ephemeral
    });
  }

  const langFromName = channel.name.split('-').pop();
  const t = TICKET_UI[langFromName] || TICKET_UI.en;

  const messages = await channel.messages.fetch({ limit: 10 }).catch(() => new Map());
  let opener = null;
  for (const [, msg] of messages) {
    if (msg.author.id === client.user.id && msg.mentions.users.size > 0) {
      opener = msg.mentions.users.first();
      break;
    }
  }

  const openerMention = opener ? `<@${opener.id}>` : 'user';

  const disabledRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel(t.closeBtn)
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket_claim')
        .setLabel(`✋ ${t.claimBtn.split(' ').pop()} ${staff.user.username}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
    );

  await interaction.update({ components: [disabledRow] });

  await channel.send({
    content: t.claimMsg(staff, openerMention)
  });

  const logsChannel = await client.channels.fetch(LOGS_CHANNEL_ID).catch(() => null);
  if (logsChannel && opener) {
    const member = await channel.guild.members.fetch(opener.id).catch(() => null);
    if (member) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🟡 Ticket Claimed')
        .setDescription(LOG_MSG.claimed(member, staff, channel))
        .setColor(0xFEE75C)
        .setTimestamp();

      const logRedirectRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('🔗 Go to Ticket')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${channel.guild.id}/${channel.id}`)
          .setEmoji('🎟️')
      );

      await logsChannel.send({ embeds: [logEmbed], components: [logRedirectRow] }).catch(() => {});
    }
  }
}

async function handleTicketClose(interaction, client, closeReason = null) {
  const channel = interaction.channel;
  const member = interaction.member;

  const langFromName = channel.name.split('-').pop();
  const t = TICKET_UI[langFromName] || TICKET_UI.en;

  if (!channel.name.startsWith('t-')) {
    return interaction.reply({
      content: t.notTicket,
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.reply({
    content: t.closeMsg
  });

  try {
    let allMessages = [];
    let lastId = null;
    let fetched;

    do {
      const options = { limit: 100 };
      if (lastId) options.before = lastId;
      fetched = await channel.messages.fetch(options);
      allMessages = allMessages.concat(Array.from(fetched.values()));
      if (fetched.size > 0) lastId = fetched.last().id;
    } while (fetched.size === 100);

    allMessages.reverse();

    const ticketName = channel.name;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFileName = `${ticketName}_${timestamp}`;

    let txtContent = `========================================\n`;
    txtContent += `${t.transcriptTitle}\n`;
    txtContent += `========================================\n`;
    txtContent += `${t.channel}: ${channel.name}\n`;
    txtContent += `${t.closedBy}: ${member.user.tag} (${member.id})\n`;
    txtContent += `${t.date}: ${new Date().toUTCString()}\n`;
    txtContent += `${t.messages}: ${allMessages.length}\n`;
    if (closeReason) txtContent += `Reason: ${closeReason}\n`;
    txtContent += `========================================\n\n`;

    for (const msg of allMessages) {
      const time = msg.createdAt.toUTCString();
      const author = msg.author.tag;
      const content = msg.content || '[No text content]';
      txtContent += `[${time}] ${author}:\n${content}\n`;
      if (msg.attachments.size > 0) {
        txtContent += `[Attachments: ${msg.attachments.map(a => a.url).join(', ')}]\n`;
      }
      txtContent += `\n`;
    }

    txtContent += `========================================\n`;
    txtContent += `${t.end}\n`;
    txtContent += `========================================\n`;

    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.htmlTitle} - ${ticketName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #36393f; color: #dcddde; min-height: 100vh; }
    .header { background: #2f3136; padding: 20px; border-bottom: 1px solid #202225; text-align: center; }
    .header h1 { color: #fff; font-size: 24px; margin-bottom: 10px; }
    .header .meta { color: #b9bbbe; font-size: 14px; }
    .messages { padding: 20px; max-width: 900px; margin: 0 auto; }
    .message { display: flex; margin-bottom: 16px; padding: 8px; border-radius: 4px; }
    .message:hover { background: rgba(255,255,255,0.02); }
    .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; }
    .content { flex: 1; }
    .author { color: #fff; font-weight: 600; font-size: 15px; margin-bottom: 2px; }
    .timestamp { color: #72767d; font-size: 12px; margin-left: 8px; font-weight: normal; }
    .text { color: #dcddde; font-size: 15px; line-height: 1.4; word-wrap: break-word; }
    .attachments { margin-top: 4px; }
    .attachments a { color: #00b0f4; text-decoration: none; }
    .attachments a:hover { text-decoration: underline; }
    .footer { background: #2f3136; padding: 15px; text-align: center; color: #72767d; font-size: 12px; border-top: 1px solid #202225; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌌 ORBITAL INTERNATIONAL - TICKET TRANSCRIPT</h1>
    <div class="meta">
      <strong>${t.channel}:</strong> ${ticketName} | 
      <strong>${t.closedBy}:</strong> ${member.user.tag} | 
      <strong>${t.date}:</strong> ${new Date().toUTCString()} | 
      <strong>${t.messages}:</strong> ${allMessages.length}${closeReason ? ` | <strong>Reason:</strong> ${escapeHtml(closeReason)}` : ''}
    </div>
  </div>
  <div class="messages">\n`;

    for (const msg of allMessages) {
      const time = msg.createdAt.toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      const avatar = msg.author.displayAvatarURL({ size: 64 }) || msg.author.defaultAvatarURL;
      const text = msg.content ? escapeHtml(msg.content).replace(/\n/g, '<br>') : '<em style="color:#72767d">[No text content]</em>';

      let attachmentsHtml = '';
      if (msg.attachments.size > 0) {
        attachmentsHtml = '<div class="attachments">';
        msg.attachments.forEach(att => {
          if (att.contentType && att.contentType.startsWith('image/')) {
            attachmentsHtml += `<a href="${att.url}" target="_blank"><img src="${att.url}" style="max-width:300px;max-height:200px;border-radius:4px;margin-top:4px;"></a><br>`;
          } else {
            attachmentsHtml += `<a href="${att.url}" target="_blank">📎 ${att.name}</a><br>`;
          }
        });
        attachmentsHtml += '</div>';
      }

      htmlContent += `    <div class="message">
      <img class="avatar" src="${avatar}" alt="${msg.author.username}">
      <div class="content">
        <div class="author">${escapeHtml(msg.author.username)}<span class="timestamp">${time}</span></div>
        <div class="text">${text}</div>
        ${attachmentsHtml}
      </div>
    </div>\n`;
    }

    htmlContent += `  </div>
  <div class="footer">
    Orbital International • Ticket Transcript • Generated ${new Date().toUTCString()}
  </div>
</body>
</html>`;

    const txtPath = path.join('/tmp', `${baseFileName}.txt`);
    const htmlPath = path.join('/tmp', `${baseFileName}.html`);

    fs.writeFileSync(txtPath, txtContent, 'utf8');
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    const txtAttachment = new AttachmentBuilder(txtPath, { name: `${baseFileName}.txt` });
    const htmlAttachment = new AttachmentBuilder(htmlPath, { name: `${baseFileName}.html` });

    const logsChannel = await client.channels.fetch(LOGS_CHANNEL_ID).catch(() => null);
    if (logsChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🔴 Ticket Closed & Transcript')
        .setDescription(LOG_MSG.closed(channel, member, allMessages.length, closeReason))
        .setColor(0xED4245)
        .setTimestamp();

      await logsChannel.send({
        embeds: [logEmbed],
        files: [txtAttachment, htmlAttachment]
      }).catch(err => console.error('Failed to send transcript:', err));
    }

    try {
      fs.unlinkSync(txtPath);
      fs.unlinkSync(htmlPath);
    } catch (e) {}

    setTimeout(async () => {
      await channel.delete().catch(err => {
        console.error('Failed to delete ticket channel:', err);
      });
    }, 3000);

  } catch (err) {
    console.error('Ticket close error:', err);
    await interaction.editReply({
      content: t.errorClose
    });
    setTimeout(() => channel.delete().catch(() => {}), 3000);
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleVerification(interaction) {
  const memberRoleId = ROLE_IDS.member;

  const memberRole = interaction.guild.roles.cache.get(memberRoleId);
  if (!memberRole) {
    return await interaction.reply({
      content: '❌ Member role not found. Please contact a Staff member.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (interaction.member.roles.cache.has(memberRoleId)) {
    return await interaction.reply({
      content: '✅ You have already accepted the rules.',
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.member.roles.add(memberRoleId);
  await interaction.reply({
    content: '✅ Welcome aboard, Orbiter! Rules accepted.',
    flags: MessageFlags.Ephemeral
  });
}
