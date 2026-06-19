const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mystats')
    .setDescription('Show your anonymous stats'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const profile = await UserProfile.findOne({ userId: interaction.user.id });

      if (!profile) {
        return await interaction.editReply({
          content: '❌ No stats found! Use `/configme` to set up your profile first.'
        });
      }

      const xpNeeded = profile.level * 100;
      const xpProgress = profile.xp || 0;
      const progressPercent = Math.min(100, Math.round((xpProgress / xpNeeded) * 100));
      const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));

      const embed = new EmbedBuilder()
        .setTitle('📊 Your Stats')
        .setColor(0x5865F2)
        .addFields(
          { name: '⭐ Current Level', value: `${profile.level || 1}`, inline: true },
          { name: '📈 Total XP', value: `${profile.xp || 0}`, inline: true },
          { name: '🎯 Next Level', value: `${xpProgress}/${xpNeeded} XP`, inline: true },
          { name: 'Progress', value: `${progressBar} ${progressPercent}%`, inline: false },
          { name: '💬 Messages Sent', value: `${profile.messagesSent || 0}`, inline: true },
          { name: '🎤 Voice Minutes', value: `${profile.voiceMinutes || 0}`, inline: true },
          { name: '🗣️ Native Language', value: (profile.nativeLanguage || 'EN').toUpperCase(), inline: true },
          { name: '📚 Learning Language', value: (profile.learningLanguage || 'PT').toUpperCase(), inline: true }
        )
        .setFooter({ text: 'Keep chatting to earn more XP!' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Mystats error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while fetching your stats.'
      });
    }
  }
};