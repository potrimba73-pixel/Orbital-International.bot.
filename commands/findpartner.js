const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('findpartner')
    .setDescription('Find a language partner based on your profile'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const myProfile = await UserProfile.findOne({ userId: interaction.user.id });

      if (!myProfile || !myProfile.learningLanguage) {
        return await interaction.editReply({
          content: '❌ You need to set up your profile first! Use `/configme` to set your native and learning languages.',
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

      partners = partners.filter(p => {
        if (p.privacy === 'private') {
          return p.nativeLanguage?.toUpperCase() === myLearning && 
                 p.learningLanguage?.toUpperCase() === myNative;
        }
        return true;
      });

      if (partners.length === 0) {
        return await interaction.editReply({
          content: `🔍 No partners found for **${myLearning}** learners right now.

Your profile: Native **${myNative}** → Learning **${myLearning}**
Try again later or check the language channels!`,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`🤝 Language Partners for You`)
        .setDescription(`Your profile: Native **${myNative}** → Learning **${myLearning}**`)
        .setColor(0x57F287)
        .setFooter({ text: 'Click a button to send a DM request (coming soon!)' });

      const rows = [];
      let currentRow = new ActionRowBuilder();
      let btnCount = 0;

      for (const partner of partners) {
        const partnerNative = partner.nativeLanguage?.toUpperCase() || '?';
        const partnerLearning = partner.learningLanguage?.toUpperCase() || '?';
        const matchType = (partnerNative === myLearning && partnerLearning === myNative) 
          ? '✨ Perfect Match!' 
          : '📚 Same Learning';

        const member = await interaction.guild.members.fetch(partner.userId).catch(() => null);
        const displayName = member ? member.displayName : `User ${partner.userId.slice(-4)}`;

        embed.addFields({
          name: `${matchType}`,
          value: `**${displayName}**
Native: ${partnerNative} | Learning: ${partnerLearning}
Level: ${partner.level || 1} | XP: ${partner.xp || 0}`,
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
        content: '❌ An error occurred while searching for partners.',
      });
    }
  }
};