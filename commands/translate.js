const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const translate = require('@iamtraction/google-translate');

const languages = {
  'pt': 'Português', 'en': 'English', 'ru': 'Russian', 
  'es': 'Español', 'fr': 'Français', 'de': 'Deutsch',
  'it': 'Italiano', 'ja': 'Japanese', 'ko': 'Korean',
  'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text between languages')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to translate')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('to')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(
          { name: '🇵🇹 Português', value: 'pt' },
          { name: '🇬🇧 English', value: 'en' },
          { name: '🇷🇺 Russian', value: 'ru' },
          { name: '🇪🇸 Español', value: 'es' },
          { name: '🇫🇷 Français', value: 'fr' },
          { name: '🇩🇪 Deutsch', value: 'de' },
          { name: '🇮🇹 Italiano', value: 'it' },
          { name: '🇯🇵 Japanese', value: 'ja' },
          { name: '🇰🇷 Korean', value: 'ko' },
          { name: '🇨🇳 Chinese', value: 'zh' },
          { name: '🇸🇦 Arabic', value: 'ar' },
          { name: '🇮🇳 Hindi', value: 'hi' }
        ))
    .addStringOption(option =>
      option.setName('from')
        .setDescription('Source language (auto-detect if not specified)')
        .setRequired(false)
        .addChoices(
          { name: '🇵🇹 Português', value: 'pt' },
          { name: '🇬🇧 English', value: 'en' },
          { name: '🇷🇺 Russian', value: 'ru' },
          { name: '🇪🇸 Español', value: 'es' },
          { name: '🇫🇷 Français', value: 'fr' },
          { name: '🇩🇪 Deutsch', value: 'de' },
          { name: '🇮🇹 Italiano', value: 'it' },
          { name: '🇯🇵 Japanese', value: 'ja' },
          { name: '🇰🇷 Korean', value: 'ko' },
          { name: '🇨🇳 Chinese', value: 'zh' },
          { name: '🇸🇦 Arabic', value: 'ar' },
          { name: '🇮🇳 Hindi', value: 'hi' }
        )),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    const to = interaction.options.getString('to');
    const from = interaction.options.getString('from');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const result = await translate(text, { 
        to: to, 
        from: from || 'auto' 
      });

      const detectedLang = from ? languages[from] || from.toUpperCase() : 
                           languages[result.from.language.iso] || result.from.language.iso.toUpperCase();
      const targetLang = languages[to] || to.toUpperCase();

      await interaction.editReply({
        embeds: [{
          title: '🌐 Translation',
          color: 0x5865F2,
          fields: [
            { 
              name: `📤 Original (${detectedLang})`, 
              value: text.substring(0, 1024) 
            },
            { 
              name: `📥 Translation (${targetLang})`, 
              value: result.text.substring(0, 1024) 
            }
          ],
          footer: { text: 'Powered by Google Translate' }
        }]
      });
    } catch (error) {
      console.error('Translation error:', error);
      await interaction.editReply({
        content: '❌ Translation failed. Please try again later.'
      });
    }
  }
};