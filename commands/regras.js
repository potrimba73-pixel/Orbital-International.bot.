const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const RULES_CHANNEL_ID = '1515151037344907336';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regras')
    .setDescription('Send or update rules panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = await interaction.client.channels.fetch(RULES_CHANNEL_ID).catch(() => null);

    if (!channel) {
      return interaction.reply({
        content: '❌ Canal de regras não encontrado.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('<:Rules:1517297885283094711> **ORBITAL-INTERNATIONAL • COMMUNITY RULES** :rocket:')
      .setDescription('Welcome to the space station. To maintain a safe, private, and productive environment for learning and connection, all members must follow these guidelines.\n\n:link: **Official Discord Guidelines:**\nAs an official community, we comply with Discord\'s policies. All members are required to follow their guidelines:\n• Discord Terms of Service: https://discord.com/terms\n• Discord Community Guidelines: https://discord.com/guidelines')
      .setColor(0x5865F2)
      .addFields(
        { 
          name: ':ringed_planet: ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ :ringed_planet:', 
          value: '\u200B', 
          inline: false 
        },
        {
          name: ':pushpin: **1. EQUALITY & RESPECT (ALL ARE EQUAL)**',
          value: 'There is no hierarchy here. Every member is equal. Treat everyone with respect, regardless of their nationality, background, or skill level. Toxicity, racism, or discrimination is strictly banable.',
          inline: false
        },
        {
          name: ':pushpin: **2. LEARNING MATURITY & PATIENCE**',
          value: 'This is a language learning space. Laughing at or mocking someone who is starting to speak or learn a new language is strictly prohibited. Have the maturity to support and help others grow.',
          inline: false
        },
        {
          name: ':pushpin: **3. POLITICAL DISCUSSIONS & EXPRESSION**',
          value: 'We believe in freedom of expression. Political topics and complex discussions are allowed, but they are **strictly limited**. Do not abuse this freedom. If a discussion becomes heated or divisive, staff will shut it down immediately.',
          inline: false
        },
        {
          name: ':pushpin: **4. PRIVACY & ANONYMITY (CRITICAL)**',
          value: 'For your safety, never share sensitive personal data in public chats. This includes:\n❌ Real addresses or locations.\n❌ Personal real-life photos or faces.\n❌ Full real names or private contact information.',
          inline: false
        },
        {
          name: ':pushpin: **5. CORRECT CHANNELS & TEXT RULES** :speech_balloon:',
          value: 'Use the appropriate text sectors for their intended purpose.\n• Always speak the designated language within its specific channel (e.g., only speak Portuguese inside the `#português` channel).\n• Spam, floods, or advertising external links/servers without authorization is strictly prohibited.',
          inline: false
        },
        {
          name: ':pushpin: **6. VOICE CHANNELS & CALL RULES** :loud_sound:',
          value: 'To maintain a comfortable environment for everyone inside our voice channels:\n• **Anti-Exclusion (No Cliques):** Creating closed groups to intentionally ignore or exclude new members in public calls is strictly prohibited. Everyone must be welcomed.\n• **Sound Quality:** Soundboards, loud noises (ear-rape), or excessive voice changers that disturb other users are forbidden.\n• **Streaming:** Do not stream inappropriate or harmful content.',
          inline: false
        },
        {
          name: '━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━',
          value: ':warning: **CONSEQUENCES & PUNISHMENTS**\nFailure to follow these rules will result in immediate disciplinary action by the Staff. Depending on the severity, punishments include:\n\n• :mute: **Mute / Timeout** ➔ Temporary restriction from typing or speaking.\n• :no_pedestrians: **Server Kick or Permanent Ban** ➔ For extreme toxicity, bullying, or spam.',
          inline: false
        },
        {
          name: '\u200B',
          value: '***\n*This is the end of Rules, scroll up to view the full text.*\n\n*By clicking the button below, you confirm that you have read, understood, and agreed to these terms.*',
          inline: false
        }
      )
      .setFooter({ 
        text: 'Orbital International • Rules', 
        iconURL: 'https://cdn.discordapp.com/emojis/1517297885283094711.webp' 
      });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_member')
          .setLabel('✅ I Accept the Rules')
          .setStyle(ButtonStyle.Success)
      );

    // Verifica se já existe um painel de regras no canal
    // Procura mensagens do bot com embed de regras (últimas 50 mensagens)
    const messages = await channel.messages.fetch({ limit: 50 }).catch(() => new Map());
    let existingMessage = null;

    for (const [, msg] of messages) {
      if (msg.author.id === interaction.client.user.id && msg.embeds.length > 0) {
        const embedTitle = msg.embeds[0].title || '';
        if (embedTitle.includes('COMMUNITY RULES')) {
          existingMessage = msg;
          break;
        }
      }
    }

    if (existingMessage) {
      // Edita o painel existente
      await existingMessage.edit({ embeds: [embed], components: [row] });
      return interaction.reply({
        content: '✅ Painel de regras atualizado com sucesso!',
        ephemeral: true
      });
    } else {
      // Envia novo painel
      await channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({
        content: '✅ Painel de regras enviado com sucesso no canal <#' + RULES_CHANNEL_ID + '>!',
        ephemeral: true
      });
    }
  }
};
