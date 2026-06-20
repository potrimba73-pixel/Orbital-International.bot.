const { Events, InteractionType, MessageFlags } = require('discord.js');

// ─── ROLE IDs ───
const ROLE_IDS = {
  // Native Speaker Roles
  native: {
    pt: '1515151237740498996',
    en: '1515151352966156449',
    es: '1515151464367128586',
    ru: '1515151422721622239',
    fr: '1515151532704923739'
  },
  // Learning Roles
  learning: {
    pt: '1517689052990541824',
    en: '1517690503024349354',
    es: '1517689212990656542',
    ru: '1517689430846996550',
    fr: '1517689522714841120'
  },
  // Age Roles
  age: {
    '11-13': '1515739553804189826',
    '14-16': '1515739597064376441',
    '17-19': '1515739642937479308',
    '20-22': '1517699843928228112'
  },
  // Region Roles
  region: {
    europe: '1515739900929118278',
    north_america: '1515740225123389500',
    south_america: '1515740107985125560',
    eastern_europe: '1515741344117559467',
    africa_me: '1515740271835349022',
    asia_oceania: '1515740516338241679'
  },
  member: '1515151179019980931'
};

// ─── ROLE NAME MAP (for replies) ───
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
  }
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
        console.error('Error executing ' + interaction.commandName + ':', error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error executing this command!', flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
          await interaction.reply({ content: 'There was an error executing this command!', flags: MessageFlags.Ephemeral }).catch(() => {});
        }
      }
    }

    // ─── SELECT MENUS (onboarding only) ───
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('onboarding_')) {
        await handleOnboarding(interaction);
        return;
      }
    }

    // ─── BUTTONS ───
    if (interaction.isButton()) {
      try {
        if (!interaction.isRepliable()) return;
        if (interaction.customId === 'verify_member') {
          await handleVerification(interaction);
        }
      } catch (error) {
        console.error('Button interaction error:', error.message);
      }
    }
  }
};

// ─── ONBOARDING HANDLER (rules channel dropdowns) ───
async function handleOnboarding(interaction) {
  const member = interaction.member;
  const type = interaction.customId.replace('onboarding_', ''); // speak, learn, region, age
  const selected = interaction.values;

  // ─── AGE: ONE-TIME ONLY (silently blocked) ───
  if (type === 'age') {
    const hasAgeRole = Object.values(ROLE_IDS.age).some(id => member.roles.cache.has(id));
    if (hasAgeRole) {
      // Generic error - doesn't reveal that age is locked
      return interaction.reply({
        content: '⚠️ Esta opcao nao esta disponivel de momento. Tenta novamente mais tarde.',
        flags: MessageFlags.Ephemeral
      });
    }
  }

  const roleMap = ROLE_IDS[type === 'speak' ? 'native' : type === 'learn' ? 'learning' : type];
  const nameMap = ROLE_NAMES[type === 'speak' ? 'native' : type === 'learn' ? 'learning' : type];

  if (!roleMap) return;

  // Remove all roles from this category first
  const allCategoryRoleIds = Object.values(roleMap);
  const rolesToRemove = member.roles.cache.filter(r => allCategoryRoleIds.includes(r.id));
  if (rolesToRemove.size > 0) {
    await member.roles.remove(rolesToRemove).catch(() => {});
  }

  // Add selected roles
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

  const label = type === 'speak' ? 'Languages you speak' :
                type === 'learn' ? 'Languages you want to learn' :
                type === 'region' ? 'Region' : 'Age';

  await interaction.reply({
    content: `${emoji} **${label}** atualizado:\n${added.map(a => `• ${a}`).join('\n')}`,
    flags: MessageFlags.Ephemeral
  });
}

// ─── VERIFICATION HANDLER ───
async function handleVerification(interaction) {
  const memberRoleId = ROLE_IDS.member;

  const memberRole = interaction.guild.roles.cache.get(memberRoleId);
  if (!memberRole) {
    return await interaction.reply({
      content: '❌ Cargo de membro nao encontrado. Contacta um Staff.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (interaction.member.roles.cache.has(memberRoleId)) {
    return await interaction.reply({
      content: '✅ Ja aceitaste as regras.',
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.member.roles.add(memberRoleId);
  await interaction.reply({
    content: '✅ Bem-vindo a bordo, Orbiter! Regras aceites.',
    flags: MessageFlags.Ephemeral
  });
}
