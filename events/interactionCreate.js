const { Events, InteractionType, MessageFlags } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);

        if (interaction.replied || interaction.deferred) {
          try {
            await interaction.followUp({ 
              content: 'There was an error executing this command!', 
              flags: MessageFlags.Ephemeral 
            });
          } catch (e) {
            console.error('Failed to send followUp:', e.message);
          }
        } else {
          try {
            await interaction.reply({ 
              content: 'There was an error executing this command!', 
              flags: MessageFlags.Ephemeral 
            });
          } catch (e) {
            console.error('Failed to send reply:', e.message);
          }
        }
      }
    }

    // Handle modals (configme)
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'configme_modal') {
        try {
          const nativeLang = interaction.fields.getTextInputValue('native_language').toLowerCase();
          const learningLang = interaction.fields.getTextInputValue('learning_language').toLowerCase();
          const ageGroup = interaction.fields.getTextInputValue('age_group') || '';
          const privacy = interaction.fields.getTextInputValue('privacy_setting')?.toLowerCase() || 'public';
          const bio = interaction.fields.getTextInputValue('bio') || '';

          const validLangs = ['pt', 'en', 'ru', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh'];
          if (!validLangs.includes(nativeLang) || !validLangs.includes(learningLang)) {
            return await interaction.reply({
              content: '❌ Invalid language code. Use: PT, EN, RU, ES, FR, DE, IT, JA, KO, ZH',
              flags: MessageFlags.Ephemeral
            });
          }

          const validPrivacy = ['public', 'private'];
          const finalPrivacy = validPrivacy.includes(privacy) ? privacy : 'public';

          await UserProfile.findOneAndUpdate(
            { userId: interaction.user.id },
            {
              userId: interaction.user.id,
              username: interaction.user.username,
              nativeLanguage: nativeLang,
              learningLanguage: learningLang,
              language: nativeLang,
              ageGroup: ageGroup,
              privacy: finalPrivacy,
              bio: bio,
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );

          await interaction.reply({
            embeds: [{
              title: '✅ Profile Updated!',
              color: 0x57F287,
              fields: [
                { name: '🗣️ Native Language', value: nativeLang.toUpperCase(), inline: true },
                { name: '📚 Learning Language', value: learningLang.toUpperCase(), inline: true },
                { name: '🔒 Privacy', value: finalPrivacy === 'private' ? '🔒 Private' : '🌐 Public', inline: true },
                { name: '🎂 Age Group', value: ageGroup || 'Not set', inline: true },
                { name: '📝 Bio', value: bio || 'Not set', inline: false }
              ],
              footer: { text: 'Use /findpartner to find language partners!' }
            }],
            flags: MessageFlags.Ephemeral
          });

        } catch (error) {
          console.error('Configme modal error:', error);
          await interaction.reply({
            content: '❌ Failed to save profile. Please try again.',
            flags: MessageFlags.Ephemeral
          });
        }
      }
    }

    // Handle buttons
    if (interaction.isButton()) {
      try {
        if (!interaction.isRepliable()) return;

        if (interaction.customId === 'verify_member') {
          const memberRoleId = process.env.MEMBER_ROLE_ID;
          if (!memberRoleId || memberRoleId === 'your_member_role_id_here') {
            return await interaction.reply({
              content: '❌ Member role not configured. Contact a Staff member.',
              flags: MessageFlags.Ephemeral
            });
          }

          const memberRole = interaction.guild.roles.cache.get(memberRoleId);
          if (!memberRole) {
            return await interaction.reply({
              content: '❌ Member role not found. Contact a Staff member.',
              flags: MessageFlags.Ephemeral
            });
          }

          if (interaction.member.roles.cache.has(memberRoleId)) {
            return await interaction.reply({
              content: '✅ You already have the Member role!',
              flags: MessageFlags.Ephemeral
            });
          }

          await interaction.member.roles.add(memberRole);
          await interaction.reply({
            content: '✅ You have been verified! Welcome to Orbital International!',
            flags: MessageFlags.Ephemeral
          });
        }
      } catch (error) {
        console.error('Button interaction error:', error.message);
      }
    }
  }
};