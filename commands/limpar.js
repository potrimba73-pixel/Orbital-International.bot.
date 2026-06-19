const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

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

    await interaction.channel.bulkDelete(amount, true).catch(() => {
      return interaction.reply({
        content: '❌ Could not delete messages. They may be older than 14 days.',
        flags: MessageFlags.Ephemeral
      });
    });

    await interaction.reply({
      content: `✅ Cleared ${amount} messages.`,
      flags: MessageFlags.Ephemeral
    });
  }
};