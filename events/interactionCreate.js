const { Events, InteractionType, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');

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

    // ─── SELECT MENUS ───
    if (interaction.isStringSelectMenu()) {
      // Onboarding dropdowns (from rules channel)
      if (interaction.customId.startsWith('onboarding_')) {
        await handleOnboarding(interaction);
        return;
      }
      // Configme dropdowns (from /configme command)
      if (interaction.customId.startsWith('configme_')) {
        await handleConfigme(interaction);
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
    content: `${emoji} **${label}** atualizado:
${added.map(a => `• ${a}`).join('\n')}`,
    flags: MessageFlags.Ephemeral
  });
}

// ─── CONFIGME HANDLER (existing /configme command flow) ───
async function handleConfigme(interaction) {
  const step = interaction.customId.replace('configme_', '');
  const value = interaction.values[0];

  try {
    let profile = await UserProfile.findOne({ userId: interaction.user.id });
    if (!profile) {
      profile = new UserProfile({ userId: interaction.user.id, username: interaction.user.username });
    }

    if (step === 'native') {
      profile.nativeLanguage = value;
      profile.language = value;

      const learningOptions = [
        { label: '🇵🇹 Português (Portuguese)', value: 'pt', description: 'Português' },
        { label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 English', value: 'en', description: 'English' },
        { label: '🇷🇺 Русский (Russian)', value: 'ru', description: 'Русский' },
        { label: '🇪🇸 Español (Spanish)', value: 'es', description: 'Español' },
        { label: '🇫🇷 Français (French)', value: 'fr', description: 'Français' }
      ].filter(opt => opt.value !== value);

      const menu = {
        type: 1,
        components: [{
          type: 3,
          custom_id: 'configme_learning',
          placeholder: 'What languages do you want to learn?',
          options: learningOptions
        }]
      };

      await interaction.update({ content: '📚 **Step 2/4**: What language do you want to **learn**?', components: [menu] });
      await profile.save();
      return;
    }

    if (step === 'learning') {
      profile.learningLanguage = value;

      const regionOptions = [
        { label: '🇪🇺 Europe', value: 'europe', description: 'Europe', emoji: '🌍' },
        { label: '🌎 North America', value: 'north_america', description: 'North America', emoji: '🌎' },
        { label: '🌎 South America', value: 'south_america', description: 'South America', emoji: '🌎' },
        { label: '🇷🇺 Eastern Europe / CIS', value: 'eastern_europe', description: 'Eastern Europe / CIS', emoji: '🌍' },
        { label: '🌍 Africa & Middle East', value: 'africa_me', description: 'Africa & Middle East', emoji: '🌍' },
        { label: '🌏 Asia & Oceania', value: 'asia_oceania', description: 'Asia & Oceania', emoji: '🌏' }
      ];

      const menu = {
        type: 1,
        components: [{
          type: 3,
          custom_id: 'configme_region',
          placeholder: 'Where are you from?',
          options: regionOptions
        }]
      };

      await interaction.update({ content: '🌎 **Step 3/4**: Where are you **from**?', components: [menu] });
      await profile.save();
      return;
    }

    if (step === 'region') {
      profile.region = value;

      const ageOptions = [
        { label: '🟢 11-13 years', value: '11-13', description: '11-13 years old' },
        { label: '🟡 14-16 years', value: '14-16', description: '14-16 years old' },
        { label: '🔵 17-19 years', value: '17-19', description: '17-19 years old' },
        { label: '🟣 20-22 years', value: '20-22', description: '20-22 years old' }
      ];

      const menu = {
        type: 1,
        components: [{
          type: 3,
          custom_id: 'configme_age',
          placeholder: 'How old are you?',
          options: ageOptions
        }]
      };

      await interaction.update({ content: '🎂 **Step 4/4**: How **old** are you?', components: [menu] });
      await profile.save();
      return;
    }

    if (step === 'age') {
      profile.ageGroup = value;
      profile.updatedAt = new Date();
      await profile.save();

      const member = interaction.member;
      const rolesToAdd = [];

      if (ROLE_IDS.native[profile.nativeLanguage]) rolesToAdd.push(ROLE_IDS.native[profile.nativeLanguage]);
      if (ROLE_IDS.learning[profile.learningLanguage]) rolesToAdd.push(ROLE_IDS.learning[profile.learningLanguage]);
      if (ROLE_IDS.region[profile.region]) rolesToAdd.push(ROLE_IDS.region[profile.region]);
      if (ROLE_IDS.age[profile.ageGroup]) rolesToAdd.push(ROLE_IDS.age[profile.ageGroup]);
      rolesToAdd.push(ROLE_IDS.member);

      for (const roleId of rolesToAdd) {
        try { await member.roles.add(roleId); } catch (e) { console.error('Failed to add role ' + roleId + ':', e.message); }
      }

      await interaction.update({
        content: '✅ **Profile Complete!** Welcome to Orbital International!\n\n' +
          '🗣️ **Native**: ' + profile.nativeLanguage.toUpperCase() + '\n' +
          '📚 **Learning**: ' + profile.learningLanguage.toUpperCase() + '\n' +
          '🌎 **Region**: ' + profile.region.replace(/_/g, ' ').toUpperCase() + '\n' +
          '🎂 **Age**: ' + profile.ageGroup + '\n\n' +
          'Roles assigned successfully!',
        components: []
      });

      try {
        const rulesChannel = await interaction.client.channels.fetch(process.env.RULES_CHANNEL_ID);
        if (rulesChannel) {
          await rulesChannel.send({
            content: '🎉 Welcome <@' + interaction.user.id + '>! They joined us from **' +
              profile.region.replace(/_/g, ' ').toUpperCase() + '** and speak **' +
              profile.nativeLanguage.toUpperCase() + '**, learning **' +
              profile.learningLanguage.toUpperCase() + '**!'
          });
        }
      } catch (e) { console.error('Failed to send welcome:', e.message); }
    }

  } catch (error) {
    console.error('Configme error:', error);
    await interaction.update({ content: '❌ An error occurred. Please try /configme again.', components: [] }).catch(() => {});
  }
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

  await interaction.member.roles.add(memberRole);
  await interaction.reply({
    content: '✅ Bem-vindo a bordo, Orbiter! Regras aceites.',
    flags: MessageFlags.Ephemeral
  });
}
