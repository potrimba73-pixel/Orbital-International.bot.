const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top learners leaderboard'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const topUsers = await UserProfile.find()
        .sort({ xp: -1 })
        .limit(10);

      if (topUsers.length === 0) {
        return await interaction.editReply({
          content: '🔍 No stats yet! Start chatting to earn XP.'
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 Top Learners')
        .setColor(0xFFD700)
        .setDescription('Anonymous leaderboard - no personal data exposed!')
        .setFooter({ text: 'Updated in real-time' });

      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
        const displayName = member ? member.displayName : `Anonymous ${i + 1}`;

        embed.addFields({
          name: `${medals[i] || '🔹'} ${displayName}`,
          value: `Level ${user.level || 1} • ${user.xp || 0} XP • ${user.messagesSent || 0} messages`,
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Leaderboard error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while fetching the leaderboard.'
      });
    }
  }
};