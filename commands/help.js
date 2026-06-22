const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands'),

  async execute(interaction) {
    const lang = await i18n.getUserLang(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle(i18n.get(lang, 'help.title'))
      .setDescription(i18n.get(lang, 'help.desc'))
      .setColor(0x5865F2)
      .addFields(
        { name: i18n.get(lang, 'help.lang_title'), value: i18n.get(lang, 'help.lang_cmds'), inline: false },
        { name: i18n.get(lang, 'help.social_title'), value: i18n.get(lang, 'help.social_cmds'), inline: false },
        { name: i18n.get(lang, 'help.utils_title'), value: i18n.get(lang, 'help.utils_cmds'), inline: false }
      )
      .setFooter({ text: 'Orbital International - Help' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
