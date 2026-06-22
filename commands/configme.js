const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../utils/models/GuildConfig');
const i18n = require('../utils/i18n');

const nativeOptions = [
  { label: 'Português (Portuguese)', value: 'pt', description: 'Português', emoji: { name: '🇵🇹' } },
  { label: 'English', value: 'en', description: 'English', emoji: { name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
  { label: 'Русский (Russian)', value: 'ru', description: 'Русский', emoji: { name: '🇷🇺' } },
  { label: 'Español (Spanish)', value: 'es', description: 'Español', emoji: { name: '🇪🇸' } },
  { label: 'Français (French)', value: 'fr', description: 'Français', emoji: { name: '🇫🇷' } }
];

const learningOptions = [
  { label: 'Português (Portuguese)', value: 'pt', description: 'Português', emoji: { name: '🇵🇹' } },
  { label: 'English', value: 'en', description: 'English', emoji: { name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' } },
  { label: 'Русский (Russian)', value: 'ru', description: 'Русский', emoji: { name: '🇷🇺' } },
  { label: 'Español (Spanish)', value: 'es', description: 'Español', emoji: { name: '🇪🇸' } },
  { label: 'Français (French)', value: 'fr', description: 'Français', emoji: { name: '🇫🇷' } }
];

const ageOptions = [
  { label: '11-13 years', value: '11-13', description: '11-13 years old', emoji: { name: '🟢' } },
  { label: '14-16 years', value: '14-16', description: '14-16 years old', emoji: { name: '🟡' } },
  { label: '17-19 years', value: '17-19', description: '17-19 years old', emoji: { name: '🔵' } },
  { label: '20-22 years', value: '20-22', description: '20-22 years old', emoji: { name: '🟣' } }
];

const regionOptions = [
  { label: 'Europe', value: 'europe', description: 'Europe', emoji: { name: '🇪🇺' } },
  { label: 'North America', value: 'north_america', description: 'North America', emoji: { name: '🌎' } },
  { label: 'South America', value: 'south_america', description: 'South America', emoji: { name: '🌎' } },
  { label: 'Eastern Europe / CIS', value: 'eastern_europe', description: 'Eastern Europe / CIS', emoji: { name: '🇷🇺' } },
  { label: 'Africa & Middle East', value: 'africa_me', description: 'Africa & Middle East', emoji: { name: '🌍' } },
  { label: 'Asia & Oceania', value: 'asia_oceania', description: 'Asia & Oceania', emoji: { name: '🌏' } }
];

const genderOptions = [
  { label: 'Male', value: 'male', description: 'Male', emoji: { name: '♂️' } },
  { label: 'Female', value: 'female', description: 'Female', emoji: { name: '♀️' } },
  { label: 'Other', value: 'other', description: 'Other', emoji: { name: '⚧' } }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configme')
    .setDescription('Set up your language learning profile with dropdowns'),

  async execute(interaction) {
    const lang = await i18n.getUserLang(interaction.user.id);

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config || !config.roles?.member) {
      return await interaction.reply({
        content: '❌ Server not configured yet. Ask an admin to run /setuproles.',
        flags: MessageFlags.Ephemeral
      });
    }

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

module.exports.nativeOptions = nativeOptions;
module.exports.learningOptions = learningOptions;
module.exports.ageOptions = ageOptions;
module.exports.regionOptions = regionOptions;
module.exports.genderOptions = genderOptions;
