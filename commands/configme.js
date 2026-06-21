const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const i18n = require('../utils/i18n');

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
    male: 'ADD_MALE_ROLE_ID',
    female: 'ADD_FEMALE_ROLE_ID',
    other: 'ADD_OTHER_ROLE_ID',
    prefer_not: 'ADD_PREFER_NOT_ROLE_ID'
  },
  member: '1515151179019980931'
};

const RULES_CHANNEL_ID = '1515151037344907336';

const nativeOptions = [
  { label: 'Portugues (Portuguese)', value: 'pt', description: 'Portugues', emoji: { name: '🇵🇹' } },
  { label: 'English', value: 'en', description: 'English', emoji: { name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
  { label: 'Russkij (Russian)', value: 'ru', description: 'Russkij', emoji: { name: '🇷🇺' } },
  { label: 'Espanol (Spanish)', value: 'es', description: 'Espanol', emoji: { name: '🇪🇸' } },
  { label: 'Francais (French)', value: 'fr', description: 'Francais', emoji: { name: '🇫🇷' } }
];

const learningOptions = [
  { label: 'Portugues (Portuguese)', value: 'pt', description: 'Portugues', emoji: { name: '🇵🇹' } },
  { label: 'English', value: 'en', description: 'English', emoji: { name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
  { label: 'Russkij (Russian)', value: 'ru', description: 'Russkij', emoji: { name: '🇷🇺' } },
  { label: 'Espanol (Spanish)', value: 'es', description: 'Espanol', emoji: { name: '🇪🇸' } },
  { label: 'Francais (French)', value: 'fr', description: 'Francais', emoji: { name: '🇫🇷' } }
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

const genderOptions = [
  { label: 'Male', value: 'male', description: 'Male', emoji: { name: '♂️' } },
  { label: 'Female', value: 'female', description: 'Female', emoji: { name: '♀️' } },
  { label: 'Other', value: 'other', description: 'Other', emoji: { name: '⚧' } },
  { label: 'Prefer not to say', value: 'prefer_not', description: 'Prefer not to say', emoji: { name: '🤐' } }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configme')
    .setDescription('Set up your language learning profile with dropdowns'),

  async execute(interaction) {
    const lang = await i18n.getUserLang(interaction.user.id);

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('configme_native')
        .setPlaceholder(i18n.get(lang, 'configme.native_placeholder'))
        .addOptions(nativeOptions)
    );

    await interaction.reply({
      content: i18n.get(lang, 'configme.step1'),
      components: [menu],
      flags: MessageFlags.Ephemeral
    });
  }
};

module.exports.ROLE_IDS = ROLE_IDS;
module.exports.RULES_CHANNEL_ID = RULES_CHANNEL_ID;
module.exports.nativeOptions = nativeOptions;
module.exports.learningOptions = learningOptions;
module.exports.regionOptions = regionOptions;
module.exports.ageOptions = ageOptions;
module.exports.genderOptions = genderOptions;
