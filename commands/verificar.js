const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verificar')
    .setDescription('Check who accepted rules')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const lang = await i18n.getUserLang(interaction.user.id);
    const memberRoleId = process.env.MEMBER_ROLE_ID;

    if (!memberRoleId || memberRoleId === 'your_member_role_id_here') {
      return await interaction.reply({
        content: '❌ ' + i18n.get(lang, 'verificar.not_configured'),
        flags: MessageFlags.Ephemeral
      });
    }

    const members = await interaction.guild.members.fetch();
    const verifiedMembers = members.filter(m => m.roles.cache.has(memberRoleId));
    const unverifiedMembers = members.filter(m => !m.roles.cache.has(memberRoleId) && !m.user.bot);

    const embed = new EmbedBuilder()
      .setTitle('✅ ' + i18n.get(lang, 'verificar.title'))
      .setColor(0x57F287)
      .addFields(
        { name: '✅ ' + i18n.get(lang, 'verificar.verified'), value: i18n.get(lang, 'verificar.verified_count', { count: verifiedMembers.size }), inline: true },
        { name: '⏳ ' + i18n.get(lang, 'verificar.unverified'), value: i18n.get(lang, 'verificar.unverified_count', { count: unverifiedMembers.size }), inline: true },
        { name: i18n.get(lang, 'verificar.unverified_users'), value: unverifiedMembers.size > 0 ? unverifiedMembers.map(m => m.user.tag).join('\n').substring(0, 1024) : i18n.get(lang, 'verificar.all_verified') }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
