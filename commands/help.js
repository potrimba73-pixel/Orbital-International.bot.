const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help menu'),

  async execute(interaction) {
    let lang = 'en';

    try {
      const profile = await UserProfile.findOne({ userId: interaction.user.id });
      if (profile && profile.nativeLanguage) {
        lang = profile.nativeLanguage;
      }
    } catch (e) {
      // Database error, use default English
    }

    const embed = new EmbedBuilder()
      .setTitle('🌍 ' + i18n.get(lang, 'help.title'))
      .setDescription(i18n.get(lang, 'help.desc'))
      .setColor(0x5865F2)
      .addFields(
        { name: '🎓 ' + i18n.get(lang, 'help.language_title'), value: i18n.get(lang, 'help.language_desc'), inline: false },
        { name: '📊 ' + i18n.get(lang, 'help.stats_title'), value: i18n.get(lang, 'help.stats_desc'), inline: false },
        { name: '⚙️ ' + i18n.get(lang, 'help.general_title'), value: i18n.get(lang, 'help.general_desc'), inline: false }
      )
      .setFooter({ text: i18n.get(lang, 'help.footer') })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
