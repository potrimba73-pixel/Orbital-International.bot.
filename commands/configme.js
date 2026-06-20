const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

// Role IDs from Orbital-International server
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
  member: '1515151179019980931'
};

// Rules channel for welcome message
const RULES_CHANNEL_ID = '1515151037344907336';

const nativeOptions = [
  { label: 'Portugues (Portuguese)', value: 'pt', description: 'Português', emoji: { name: '🇵🇹' } },
  { label: 'English', value: 'en', description: 'English', emoji: { name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
  { label: 'Russkij (Russian)', value: 'ru', description: 'Русский', emoji: { name: '🇷🇺' } },
  { label: 'Espanol (Spanish)', value: 'es', description: 'Español', emoji: { name: '🇪🇸' } },
  { label: 'Francais (French)', value: 'fr', description: 'Français', emoji: { name: '🇫🇷' } }
];

const regionOptions = [
  { label: 'Europe', value: 'europe', description: 'Europe', emoji: { name: '🇪🇺' } },
  { label: 'North America', value: 'north_america', description: 'North America', emoji: { name: '🌎' } },
  { label: 'South America', value: 'south_america', description: 'South America', emoji: { name: '🌎' } },
  { label: 'Eastern Europe / CIS', value: 'eastern_europe', description: 'Eastern Europe / CIS', emoji: { name: '🇷🇺' } },
  { label: 'Africa & Middle East', value: 'africa_me', description: 'Africa & Middle East', emoji: { name: '🌍' } },
  { label: 'Asia & Oceania', value: 'asia_oceania', description: 'Asia & Oceania', emoji: { name: '🌏' } }
];

const ageOptions = [
  { label: '11-13 years', value: '11-13', description: '11-13 years old', emoji: { name: '🟢' } },
  { label: '14-16 years', value: '14-16', description: '14-16 years old', emoji: { name: '🟡' } },
  { label: '17-19 years', value: '17-19', description: '17-19 years old', emoji: { name: '🔵' } },
  { label: '20-22 years', value: '20-22', description: '20-22 years old', emoji: { name: '🟣' } }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configme')
    .setDescription('Set up your language learning profile with dropdowns'),

  async execute(interaction) {
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('configme_native')
        .setPlaceholder('What languages do you speak?')
        .addOptions(nativeOptions)
    );

    await interaction.reply({
      content: '🌍 **Step 1/4**: What is your **native language**?',
      components: [menu],
      flags: MessageFlags.Ephemeral
    });
  }
};

// Export role IDs for use in interactionCreate.js
module.exports.ROLE_IDS = ROLE_IDS;
module.exports.RULES_CHANNEL_ID = RULES_CHANNEL_ID;
