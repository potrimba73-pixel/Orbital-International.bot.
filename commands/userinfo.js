const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');
const i18n = require('../utils/i18n');

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
    const lang = await i18n.getUserLang(interaction.user.id);
    const target = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return await interaction.reply({ 
        content: '❌ ' + i18n.get(lang, 'userinfo.not_found'),
        flags: MessageFlags.Ephemeral 
      });
    }

    let profile = null;
    try {
      profile = await UserProfile.findOne({ userId: target.id });
    } catch (e) {
      console.error('Database error in userinfo:', e.message);
    }

    const ageRole = member.roles.cache.find(r => /\d+-\d+/.test(r.name));
    const languageRoles = member.roles.cache
      .filter(r => ['PT', 'EN', 'RU', 'ES', 'FR', 'DE', 'IT', 'JA'].includes(r.name.toUpperCase()))
      .map(r => r.name.toUpperCase())
      .join(', ') || i18n.get(lang, 'userinfo.none');

    const learningLang = profile?.learningLanguage ? 
      profile.learningLanguage.toUpperCase() : i18n.get(lang, 'userinfo.not_set');
    const nativeLang = profile?.nativeLanguage ? 
      profile.nativeLanguage.toUpperCase() : i18n.get(lang, 'userinfo.not_set');
    const privacy = profile?.privacy || 'public';
    const privacyEmoji = privacy === 'private' ? '🔒 ' + i18n.get(lang, 'userinfo.privacy_private') : '🌐 ' + i18n.get(lang, 'userinfo.privacy_public');

    const embed = new EmbedBuilder()
      .setTitle('👤 ' + i18n.get(lang, 'userinfo.title', { tag: target.tag }))
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setColor(member.displayColor || 0x5865F2)
      .addFields(
        { name: '🆔 ' + i18n.get(lang, 'userinfo.user_id'), value: `\`\`\`${target.id}\`\`\``, inline: true },
        { name: '📅 ' + i18n.get(lang, 'userinfo.joined'), value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🎂 ' + i18n.get(lang, 'userinfo.created'), value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🎭 ' + i18n.get(lang, 'userinfo.age_role'), value: ageRole ? `${ageRole.name} (<@&${ageRole.id}>)` : i18n.get(lang, 'userinfo.none'), inline: true },
        { name: '🗣️ ' + i18n.get(lang, 'userinfo.lang_roles'), value: languageRoles, inline: true },
        { name: '🌍 ' + i18n.get(lang, 'userinfo.privacy'), value: privacyEmoji, inline: true },
        { name: '📚 ' + i18n.get(lang, 'userinfo.native'), value: nativeLang, inline: true },
        { name: '🎯 ' + i18n.get(lang, 'userinfo.learning'), value: learningLang, inline: true },
        { name: '⭐ ' + i18n.get(lang, 'userinfo.xp_level'), value: profile ? `Level ${profile.level || 1} (${profile.xp || 0} XP)` : i18n.get(lang, 'userinfo.no_data'), inline: true }
      )
      .setFooter({ text: i18n.get(lang, 'userinfo.footer', { tag: interaction.user.tag }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
