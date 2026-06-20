const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const RULES_CHANNEL_ID = '1515151037344907336';
const ROLES_CHANNEL_ID = '1516956728477093978';

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
    console.log(`👥 ${client.users.cache.size} users in cache`);

    // Wait a bit for guilds to be fully available
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

      // Anti-spam: fetch last 50 messages
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
      // List all channels the bot can see for debugging
      console.log('[Onboarding] Available text channels:');
      client.channels.cache.forEach(ch => {
        if (ch.isTextBased && ch.isTextBased()) {
          console.log(`  - #${ch.name} (${ch.id}) in guild: ${ch.guild?.name || 'DM'}`);
        }
      });
      return;
    }

    console.log(`[Onboarding] Channel found: #${rolesChannel.name} (type: ${rolesChannel.type})`);

    const onboardingEmbed = new EmbedBuilder()
      .setTitle(':busts_in_silhouette: **MEMBER ONBOARDING**')
      .setDescription('Welcome aboard, Orbiter! 🚀

To help us connect you with the right people, please select your preferences below.')
      .setColor(0x5865F2)
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
          new StringSelectMenuOptionBuilder().setLabel('🇫🇷 Français (French)').setValue('fr').setEmoji('🇫🇷'),
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
          new StringSelectMenuOptionBuilder().setLabel('🇫🇷 Français (French)').setValue('fr').setEmoji('🇫🇷'),
        )
    );

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

    // Anti-spam: fetch last 50 messages in roles channel
    const roleMessages = await rolesChannel.messages.fetch({ limit: 50 }).catch(err => {
      console.error(`[Onboarding] Failed to fetch messages: ${err.message}`);
      return new Map();
    });

    let onboardMsg = null;
    for (const [, msg] of roleMessages) {
      if (msg.author.id === client.user.id && msg.embeds.length > 0) {
        const title = msg.embeds[0].title || '';
        if (title.includes('MEMBER ONBOARDING')) { onboardMsg = msg; break; }
      }
    }

    try {
      if (onboardMsg) {
        await onboardMsg.edit({ embeds: [onboardingEmbed], components: [speakMenu, learnMenu, regionMenu, ageMenu] });
        console.log('✅ Onboarding panel updated.');
      } else {
        await rolesChannel.send({ embeds: [onboardingEmbed], components: [speakMenu, learnMenu, regionMenu, ageMenu] });
        console.log('✅ Onboarding panel sent.');
      }
    } catch (err) {
      console.error(`❌ Error with onboarding panel: ${err.message}`);
    }
  }
};
