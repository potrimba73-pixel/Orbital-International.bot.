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
          content: 'No profile found. Please run /configme first.',
        });
      }

      const myNative = (myProfile.nativeLanguage || 'en').toLowerCase();
      const myLearning = (myProfile.learningLanguage || 'pt').toLowerCase();

      let partners = await UserProfile.find({
        userId: { $ne: interaction.user.id },
        $or: [
          {
            nativeLanguage: { $regex: new RegExp('^' + myLearning + '$', 'i') },
            learningLanguage: { $regex: new RegExp('^' + myNative + '$', 'i') }
          },
          {
            learningLanguage: { $regex: new RegExp('^' + myLearning + '$', 'i') }
          }
        ]
      }).limit(10);

      const guildMembers = await interaction.guild.members.fetch();
      const guildMemberIds = new Set(guildMembers.keys());

      partners = partners.filter(p => guildMemberIds.has(p.userId));

      if (partners.length === 0) {
        return await interaction.editReply({
          content: 'No partners found matching your profile.',
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('Language Partners Found')
        .setDescription('Your profile: Native ' + myNative.toUpperCase() + ', Learning ' + myLearning.toUpperCase())
        .setColor(0x57F287);

      const rows = [];
      let currentRow = new ActionRowBuilder();
      let btnCount = 0;

      for (const partner of partners) {
        const partnerNative = (partner.nativeLanguage || '?').toUpperCase();
        const partnerLearning = (partner.learningLanguage || '?').toUpperCase();
        const matchType = (partnerNative === myLearning.toUpperCase() && partnerLearning === myNative.toUpperCase())
          ? 'Perfect Match'
          : 'Same Learning';

        const member = guildMembers.get(partner.userId);
        const displayName = member ? member.displayName : 'User ' + partner.userId.slice(-4);

        embed.addFields({
          name: matchType,
          value: '**' + displayName + '**
' +
            'Native: ' + partnerNative + ' | Learning: ' + partnerLearning + '
' +
            'Level: ' + (partner.level || 1) + ' | XP: ' + (partner.xp || 0),
          inline: true
        });

        if (btnCount < 25) {
          if (currentRow.components.length >= 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
          }

          currentRow.addComponents(
            new ButtonBuilder()
              .setCustomId('partner_' + partner.userId)
              .setLabel(displayName.substring(0, 20))
              .setStyle(ButtonStyle.Primary)
              .setEmoji('')
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
        content: 'An error occurred while finding partners.',
      });
    }
  }
};
