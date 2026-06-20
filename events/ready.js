const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const RULES_CHANNEL_ID = '1515151037344907336';

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
    console.log(`👥 ${client.users.cache.size} users in cache`);

    const channel = await client.channels.fetch(RULES_CHANNEL_ID).catch(() => null);
    if (!channel) {
      return console.error('❌ Canal de regras nao encontrado. Verifique o RULES_CHANNEL_ID.');
    }

    // ─── EMBED REGRAS ───
    const rulesEmbed = new EmbedBuilder()
      .setTitle('<:Rules:1517297885283094711> **ORBITAL-INTERNATIONAL • COMMUNITY RULES** :rocket:')
      .setDescription('Welcome to the space station. To maintain a safe, private, and productive environment for learning and connection, all members must follow these guidelines.

:link: **Official Discord Guidelines:**
As an official community, we comply with Discord's policies. All members are required to follow their guidelines:
• Discord Terms of Service: https://discord.com/terms
• Discord Community Guidelines: https://discord.com/guidelines')
      .setColor(0x5865F2)
      .addFields(
        { name: ':ringed_planet: ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ :ringed_planet:', value: '\u200B', inline: false },
        { name: ':pushpin: **1. EQUALITY & RESPECT (ALL ARE EQUAL)**', value: 'There is no hierarchy here. Every member is equal. Treat everyone with respect, regardless of their nationality, background, or skill level. Toxicity, racism, or discrimination is strictly banable.', inline: false },
        { name: ':pushpin: **2. LEARNING MATURITY & PATIENCE**', value: 'This is a language learning space. Laughing at or mocking someone who is starting to speak or learn a new language is strictly prohibited. Have the maturity to support and help others grow.', inline: false },
        { name: ':pushpin: **3. POLITICAL DISCUSSIONS & EXPRESSION**', value: 'We believe in freedom of expression. Political topics and complex discussions are allowed, but they are **strictly limited**. Do not abuse this freedom. If a discussion becomes heated or divisive, staff will shut it down immediately.', inline: false },
        { name: ':pushpin: **4. PRIVACY & ANONYMITY (CRITICAL)**', value: 'For your safety, never share sensitive personal data in public chats. This includes:
❌ Real addresses or locations.
❌ Personal real-life photos or faces.
❌ Full real names or private contact information.', inline: false },
        { name: ':pushpin: **5. CORRECT CHANNELS & TEXT RULES** :speech_balloon:', value: 'Use the appropriate text sectors for their intended purpose.
• Always speak the designated language within its specific channel (e.g., only speak Portuguese inside the `#português` channel).
• Spam, floods, or advertising external links/servers without authorization is strictly prohibited.', inline: false },
        { name: ':pushpin: **6. VOICE CHANNELS & CALL RULES** :loud_sound:', value: 'To maintain a comfortable environment for everyone inside our voice channels:
• **Anti-Exclusion (No Cliques):** Creating closed groups to intentionally ignore or exclude new members in public calls is strictly prohibited. Everyone must be welcomed.
• **Sound Quality:** Soundboards, loud noises (ear-rape), or excessive voice changers that disturb other users are forbidden.
• **Streaming:** Do not stream inappropriate or harmful content.', inline: false },
        { name: '━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━', value: ':warning: **CONSEQUENCES & PUNISHMENTS**
Failure to follow these rules will result in immediate disciplinary action by the Staff. Depending on the severity, punishments include:

• :mute: **Mute / Timeout** ➔ Temporary restriction from typing or speaking.
• :no_pedestrians: **Server Kick or Permanent Ban** ➔ For extreme toxicity, bullying, or spam.', inline: false },
        { name: '\u200B', value: '***
*This is the end of Rules, scroll up to view the full text.*

*By clicking the button below, you confirm that you have read, understood, and agreed to these terms.*', inline: false }
      )
      .setFooter({ text: 'Orbital International • Rules', iconURL: 'https://cdn.discordapp.com/emojis/1517297885283094711.webp' });

    const rulesRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_member')
          .setLabel('✅ I Accept the Rules')
          .setStyle(ButtonStyle.Success)
      );

    // ─── ONBOARDING EMBED ───
    const onboardingEmbed = new EmbedBuilder()
      .setTitle(':busts_in_silhouette: **MEMBER ONBOARDING**')
      .setDescription('Welcome aboard, Orbiter! 🚀

To help us connect you with the right people, please select your preferences below.')
      .setColor(0x5865F2)
      .setFooter({ text: 'Orbital International • Onboarding', iconURL: 'https://cdn.discordapp.com/emojis/1517297885283094711.webp' });

    // ─── DROPDOWN 1: Languages you speak ───
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
          new StringSelectMenuOptionBuilder().setLabel('🇫🇷 Français (French)').setValue('fr').setEmoji('🇫🇷'),
        )
    );

    // ─── DROPDOWN 2: Languages you want to learn ───
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
          new StringSelectMenuOptionBuilder().setLabel('🇫🇷 Français (French)').setValue('fr').setEmoji('🇫🇷'),
        )
    );

    // ─── DROPDOWN 3: Where are you from ───
    const regionMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('onboarding_region')
        .setPlaceholder('🌍 Where are you from?')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          new StringSelectMenuOptionBuilder().setLabel('🇪🇺 Europe').setValue('europe').setEmoji('🇪🇺'),
          new StringSelectMenuOptionBuilder().setLabel('🌎 North America').setValue('north_america').setEmoji('🌎'),
          new StringSelectMenuOptionBuilder().setLabel('🌎 South America').setValue('south_america').setEmoji('🌎'),
          new StringSelectMenuOptionBuilder().setLabel('🇷🇺 Eastern Europe / CIS').setValue('eastern_europe').setEmoji('🇷🇺'),
          new StringSelectMenuOptionBuilder().setLabel('🌍 Africa & Middle East').setValue('africa_me').setEmoji('🌍'),
          new StringSelectMenuOptionBuilder().setLabel('🌏 Asia & Oceania').setValue('asia_oceania').setEmoji('🌏'),
        )
    );

    // ─── DROPDOWN 4: How old are you ───
    const ageMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('onboarding_age')
        .setPlaceholder('🎂 How old are you?')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          new StringSelectMenuOptionBuilder().setLabel('🟢 11-13 years').setValue('11-13').setEmoji('🟢'),
          new StringSelectMenuOptionBuilder().setLabel('🟡 14-16 years').setValue('14-16').setEmoji('🟡'),
          new StringSelectMenuOptionBuilder().setLabel('🔵 17-19 years').setValue('17-19').setEmoji('🔵'),
          new StringSelectMenuOptionBuilder().setLabel('🟣 20-22 years').setValue('20-22').setEmoji('🟣'),
        )
    );

    // ─── ANTI-SPAM: fetch last 50 messages ───
    const messages = await channel.messages.fetch({ limit: 50 }).catch(() => new Map());
    let rulesMsg = null;
    let onboardMsg = null;

    for (const [, msg] of messages) {
      if (msg.author.id !== client.user.id || msg.embeds.length === 0) continue;
      const title = msg.embeds[0].title || '';
      if (title.includes('COMMUNITY RULES')) rulesMsg = msg;
      if (title.includes('MEMBER ONBOARDING')) onboardMsg = msg;
    }

    // ─── SEND / EDIT RULES ───
    try {
      if (rulesMsg) {
        await rulesMsg.edit({ embeds: [rulesEmbed], components: [rulesRow] });
        console.log('✅ Painel de regras atualizado.');
      } else {
        await channel.send({ embeds: [rulesEmbed], components: [rulesRow] });
        console.log('✅ Painel de regras enviado.');
      }
    } catch (err) {
      console.error('❌ Erro no painel de regras:', err.message);
    }

    // ─── SEND / EDIT ONBOARDING ───
    try {
      if (onboardMsg) {
        await onboardMsg.edit({ embeds: [onboardingEmbed], components: [speakMenu, learnMenu, regionMenu, ageMenu] });
        console.log('✅ Painel de onboarding atualizado.');
      } else {
        await channel.send({ embeds: [onboardingEmbed], components: [speakMenu, learnMenu, regionMenu, ageMenu] });
        console.log('✅ Painel de onboarding enviado.');
      }
    } catch (err) {
      console.error('❌ Erro no painel de onboarding:', err.message);
    }
  }
};
