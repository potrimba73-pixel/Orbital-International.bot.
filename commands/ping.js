const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),

  async execute(interaction) {
    const lang = await i18n.getUserLang(interaction.user.id);

    const sent = await interaction.reply({ 
      content: i18n.get(lang, 'ping.calculating'), 
      flags: MessageFlags.Ephemeral,
      fetchReply: true 
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle(i18n.get(lang, 'common.pong'))
      .setColor(0x57F287)
      .addFields(
        { name: i18n.get(lang, 'common.bot_latency'), value: `${latency}ms`, inline: true },
        { name: i18n.get(lang, 'common.api_latency'), value: `${apiLatency}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
