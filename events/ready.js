const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const RULES_CHANNEL_ID = '1515151037344907336';
const ROLES_CHANNEL_ID = '1516956728477093978';
const TICKET_CHANNEL_ID = '1515381294261862571';
const TICKET_CATEGORY_ID = '1515381294261862571';
const LOGS_CHANNEL_ID = '1515419876859314306';

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
            new StringSelectMenuOptionBuilder().setLabel('🇪🇺 Europe').setValue('europe').setEmoji('🇪🇺'),
            new StringSelectMenuOptionBuilder().setLabel('🌎 North America').setValue('north_america').setEmoji('🌎'),
            new StringSelectMenuOptionBuilder().setLabel('🌎 South America').setValue('south_america').setEmoji('🌎'),
            new StringSelectMenuOptionBuilder().setLabel('🇷🇺 Eastern Europe / CIS').setValue('eastern_europe').setEmoji('🇷🇺'),
            new StringSelectMenuOptionBuilder().setLabel('🌍 Africa & Middle East').setValue('africa_me').setEmoji('🌍'),
            new StringSelectMenuOptionBuilder().setLabel('🌏 Asia & Oceania').setValue('asia_oceania').setEmoji('🌏')
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
            new StringSelectMenuOptionBuilder().setLabel('🟣 20-22 years').setValue('20-22').setEmoji('🟣')
          )
      );

      const genderMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('onboarding_gender')
          .setPlaceholder('⚧️ What is your gender?')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('🟦 Male / Masculino').setValue('male').setEmoji('🟦'),
            new StringSelectMenuOptionBuilder().setLabel('🟥 Female / Feminino').setValue('female').setEmoji('🟥'),
            new StringSelectMenuOptionBuilder().setLabel('🟪 Other / Outro').setValue('other').setEmoji('🟪')
          )
      );

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
          await onboardMsg.edit({ embeds: [onboardingEmbed], components: [speakMenu, learnMenu, regionMenu, ageMenu, genderMenu] });
          console.log('✅ Onboarding panel updated with 5 dropdowns.');
        } else {
          await rolesChannel.send({ embeds: [onboardingEmbed], components: [speakMenu, learnMenu, regionMenu, ageMenu, genderMenu] });
          console.log('✅ Onboarding panel sent with 5 dropdowns.');
        }
      } catch (err) {
        console.error(`❌ Error with onboarding panel: ${err.message}`);
      }
    }

    // ─── TICKET PANEL ───
    console.log(`[Tickets] Fetching channel ${TICKET_CHANNEL_ID}...`);
    const ticketChannel = await client.channels.fetch(TICKET_CHANNEL_ID).catch(err => {
      console.error(`[Tickets] Failed to fetch channel: ${err.message}`);
      return null;
    });

    if (!ticketChannel) {
      console.error('[Tickets] Channel not found or bot lacks access.');
    } else {
      console.log(`[Tickets] Channel found: #${ticketChannel.name} (type: ${ticketChannel.type})`);

      const ticketEmbed = new EmbedBuilder()
        .setTitle('🌌 ORBITAL HUB • SUPPORT STATION')
        .setDescription('> Need help, want to report a user, or have a question? You are in the right place. Select the reason for your ticket in the menu below to open a private channel with the Staff.\n\n🔒 Your privacy is guaranteed. No other members can see this chat.')
        .setColor(0x2E0854)
        .setFooter({ text: 'Orbital International • Support', iconURL: 'https://cdn.discordapp.com/emojis/1517297885283094711.webp' });

      const ticketMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_create')
          .setPlaceholder('🔽 Select a reason for your ticket...')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('👤 General Support / Questions')
              .setValue('general')
              .setDescription('For general doubts about the server or roles.')
              .setEmoji('👤'),
            new StringSelectMenuOptionBuilder()
              .setLabel('🛡️ Report a User (Rules / Cliques)')
              .setValue('report')
              .setDescription('Report someone breaking rules, being toxic, or creating exclusive groups.')
              .setEmoji('🛡️'),
            new StringSelectMenuOptionBuilder()
              .setLabel('🌍 Language & Learning Help')
              .setValue('language')
              .setDescription('Issues with language roles or learning sectors.')
              .setEmoji('🌍'),
            new StringSelectMenuOptionBuilder()
              .setLabel('🛸 Other / Partnership')
              .setValue('other')
              .setDescription('For everything else or administrative topics.')
              .setEmoji('🛸')
          )
      );

      const ticketRedirectRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('🔗 Go to #open-ticket')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.com/channels/' + ticketChannel.guild.id + '/' + TICKET_CHANNEL_ID)
          .setEmoji('🎟️')
      );

      const ticketMessages = await ticketChannel.messages.fetch({ limit: 50 }).catch(err => {
        console.error(`[Tickets] Failed to fetch messages: ${err.message}`);
        return new Map();
      });

      let ticketMsg = null;
      for (const [, msg] of ticketMessages) {
        if (msg.author.id === client.user.id && msg.embeds.length > 0) {
          const title = msg.embeds[0].title || '';
          if (title.includes('ORBITAL HUB')) { ticketMsg = msg; break; }
        }
      }

      try {
        if (ticketMsg) {
          await ticketMsg.edit({ embeds: [ticketEmbed], components: [ticketMenu, ticketRedirectRow] });
          console.log('✅ Ticket panel updated with redirect button.');
        } else {
          await ticketChannel.send({ embeds: [ticketEmbed], components: [ticketMenu, ticketRedirectRow] });
          console.log('✅ Ticket panel sent with redirect button.');
        }
      } catch (err) {
        console.error(`❌ Error with ticket panel: ${err.message}`);
      }
    }
  }
};
