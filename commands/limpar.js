const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('limpar')
    .setDescription('Clear messages')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to clear (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const lang = await i18n.getUserLang(interaction.user.id);

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({
        content: '✅ ' + i18n.get(lang, 'limpar.cleared', { count: deleted.size }),
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      await interaction.reply({
        content: '❌ ' + i18n.get(lang, 'limpar.failed'),
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
