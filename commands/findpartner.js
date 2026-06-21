const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');
const i18n = require('../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('findpartner')
    .setDescription('Find a language partner based on your profile'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const lang = await i18n.getUserLang(interaction.user.id);

    try {
      const myProfile = await UserProfile.findOne({ userId: interaction.user.id });

      if (!myProfile || !myProfile.learningLanguage) {
        return await interaction.editReply({
          content: '❌ ' + i18n.get(lang, 'findpartner.no_profile'),
        });
      }

      const myNative = myProfile.nativeLanguage?.toUpperCase() || 'EN';
      const myLearning = myProfile.learningLanguage?.toUpperCase() || 'PT';

      let partners = await UserProfile.find({
        userId: { $ne: interaction.user.id },
        $or: [
          { nativeLanguage: myLearning, learningLanguage: myNative },
          { learningLanguage: myLearning }
        ]
      }).limit(10);

      if (partners.length === 0) {
        return await interaction.editReply({
          content: '🔍 ' + i18n.get(lang, 'findpartner.no_partners', { native: myNative, learning: myLearning }),
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🤝 ' + i18n.get(lang, 'findpartner.title'))
        .setDescription(i18n.get(lang, 'findpartner.your_profile', { native: myNative, learning: myLearning }))
        .setColor(0x57F287)
        .setFooter({ text: i18n.get(lang, 'findpartner.coming_soon') });

      const rows = [];
      let currentRow = new ActionRowBuilder();
      let btnCount = 0;

      for (const partner of partners) {
        const partnerNative = partner.nativeLanguage?.toUpperCase() || '?';
        const partnerLearning = partner.learningLanguage?.toUpperCase() || '?';
        const matchType = (partnerNative === myLearning && partnerLearning === myNative) 
          ? '✨ ' + i18n.get(lang, 'findpartner.perfect_match') 
          : '📚 ' + i18n.get(lang, 'findpartner.same_learning');

        let member = interaction.guild.members.cache.get(partner.userId);
        if (!member) {
          member = await interaction.guild.members.fetch(partner.userId).catch(() => null);
        }
        const displayName = member ? member.displayName : `User ${partner.userId.slice(-4)}`;

        embed.addFields({
          name: `${matchType}`,
          value: `**${displayName}**
${i18n.get(lang, 'findpartner.native', { lang: partnerNative })} | ${i18n.get(lang, 'findpartner.learning', { lang: partnerLearning })}
${i18n.get(lang, 'findpartner.level', { level: partner.level || 1 })} | ${i18n.get(lang, 'findpartner.xp', { xp: partner.xp || 0 })}`,
          inline: true
        });

        if (btnCount < 25) {
          if (currentRow.components.length >= 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
          }

          currentRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`partner_${partner.userId}`)
              .setLabel(`${displayName.substring(0, 20)}`)
              .setStyle(ButtonStyle.Primary)
              .setEmoji('💬')
          );
          btnCount++;
        }
      }

      if (currentRow.components.length > 0) {
        rows.push(currentRow);
      }

      await interaction.editReply({
        embeds: [embed],
        components: rows.length > 0 ? rows : undefined
      });

    } catch (error) {
      console.error('Find partner error:', error);
      await interaction.editReply({
        content: '❌ ' + i18n.get(lang, 'common.error'),
      });
    }
  }
};
