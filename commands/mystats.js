const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mystats')
    .setDescription('Show your anonymous stats'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const lang = await i18n.getUserLang(interaction.user.id);

    try {
      const profile = await UserProfile.findOne({ userId: interaction.user.id });

      if (!profile) {
        return await interaction.editReply({
          content: '❌ ' + i18n.get(lang, 'mystats.no_stats')
        });
      }

      const xpNeeded = profile.level * 100;
      const xpProgress = profile.xp || 0;
      const progressPercent = Math.min(100, Math.round((xpProgress / xpNeeded) * 100));
      const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));

      const embed = new EmbedBuilder()
        .setTitle('📊 ' + i18n.get(lang, 'mystats.title'))
        .setColor(0x5865F2)
        .addFields(
          { name: '⭐ ' + i18n.get(lang, 'mystats.level'), value: `${profile.level || 1}`, inline: true },
          { name: '📈 ' + i18n.get(lang, 'mystats.xp'), value: `${profile.xp || 0}`, inline: true },
          { name: '🎯 ' + i18n.get(lang, 'mystats.next_level'), value: `${xpProgress}/${xpNeeded} XP`, inline: true },
          { name: i18n.get(lang, 'mystats.progress'), value: `${progressBar} ${progressPercent}%`, inline: false },
          { name: '💬 ' + i18n.get(lang, 'mystats.messages'), value: `${profile.messagesSent || 0}`, inline: true },
          { name: '🎤 ' + i18n.get(lang, 'mystats.voice'), value: `${profile.voiceMinutes || 0}`, inline: true },
          { name: '🗣️ ' + i18n.get(lang, 'mystats.native'), value: (profile.nativeLanguage || 'EN').toUpperCase(), inline: true },
          { name: '📚 ' + i18n.get(lang, 'mystats.learning'), value: (profile.learningLanguage || 'PT').toUpperCase(), inline: true }
        )
        .setFooter({ text: i18n.get(lang, 'mystats.footer') })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Mystats error:', error);
      await interaction.editReply({
        content: '❌ ' + i18n.get(lang, 'common.error')
      });
    }
  }
};
