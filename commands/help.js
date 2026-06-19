const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserProfile = require('../utils/models/UserProfile');

const translations = {
  en: {
    title: '🌍 Orbital International - Help',
    desc: 'Anonymous language learning community',
    language: '🎓 Language Learning',
    language_desc: '`/configme` - Set up your language profile
`/translate` - Translate text between languages
`/findpartner` - Find a language exchange partner',
    stats: '📊 Stats',
    stats_desc: '`/mystats` - Your anonymous stats
`/leaderboard` - Top learners leaderboard',
    general: '⚙️ General',
    general_desc: '`/help` - This menu
`/ping` - Bot latency',
    footer: 'Use /configme to set your language! | Staff: use /staffhelp'
  },
  pt: {
    title: '🌍 Orbital International - Ajuda',
    desc: 'Comunidade anónima de aprendizagem de línguas',
    language: '🎓 Aprendizagem de Línguas',
    language_desc: '`/configme` - Configura o teu perfil de língua
`/translate` - Traduz texto entre línguas
`/findpartner` - Encontra um parceiro de intercâmbio',
    stats: '📊 Estatísticas',
    stats_desc: '`/mystats` - As tuas estatísticas anónimas
`/leaderboard` - Classificação dos melhores',
    general: '⚙️ Geral',
    general_desc: '`/help` - Este menu
`/ping` - Latência do bot',
    footer: 'Usa /configme para definires a tua língua! | Staff: usa /staffhelp'
  },
  ru: {
    title: '🌍 Orbital International - Помощь',
    desc: 'Анонимное сообщество изучения языков',
    language: '🎓 Изучение Языков',
    language_desc: '`/configme` - Настройка языкового профиля
`/translate` - Перевод текста
`/findpartner` - Найти языкового партнера',
    stats: '📊 Статистика',
    stats_desc: '`/mystats` - Ваша анонимная статистика
`/leaderboard` - Таблица лидеров',
    general: '⚙️ Общее',
    general_desc: '`/help` - Это меню
`/ping` - Задержка бота',
    footer: 'Используйте /configme для настройки языка! | Staff: /staffhelp'
  },
  es: {
    title: '🌍 Orbital International - Ayuda',
    desc: 'Comunidad anónima de aprendizaje de idiomas',
    language: '🎓 Aprendizaje de Idiomas',
    language_desc: '`/configme` - Configurar perfil de idioma
`/translate` - Traducir texto
`/findpartner` - Encontrar compañero de intercambio',
    stats: '📊 Estadísticas',
    stats_desc: '`/mystats` - Tus estadísticas anónimas
`/leaderboard` - Clasificación de los mejores',
    general: '⚙️ General',
    general_desc: '`/help` - Este menu
`/ping` - Latencia del bot',
    footer: '¡Usa /configme para configurar tu idioma! | Staff: usa /staffhelp'
  },
  fr: {
    title: '🌍 Orbital International - Aide',
    desc: 'Communauté anonyme d'apprentissage des langues',
    language: '🎓 Apprentissage des Langues',
    language_desc: '`/configme` - Configurer le profil linguistique
`/translate` - Traduire du texte
`/findpartner` - Trouver un partenaire d'échange',
    stats: '📊 Statistiques',
    stats_desc: '`/mystats` - Vos statistiques anonymes
`/leaderboard` - Classement des meilleurs',
    general: '⚙️ Général',
    general_desc: '`/help` - Ce menu
`/ping` - Latence du bot',
    footer: 'Utilisez /configme pour définir votre langue! | Staff: /staffhelp'
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help menu'),

  async execute(interaction) {
    let lang = 'en';

    try {
      const profile = await UserProfile.findOne({ userId: interaction.user.id });
      if (profile && profile.language) {
        lang = profile.language;
      }
    } catch (e) {
      // Database error, use default English
    }

    const t = translations[lang] || translations.en;

    const embed = new EmbedBuilder()
      .setTitle(t.title)
      .setDescription(t.desc)
      .setColor(0x5865F2)
      .addFields(
        { name: t.language, value: t.language_desc, inline: false },
        { name: t.stats, value: t.stats_desc, inline: false },
        { name: t.general, value: t.general_desc, inline: false }
      )
      .setFooter({ text: t.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};