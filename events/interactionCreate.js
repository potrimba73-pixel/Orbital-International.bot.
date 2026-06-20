const { Events, InteractionType, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');

// Role IDs from server
const ROLE_IDS = {
  // Native Speaker Roles
  native: {
    pt: '1515151237740498996',  // Português Speaker
    en: '1515151352966156449',  // English Speaker
    es: '1515151464367128586',  // Español Speaker
    ru: '1515151422721622239',  // Русский Speaker
    fr: '1515151532704923739'   // Français Speaker
  },
  // Learning Roles
  learning: {
    pt: '1517689052990541824',  // Learning Português
    en: '1517690503024349354',  // Learning English
    es: '1517689212990656542',  // Learning Español
    ru: '1517689430846996550',  // Learning Русский
    fr: '1517689522714841120'   // Learning Français
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

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error('Error executing ' + interaction.commandName + ':', error);
        
        if (interaction.replied || interaction.deferred) {
          try {
            await interaction.followUp({ 
              content: 'There was an error executing this command!', 
              flags: MessageFlags.Ephemeral 
            });
          } catch (e) {
            console.error('Failed to send followUp:', e.message);
          }
        } else {
          try {
            await interaction.reply({ 
              content: 'There was an error executing this command!', 
              flags: MessageFlags.Ephemeral 
            });
          } catch (e) {
            console.error('Failed to send reply:', e.message);
          }
        }
      }
    }

    // Handle select menus (configme dropdowns)
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('configme_')) {
        await handleConfigme(interaction);
      }
    }

    // Handle buttons
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

async function handleConfigme(interaction) {
  const step = interaction.customId.replace('configme_', '');
  const value = interaction.values[0];
  
  try {
    let profile = await UserProfile.findOne({ userId: interaction.user.id });
    if (!profile) {
      profile = new UserProfile({ userId: interaction.user.id, username: interaction.user.username });
    }

    // Step 1: Native Language
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

      await interaction.update({
        content: '📚 **Step 2/4**: What language do you want to **learn**?',
        components: [menu]
      });
      
      await profile.save();
      return;
    }

    // Step 2: Learning Language
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

      await interaction.update({
        content: '🌎 **Step 3/4**: Where are you **from**?',
        components: [menu]
      });
      
      await profile.save();
      return;
    }

    // Step 3: Region
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

      await interaction.update({
        content: '🎂 **Step 4/4**: How **old** are you?',
        components: [menu]
      });
      
      await profile.save();
      return;
    }

    // Step 4: Age - Final step, assign roles
    if (step === 'age') {
      profile.ageGroup = value;
      profile.updatedAt = new Date();
      await profile.save();

      // Assign roles
      const member = interaction.member;
      const rolesToAdd = [];

      // Native language role
      if (ROLE_IDS.native[profile.nativeLanguage]) {
        rolesToAdd.push(ROLE_IDS.native[profile.nativeLanguage]);
      }

      // Learning language role
      if (ROLE_IDS.learning[profile.learningLanguage]) {
        rolesToAdd.push(ROLE_IDS.learning[profile.learningLanguage]);
      }

      // Region role
      if (ROLE_IDS.region[profile.region]) {
        rolesToAdd.push(ROLE_IDS.region[profile.region]);
      }

      // Age role
      if (ROLE_IDS.age[profile.ageGroup]) {
        rolesToAdd.push(ROLE_IDS.age[profile.ageGroup]);
      }

      // Member role
      rolesToAdd.push(ROLE_IDS.member);

      // Add all roles
      for (const roleId of rolesToAdd) {
        try {
          await member.roles.add(roleId);
        } catch (e) {
          console.error('Failed to add role ' + roleId + ':', e.message);
        }
      }

      await interaction.update({
        content: '✅ **Profile Complete!** Welcome to Orbital International!\\n\\n' +
          '🗣️ **Native**: ' + profile.nativeLanguage.toUpperCase() + '\\n' +
          '📚 **Learning**: ' + profile.learningLanguage.toUpperCase() + '\\n' +
          '🌎 **Region**: ' + profile.region.replace(/_/g, ' ').toUpperCase() + '\\n' +
          '🎂 **Age**: ' + profile.ageGroup + '\\n\\n' +
          'Roles assigned successfully!',
        components: []
      });

      // Send welcome message to rules channel
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
      } catch (e) {
        console.error('Failed to send welcome:', e.message);
      }
    }

  } catch (error) {
    console.error('Configme error:', error);
    await interaction.update({
      content: '❌ An error occurred. Please try /configme again.',
      components: []
    }).catch(() => {});
  }
}

async function handleVerification(interaction) {
  const memberRoleId = process.env.MEMBER_ROLE_ID;
  if (!memberRoleId || memberRoleId === 'your_member_role_id_here') {
    return await interaction.reply({
      content: '❌ Member role not configured. Contact a Staff member.',
      flags: MessageFlags.Ephemeral
    });
  }

  const memberRole = interaction.guild.roles.cache.get(memberRoleId);
  if (!memberRole) {
    return await interaction.reply({
      content: '❌ Member role not found. Contact a Staff member.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (interaction.member.roles.cache.has(memberRoleId)) {
    return await interaction.reply({
      content: '✅ You already have the Member role!',
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.member.roles.add(memberRole);
  await interaction.reply({
    content: '✅ You have been verified! Welcome to Orbital International!',
    flags: MessageFlags.Ephemeral
  });
}
