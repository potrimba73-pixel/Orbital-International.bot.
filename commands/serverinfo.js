const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show all server IDs (categories, channels, roles)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
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
      .setTitle(`📊 ${guild.name} - Server Info`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor(0x5865F2)
      .addFields(
        { name: '🏠 Server ID', value: `\`\`\`${guild.id}\`\`\``, inline: true },
        { name: '👥 Members', value: `\`\`\`${guild.memberCount}\`\`\``, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📁 Categories', value: categories || 'None', inline: false },
        { name: '💬 Text Channels', value: textChannels.substring(0, 1024) || 'None', inline: false },
        { name: '🔊 Voice Channels', value: voiceChannels.substring(0, 1024) || 'None', inline: false },
        { name: '🎭 Roles', value: roles.substring(0, 1024) || 'None', inline: false }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};