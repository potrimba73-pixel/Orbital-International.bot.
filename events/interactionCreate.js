const { Events, InteractionType, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

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
    pt: 'Português (Portuguese) Speaker',
    en: 'English Speaker',
    es: 'Español (Spanish) Speaker',
    ru: 'Русский (Russian) Speaker',
    fr: 'Français (French) Speaker'
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
const TICKET_CATEGORY_ID = '1515381294261862571';
const STAFF_ROLE_ID = '1515151599503282227';

const TICKET_LABELS = {
  general: '👤 General Support',
  report: '🛡️ Report User',
  language: '🌍 Language Help',
  other: '🛸 Other / Partnership'
};

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
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error executing this command!', flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
          await interaction.reply({ content: 'There was an error executing this command!', flags: MessageFlags.Ephemeral }).catch(() => {});
        }
      }
    }

    // ─── SELECT MENUS ───
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('onboarding_')) {
        await handleOnboarding(interaction);
        return;
      }
      if (interaction.customId === 'ticket_create') {
        await handleTicketCreate(interaction);
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
          await handleTicketClose(interaction);
        }
      } catch (error) {
        console.error('Button interaction error:', error.message);
      }
    }
  }
};

// ─── ONBOARDING HANDLER ───
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

// ─── TICKET CREATE HANDLER ───
async function handleTicketCreate(interaction) {
  const member = interaction.member;
  const reason = interaction.values[0];
  const guild = interaction.guild;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  // Check if user already has an open ticket
  const existingTicket = guild.channels.cache.find(ch => 
    ch.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  );

  if (existingTicket) {
    return interaction.editReply({
      content: `⚠️ You already have an open ticket: ${existingTicket}`
    });
  }

  try {
    const ticketChannel = await guild.channels.create({
      name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: member.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        },
        {
          id: STAFF_ROLE_ID,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        }
      ]
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle('🌌 ORBITAL HUB • TICKET OPENED')
      .setDescription(`Hello ${member}, your ticket has been created.\n\n**Reason:** ${TICKET_LABELS[reason]}\n**User:** ${member.user.tag}\n**ID:** ${member.id}\n\nPlease describe your issue in detail. A Staff member will assist you shortly.`)
      .setColor(0x2E0854)
      .setTimestamp();

    const closeRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('🔒 Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

    await ticketChannel.send({
      content: `${member} <@&${STAFF_ROLE_ID}>`,
      embeds: [ticketEmbed],
      components: [closeRow]
    });

    await interaction.editReply({
      content: `✅ Your ticket has been created: ${ticketChannel}`
    });

  } catch (err) {
    console.error('Ticket creation error:', err);
    await interaction.editReply({
      content: '❌ Failed to create ticket. Please contact a Staff member.'
    });
  }
}

// ─── TICKET CLOSE HANDLER ───
async function handleTicketClose(interaction) {
  const channel = interaction.channel;

  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({
      content: '❌ This is not a ticket channel.',
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.reply({
    content: '🔒 Closing ticket in 5 seconds...'
  });

  setTimeout(async () => {
    await channel.delete().catch(err => {
      console.error('Failed to delete ticket channel:', err);
    });
  }, 5000);
}

// ─── VERIFICATION HANDLER ───
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
