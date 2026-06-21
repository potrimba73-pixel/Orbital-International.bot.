const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const RULES_CHANNEL_ID = '1515151037344907336';
const ROLES_CHANNEL_ID = '1516956728477093978';
const TICKET_CHANNEL_ID = '1515381294261862571';
const TICKET_CATEGORY_ID = '1515381294261862571';
const LOGS_CHANNEL_ID = '1515419876859314306';

// ─── GIF URLs ───
// Substitui estes links pelos links diretos do Discord depois de fazeres upload do GIF
const GIF_ONBOARDING = 'https://cdn.discordapp.com/attachments/.../onboarding.gif';
const GIF_TICKETS = 'https://cdn.discordapp.com/attachments/.../tickets.gif';
const GIF_RULES = 'https://cdn.discordapp.com/attachments/.../rules.gif';

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
    console.log(`👥 ${client.users.cache.size} users in cache`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // ─── RULES PANEL ───
    console.log(`[Rules] Fetching channel ${RULES_CHANNEL_ID}...`);
    const rulesChannel = await client.channels.fetch(RULES_CHANNEL_ID).catch(err => {
      console.error(`[Rules] Failed to fetch channel: ${err.message}`);
      return null;
    });

    if (!rulesChannel) {
      console.error('[Rules] Channel not found or bot lacks access.');
    } else {
      console.log(`[Rules] Channel found: #${rulesChannel.name} (type: ${rulesChannel.type})`);

      const rulesEmbed = new EmbedBuilder()
        .setTitle('<:Rules:1517297885283094711> **ORBITAL-INTERNATIONAL • COMMUNITY RULES** :rocket:')
        .setDescription('Welcome to the space station. To maintain a safe, private, and productive environment for learning and connection, all members must follow these guidelines.\n\n:link: **Official Discord Guidelines:**\nAs an official community, we comply with Discord\'s policies. All members are required to follow their guidelines:\n• Discord Terms of Service: https://discord.com/terms\n• Discord Community Guidelines: https://discord.com/guidelines')
        .setColor(0x5865F2)
        .setImage(GIF_RULES) // GIF no topo do embed
        .addFields(
          { name: ':ringed_planet: ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ :ringed_planet:', value: '\u200B', inline: false },
          { name: ':pushpin: **1. EQUALITY & RESPECT (ALL ARE EQUAL)**', value: 'There is no hierarchy here. Every member is equal. Treat everyone with respect, regardless of their nationality, background, or skill level. Toxicity, racism, or discrimination is strictly banable.', inline: false },
          { name: ':pushpin: **2. LEARNING MATURITY & PATIENCE**', value: 'This is a language learning space. Laughing at or mocking someone who is starting to speak or learn a new language is strictly prohibited. Have the maturity to support and help others grow.', inline: false },
          { name: ':pushpin: **3. POLITICAL DISCUSSIONS & EXPRESSION**', value: 'We believe in freedom of expression. Political topics and complex discussions are allowed, but they are **strictly limited**. Do not abuse this freedom. If a discussion becomes heated or divisive, staff will shut it down immediately.', inline: false },
          { name: ':pushpin: **4. PRIVACY & ANONYMITY (CRITICAL)**', value: 'For your safety, never share sensitive personal data in public chats. This includes:\n❌ Real addresses or locations.\n❌ Personal real-life photos or faces.\n❌ Full real names or private contact information.', inline: false },
          { name: ':pushpin: **5. CORRECT CHANNELS & TEXT RULES** :speech_balloon:', value: 'Use the appropriate text sectors for their intended purpose.\n• Always speak the designated language within its specific channel (e.g., only speak Portuguese inside the `#português` channel).\n• Spam, floods, or advertising external links/servers without authorization is strictly prohibited.', inline: false },
          { name: ':pushpin: **6. VOICE CHANNELS & CALL RULES** :loud_sound:', value: 'To maintain a comfortable environment for everyone inside our voice channels:\n• **Anti-Exclusion (No Cliques):** Creating closed groups to intentionally ignore or exclude new members in public calls is strictly prohibited. Everyone must be welcomed.\n• **Sound Quality:** Soundboards, loud noises (ear-rape), or excessive voice changers that disturb other users are forbidden.\n• **Streaming:** Do not stream inappropriate or harmful content.', inline: false },
          { name: '━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━', value: ':warning: **CONSEQUENCES & PUNISHMENTS**\nFailure to follow these rules will result in immediate disciplinary action by the Staff. Depending on the severity, punishments include:\n\n• :mute: **Mute / Timeout** ➔ Temporary restriction from typing or speaking.\n• :no_pedestrians: **Server Kick or Permanent Ban** ➔ For extreme toxicity, bullying, or spam.', inline: false },
          { name: '\u200B', value: '***\n*This is the end of Rules, scroll up to view the full text.*\n\n*By clicking the button below, you confirm that you have read, understood, and agreed to these terms.*', inline: false }
        )
        .setFooter({ text: 'Orbital International • Rules', iconURL: 'https://cdn.discordapp.com/emojis/1517297885283094711.webp' });

      const rulesRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('verify_member')
            .setLabel('✅ I Accept the Rules')
            .setStyle(ButtonStyle.Success)
        );

      const messages = await rulesChannel.messages.fetch({ limit: 50 }).catch(err => {
        console.error(`[Rules] Failed to fetch messages: ${err.message}`);
        return new Map();
      });

      let rulesMsg = null;
      for (const [, msg] of messages) {
        if (msg.author.id === client.user.id && msg.embeds.length > 0) {
          const title = msg.embeds[0].title || '';
          if (title.includes('COMMUNITY RULES')) { rulesMsg = msg; break; }
        }
      }

      try {
        if (rulesMsg) {
          await rulesMsg.edit({ embeds: [rulesEmbed], components: [rulesRow] });
          console.log('✅ Rules panel updated.');
        } else {
          await rulesChannel.send({ embeds: [rulesEmbed], components: [rulesRow] });
          console.log('✅ Rules panel sent.');
        }
      } catch (err) {
        console.error(`❌ Error with rules panel: ${err.message}`);
      }
    }

    // ─── ONBOARDING PANEL ───
    console.log(`[Onboarding] Fetching channel ${ROLES_CHANNEL_ID}...`);
    const rolesChannel = await client.channels.fetch(ROLES_CHANNEL_ID).catch(err => {
      console.error(`[Onboarding] Failed to fetch channel: ${err.message}`);
      return null;
    });

    if (!rolesChannel) {
      console.error('[Onboarding] Channel not found or bot lacks access.');
    } else {
      console.log(`[Onboarding] Channel found: #${rolesChannel.name} (type: ${rolesChannel.type})`);

      const onboardingEmbed = new EmbedBuilder()
        .setTitle(':busts_in_silhouette: **MEMBER ONBOARDING**')
        .setDescription('Welcome aboard, Orbiter! 🚀\n\nTo help us connect you with the right people, please select your preferences below.')
        .setColor(0x5865F2)
        .setImage(GIF_ONBOARDING) // GIF no topo do embed
        .setFooter({ text: 'Orbital International • Onboarding', iconURL: 'https://cdn.discordapp.com/emojis/1517297885283094711.webp' });

      const speakMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('onboarding_speak')
          .setPlaceholder('🗣️ What languages do you speak?')
          .setMinValues(1)
          .setMaxValues(5)
          .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('🇵🇹 Português (Portuguese)').setValue('pt').setEmoji('🇵🇹'),
            new StringSelectMenuOptionBuilder().setLabel('🇬🇧 English').setValue('en').setEmoji('🇬🇧'),
            new StringSelectMenuOptionBuilder().setLabel('🇷🇺 Русский (Russian)').setValue('ru').setEmoji('🇷🇺'),
            new StringSelectMenuOptionBuilder().setLabel('🇪🇸 Español (Spanish)').setValue('es').setEmoji('🇪🇸'),
            new StringSelectMenuOptionBuilder().setLabel('🇫🇷 Français (French)').setValue('fr').setEmoji('🇫🇷')
          )
      );

      const learnMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('onboarding_learn')
          .setPlaceholder('📚 What languages do you want to learn?')
          .setMinValues(1)
          .setMaxValues(5)
          .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('🇵🇹 Português (Portuguese)').setValue('pt').setEmoji('🇵🇹'),
            new StringSelectMenuOptionBuilder().setLabel('🇬🇧 English').setValue('en').setEmoji('🇬🇧'),
            new StringSelectMenuOptionBuilder().setLabel('🇷🇺 Русский (Russian)').setValue('ru').setEmoji('🇷🇺'),
            new StringSelectMenuOptionBuilder().setLabel('🇪🇸 Español (Spanish)').setValue('es').setEmoji('🇪🇸'),
            new StringSelectMenuOptionBuilder().setLabel('🇫🇷 Français (French)').setValue('fr').setEmoji('🇫🇷')
          )
      );

      const regionMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('onboarding_region')
          .setPlaceholder('🌍 Where are you from?')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('🇪🇺 Europe').setValue('
