const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regras')
    .setDescription('Send rules panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🚀 **ORBITAL-INTERNATIONAL • COMMUNITY RULES**')
      .setDescription('Welcome to the space station. To maintain a safe, private, and productive environment for learning and connection, all members must follow these guidelines.\n\n🔗 **Official Discord Guidelines:**\nAs an official community, we comply with Discord\'s policies. All members are required to follow their guidelines:\n• Discord Terms of Service: https://discord.com/terms\n• Discord Community Guidelines: https://discord.com/guidelines')
      .setColor(0x5865F2)
      .addFields(
        { 
          name: '🪐 ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 🪐', 
          value: '\u200B', 
          inline: false 
        },
        {
          name: '📌 **1. EQUALITY & RESPECT (ALL ARE EQUAL)**',
          value: 'There is no hierarchy here. Every member is equal. Treat everyone with respect, regardless of their nationality, background, or skill level. Toxicity, racism, or discrimination is strictly banable.',
          inline: false
        },
        {
          name: '📌 **2. LEARNING MATURITY & PATIENCE**',
          value: 'This is a language learning space. Laughing at or mocking someone who is starting to speak or learn a new language is strictly prohibited. Have the maturity to support and help others grow.',
          inline: false
        },
        {
          name: '📌 **3. POLITICAL DISCUSSIONS & EXPRESSION**',
          value: 'We believe in freedom of expression. Political topics and complex discussions are allowed, but they are **strictly limited**. Do not abuse this freedom. If a discussion becomes heated or divisive, staff will shut it down immediately.',
          inline: false
        },
        {
          name: '📌 **4. PRIVACY & ANONYMITY (CRITICAL)**',
          value: 'For your safety, never share sensitive personal data in public chats. This includes:\n❌ Real addresses or locations.\n❌ Personal real-life photos or faces.\n❌ Full real names or private contact information.',
          inline: false
        },
        {
          name: '📌 **5. CORRECT CHANNELS & TEXT RULES**',
          value: 'Use the appropriate text sectors for their intended purpose.\n• Always speak the designated language within its specific channel (for example, only speak Portuguese inside the #português channel).\n• Spam, floods, or advertising external links/servers without authorization is strictly prohibited.',
          inline: false
        },
        {
          name: '📌 **6. VOICE CHANNELS & CALL RULES 🔊**',
          value: 'To maintain a comfortable environment for everyone inside our voice channels:\n• **Anti-Exclusion (No Cliques):** Creating closed groups to intentionally ignore or exclude new members in public calls is strictly prohibited. Everyone must be welcomed.\n• **Sound Quality:** Soundboards, loud noises (ear-rape), or excessive voice changers that disturb other users are forbidden.\n• **Streaming:** Do not stream inappropriate or harmful content.',
          inline: false
        },
        {
          name: '━━━━━━━━▼━━━━━━━━',
          value: '⚠️ **CONSEQUENCES & PUNISHMENTS**\nFailure to follow these rules will result in immediate disciplinary action by the Staff. Depending on the severity, punishments include:\n\n• 🔇 **Mute / Timeout** ➔ Temporary restriction from typing or speaking.\n• 🚷 **Server Kick or Permanent Ban** ➔ For extreme toxicity, bullying, or spam.',
          inline: false
        }
      )
      .setFooter({ 
        text: 'Orbital International • Rules | By clicking the button below, you confirm that you have read, understood, and agreed to these terms.', 
        iconURL: 'https://cdn.discordapp.com/emojis/1517297885283094711.webp' 
      });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_member')
          .setLabel('✅ I Accept the Rules')
          .setStyle(ButtonStyle.Success)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};