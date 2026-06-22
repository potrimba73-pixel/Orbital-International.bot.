const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show all server IDs (categories, channels, roles)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const lang = await i18n.getUserLang(interaction.user.id);
    const guild = interaction.guild;
    await guild.fetch();

    const categories = guild.channels.cache
      .filter(c => c.type === 4)
      .sort((a, b) => a.position - b.position)
      .map(c => `**${c.name}** \`\`\`
ID: ${c.id}
\`\`\``)
      .join('\n');

    const textChannels = guild.channels.cache
      .filter(c => c.type === 0)
      .sort((a, b) => a.position - b.position)
      .map(c => `<#${c.id}> \`\`\`${c.id}\`\`\``)
      .join('\n');

    const voiceChannels = guild.channels.cache
      .filter(c => c.type === 2)
      .sort((a, b) => a.position - b.position)
      .map(c => `🔊 ${c.name} (limit: ${c.userLimit || '∞'}) \`\`\`${c.id}\`\`\``)
      .join('\n');

    const roles = guild.roles.cache
      .filter(r => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `<@&${r.id}> \`\`\`${r.id}\`\`\` (color: ${r.hexColor})`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📊 ' + i18n.get(lang, 'serverinfo.title', { name: guild.name }))
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor(0x5865F2)
      .addFields(
        { name: '🏠 ' + i18n.get(lang, 'serverinfo.server_id'), value: `\`\`\`${guild.id}\`\`\``, inline: true },
        { name: '👥 ' + i18n.get(lang, 'serverinfo.members'), value: `\`\`\`${guild.memberCount}\`\`\``, inline: true },
        { name: '📅 ' + i18n.get(lang, 'serverinfo.created'), value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📁 ' + i18n.get(lang, 'serverinfo.categories'), value: categories || i18n.get(lang, 'serverinfo.none'), inline: false },
        { name: '💬 ' + i18n.get(lang, 'serverinfo.text_channels'), value: textChannels.substring(0, 1024) || i18n.get(lang, 'serverinfo.none'), inline: false },
        { name: '🔊 ' + i18n.get(lang, 'serverinfo.voice_channels'), value: voiceChannels.substring(0, 1024) || i18n.get(lang, 'serverinfo.none'), inline: false },
        { name: '🎭 ' + i18n.get(lang, 'serverinfo.roles'), value: roles.substring(0, 1024) || i18n.get(lang, 'serverinfo.none'), inline: false }
      )
      .setFooter({ text: i18n.get(lang, 'serverinfo.footer', { tag: interaction.user.tag }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
