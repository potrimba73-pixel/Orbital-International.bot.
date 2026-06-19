const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupchannels')
    .setDescription('Auto-create language channels')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const guild = interaction.guild;
    const categories = [
      { name: 'Portuguese', lang: 'pt', limit: 10 },
      { name: 'English', lang: 'en', limit: 10 },
      { name: 'Russian', lang: 'ru', limit: 10 },
      { name: 'Spanish', lang: 'es', limit: 10 },
      { name: 'French', lang: 'fr', limit: 10 }
    ];

    for (const cat of categories) {
      const category = await guild.channels.create({
        name: cat.name,
        type: ChannelType.GuildCategory
      });

      await guild.channels.create({
        name: `${cat.lang}-text`,
        type: ChannelType.GuildText,
        parent: category.id
      });

      await guild.channels.create({
        name: `${cat.lang}-voice-1`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        userLimit: cat.limit
      });

      await guild.channels.create({
        name: `${cat.lang}-voice-2`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        userLimit: cat.limit * 2
      });
    }

    await interaction.editReply({
      content: '✅ Language channels created successfully!'
    });
  }
};