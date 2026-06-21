const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top learners leaderboard'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const lang = await i18n.getUserLang(interaction.user.id);

    try {
      const topUsers = await UserProfile.find()
        .sort({ xp: -1 })
        .limit(10);

      if (topUsers.length === 0) {
        return await interaction.editReply({
          content: '🔍 ' + i18n.get(lang, 'leaderboard.no_stats')
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 ' + i18n.get(lang, 'leaderboard.title'))
        .setColor(0xFFD700)
        .setDescription(i18n.get(lang, 'leaderboard.desc'))
        .setFooter({ text: i18n.get(lang, 'leaderboard.footer') });

      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        let member = interaction.guild.members.cache.get(user.userId);
        if (!member) {
          member = await interaction.guild.members.fetch(user.userId).catch(() => null);
        }
        const displayName = member ? member.displayName : `Anonymous ${i + 1}`;

        embed.addFields({
          name: `${medals[i] || '🔹'} ${displayName}`,
          value: `${i18n.get(lang, 'leaderboard.level', { level: user.level || 1 })} • ${user.xp || 0} XP • ${i18n.get(lang, 'leaderboard.messages', { count: user.messagesSent || 0 })}`,
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Leaderboard error:', error);
      await interaction.editReply({
        content: '❌ ' + i18n.get(lang, 'common.error')
      });
    }
  }
};
