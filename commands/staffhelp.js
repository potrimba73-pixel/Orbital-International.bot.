const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffhelp')
    .setDescription('Staff commands help menu')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Staff Commands - Orbital International')
      .setDescription('Restricted commands for server moderation')
      .setColor(0xED4245)
      .addFields(
        { 
          name: '📋 Moderation',
          value: '`/limpar` - Clear messages
`/anuncio` - Send announcement
`/verificar` - Check who accepted rules',
          inline: false 
        },
        { 
          name: '🔧 Setup',
          value: '`/setupchannels` - Auto-create language channels
`/regras` - Send rules panel',
          inline: false 
        },
        { 
          name: '👤 User Info',
          value: '`/userinfo` - Show detailed user info (age role, language, privacy)
`/canalinfo` - Voice channel info
`/serverinfo` - Show all server IDs',
          inline: false 
        },
        { 
          name: '⚙️ Bot',
          value: '`/ping` - Check bot latency',
          inline: false 
        }
      )
      .setFooter({ text: 'Orbital International Staff Panel' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};