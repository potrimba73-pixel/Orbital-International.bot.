const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configme')
    .setDescription('Set up your language learning profile'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('configme_modal')
      .setTitle('🌍 Language Profile Setup');

    const nativeInput = new TextInputBuilder()
      .setCustomId('native_language')
      .setLabel('Your native language (e.g., PT, EN, RU)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('PT')
      .setRequired(true)
      .setMaxLength(2);

    const learningInput = new TextInputBuilder()
      .setCustomId('learning_language')
      .setLabel('Language you want to learn (e.g., EN, ES, FR)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('EN')
      .setRequired(true)
      .setMaxLength(2);

    const ageInput = new TextInputBuilder()
      .setCustomId('age_group')
      .setLabel('Your age group (e.g., 18+, 21+, 25+)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('18+')
      .setRequired(false)
      .setMaxLength(5);

    const privacyInput = new TextInputBuilder()
      .setCustomId('privacy_setting')
      .setLabel('Profile visibility: public or private?')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('public')
      .setRequired(false)
      .setMaxLength(10);

    const bioInput = new TextInputBuilder()
      .setCustomId('bio')
      .setLabel('Short bio (optional)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('I love learning languages!')
      .setRequired(false)
      .setMaxLength(200);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nativeInput),
      new ActionRowBuilder().addComponents(learningInput),
      new ActionRowBuilder().addComponents(ageInput),
      new ActionRowBuilder().addComponents(privacyInput),
      new ActionRowBuilder().addComponents(bioInput)
    );

    await interaction.showModal(modal);
  }
};