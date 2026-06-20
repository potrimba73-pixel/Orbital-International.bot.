// commands/serverroles.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverroles')
    .setDescription('Show all roles with their IDs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.roles.fetch();

    const roles = guild.roles.cache
      .filter(r => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => {
        const members = r.members.size;
        return `**${r.name}**\nID: \`${r.id}\`\nMembers: ${members}\nColor: ${r.hexColor}`;
      });

    // Split into chunks of 10 roles per embed
    const chunks = [];
    for (let i = 0; i < roles.length; i += 10) {
      chunks.push(roles.slice(i, i + 10));
    }

    if (chunks.length === 0) {
      return await interaction.reply({
        content: 'No roles found!',
        flags: 64
      });
    }

    const embeds = chunks.map((chunk, index) => {
      return new EmbedBuilder()
        .setTitle(index === 0 ? '🎭 Server Roles' : `🎭 Server Roles (${index + 1}/${chunks.length})`)
        .setDescription(chunk.join('\n\n'))
        .setColor(0x5865F2)
        .setFooter({ text: `Total: ${roles.length} roles | Server: ${guild.name}` })
        .setTimestamp();
    });

    await interaction.reply({ embeds: [embeds[0]], flags: 64 });

    // Send remaining embeds as follow-ups
    for (let i = 1; i < embeds.length; i++) {
      await interaction.followUp({ embeds: [embeds[i]], flags: 64 });
    }
  }
};
