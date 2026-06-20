const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const translate = require('@iamtraction/google-translate');

const languages = {
  'pt': '🇵🇹 Português',
  'en': '🇬🇧 English',
  'ru': '🇷🇺 Russian',
  'es': '🇪🇸 Español',
  'fr': '🇫🇷 Français'
};

// Helper para corrigir deteção automática de português
function fixPortugueseDetection(text, detectedIso) {
  const lower = text.toLowerCase().trim();

  // Se o Google detetou algo que não é PT, mas o texto tem caracteres típicos do português
  if (detectedIso !== 'pt') {
    // Palavras/comuns caracteres do português
    const ptIndicators = [
      'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite',
      'obrigado', 'obrigada', 'por favor', 'desculpe',
      'sim', 'nao', 'não', 'talvez', 'claro',
      'como', 'esta', 'está', 'esta', 'estas', 'estás',
      'voce', 'você', 'vc', 'tb', 'também', 'tambem',
      'muito', 'mt', 'bem', 'mal', 'mais', 'menos',
      'quando', 'onde', 'porque', 'porquê', 'por que',
      'aqui', 'ali', 'la', 'lá', 'ca', 'cá',
      'tudo', 'nada', 'algo', 'alguem', 'alguém',
      'hoje', 'ontem', 'amanha', 'amanhã', 'sempre', 'nunca',
      'gosto', 'quero', 'preciso', 'tenho', 'sou', 'estou',
      'fazer', 'faz', 'fez', 'fiz', 'fizemos',
      'casa', 'carro', 'rua', 'trabalho', 'escola',
      'amigo', 'amiga', 'pessoa', 'coisa', 'tempo',
      'portugal', 'português', 'portugues', 'tuga',
      'então', 'entao', 'depois', 'antes', 'agora',
      'mesmo', 'assim', 'assim', 'também', 'tambem',
      'só', 'so', 'ja', 'já', 'ainda', 'sempre',
      'muitos', 'poucos', 'todos', 'alguns',
      'grande', 'pequeno', 'bom', 'boa', 'mau', 'má',
      'novo', 'nova', 'velho', 'velha', 'bonito', 'bonita',
      'br', 'brasil', 'brasileiro',
      'q', 'qlq', 'qlqr', 'qualquer',
      'pq', 'qnd', 'qdo', 'cmg', 'ctg', 'vc', 'tb', 'tbm',
      'kkk', 'kkkk', 'haha', 'hehe', 'rsrs',
      'ç', 'ã', 'õ', 'á', 'é', 'í', 'ó', 'ú', 'â', 'ê', 'ô'
    ];

    // Verifica se algum indicador está presente
    const hasPtIndicator = ptIndicators.some(ind => lower.includes(ind));

    // Se tem indicadores de PT e o texto é curto (menos propenso a falsos positivos)
    if (hasPtIndicator && text.length < 200) {
      return 'pt';
    }

    // Se tem acentos típicos do português e é texto curto
    const ptAccents = /[çãõáéíóúâêô]/i;
    if (ptAccents.test(text) && text.length < 100) {
      return 'pt';
    }
  }

  return detectedIso;
}

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
          { name: '🇫🇷 Français', value: 'fr' }
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
          { name: '🇫🇷 Français', value: 'fr' }
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

      // Corrige deteção automática se necessário
      let detectedIso = from ? from : result.from.language.iso;
      if (!from) {
        detectedIso = fixPortugueseDetection(text, detectedIso);
      }

      const detectedLang = languages[detectedIso] || detectedIso.toUpperCase();
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
