const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show detailed user information')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return await interaction.reply({ 
        content: '❌ User not found in this server.',
        flags: 64 
      });
    }

    let profile = null;
    try {
      profile = await UserProfile.findOne({ userId: target.id });
    } catch (e) {
      console.error('Database error in userinfo:', e.message);
    }

    const ageRole = member.roles.cache.find(r => /\d+\+/.test(r.name));
    const languageRoles = member.roles.cache
      .filter(r => ['PT', 'EN', 'RU', 'ES', 'FR', 'DE', 'IT', 'JA'].includes(r.name.toUpperCase()))
      .map(r => r.name.toUpperCase())
      .join(', ') || 'None';

    const learningLang = profile?.learningLanguage ? 
      profile.learningLanguage.toUpperCase() : 'Not set (use /configme)';
    const nativeLang = profile?.nativeLanguage ? 
      profile.nativeLanguage.toUpperCase() : 'Not set (use /configme)';
    const privacy = profile?.privacy || 'public';
    const privacyEmoji = privacy === 'private' ? '🔒 Private' : '🌐 Public';

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setColor(member.displayColor || 0x5865F2)
      .addFields(
        { name: '🆔 User ID', value: `\`\`\`${target.id}\`\`\``, inline: true },
        { name: '📅 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🎂 Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🎭 Age Role', value: ageRole ? `${ageRole.name} (<@&${ageRole.id}>)` : 'None', inline: true },
        { name: '🗣️ Language Roles', value: languageRoles, inline: true },
        { name: '🌍 Profile Privacy', value: privacyEmoji, inline: true },
        { name: '📚 Native Language', value: nativeLang, inline: true },
        { name: '🎯 Learning Language', value: learningLang, inline: true },
        { name: '⭐ XP Level', value: profile ? `Level ${profile.level || 1} (${profile.xp || 0} XP)` : 'No data', inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};