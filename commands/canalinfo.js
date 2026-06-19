const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('canalinfo')
    .setDescription('Voice channel info')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Voice channel to check')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (channel.type !== 2) {
      return await interaction.reply({
        content: 'This is not a voice channel!',
        flags: 64
      });
    }

    const members = channel.members.map(m => m.user.tag).join('\n') || 'Empty';

    const embed = new EmbedBuilder()
      .setTitle(channel.name)
      .setColor(0x5865F2)
      .addFields(
        { name: 'Channel ID', value: channel.id, inline: true },
        { name: 'User Limit', value: String(channel.userLimit || '∞'), inline: true },
        { name: 'Members', value: members.substring(0, 1024) }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};
