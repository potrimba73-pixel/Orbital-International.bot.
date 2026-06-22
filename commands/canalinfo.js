const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const i18n = require('../utils/i18n');

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
    const lang = await i18n.getUserLang(interaction.user.id);
    const channel = interaction.options.getChannel('channel');

    if (channel.type !== 2) {
      return await interaction.reply({
        content: '❌ ' + i18n.get(lang, 'canalinfo.not_voice'),
        flags: MessageFlags.Ephemeral
      });
    }

    const members = channel.members.map(m => m.user.tag).join('\n') || i18n.get(lang, 'canalinfo.empty');

    const embed = new EmbedBuilder()
      .setTitle('🔊 ' + i18n.get(lang, 'canalinfo.title', { name: channel.name }))
      .setColor(0x5865F2)
      .addFields(
        { name: '🆔 ' + i18n.get(lang, 'canalinfo.channel_id'), value: '`' + channel.id + '`', inline: true },
        { name: '👥 ' + i18n.get(lang, 'canalinfo.user_limit'), value: String(channel.userLimit || '∞'), inline: true },
        { name: '👤 ' + i18n.get(lang, 'canalinfo.members'), value: members.substring(0, 1024) }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
