const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verificar')
    .setDescription('Check who accepted rules')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const memberRoleId = process.env.MEMBER_ROLE_ID;
    
    if (!memberRoleId || memberRoleId === 'your_member_role_id_here') {
      return await interaction.reply({
        content: '❌ Member role not configured.',
        flags: 64
      });
    }

    const members = await interaction.guild.members.fetch();
    const verifiedMembers = members.filter(m => m.roles.cache.has(memberRoleId));
    const unverifiedMembers = members.filter(m => !m.roles.cache.has(memberRoleId) && !m.user.bot);

    const embed = new EmbedBuilder()
      .setTitle('✅ Verification Status')
      .setColor(0x57F287)
      .addFields(
        { name: '✅ Verified', value: verifiedMembers.size + ' members', inline: true },
        { name: '⏳ Unverified', value: unverifiedMembers.size + ' members', inline: true },
        { name: 'Unverified Users', value: unverifiedMembers.size > 0 ? unverifiedMembers.map(m => m.user.tag).join('\n').substring(0, 1024) : 'All verified!' }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};
