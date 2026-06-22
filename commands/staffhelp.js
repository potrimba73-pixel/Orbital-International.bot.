const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffhelp')
    .setDescription('Show staff commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const lang = await i18n.getUserLang(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle(i18n.get(lang, 'staffhelp.title'))
      .setDescription(i18n.get(lang, 'staffhelp.desc'))
      .setColor(0xED4245)
      .addFields(
        { name: i18n.get(lang, 'staffhelp.mod_title'), value: i18n.get(lang, 'staffhelp.mod_cmds'), inline: false },
        { name: i18n.get(lang, 'staffhelp.setup_title'), value: i18n.get(lang, 'staffhelp.setup_cmds'), inline: false },
        { name: i18n.get(lang, 'staffhelp.user_title'), value: i18n.get(lang, 'staffhelp.user_cmds'), inline: false },
        { name: i18n.get(lang, 'staffhelp.bot_title'), value: i18n.get(lang, 'staffhelp.bot_cmds'), inline: false }
      )
      .setFooter({ text: 'Orbital International - Staff Panel' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
