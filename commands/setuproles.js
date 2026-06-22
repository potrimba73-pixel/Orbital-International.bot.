const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../utils/models/GuildConfig');

const LANG_CHOICES = [
  { name: 'Portuguese', value: 'pt' },
  { name: 'English', value: 'en' },
  { name: 'Russian', value: 'ru' },
  { name: 'Spanish', value: 'es' },
  { name: 'French', value: 'fr' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setuproles')
    .setDescription('Configure role IDs for the bot (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('native')
         .setDescription('Set native language role')
         .addStringOption(opt => opt.setName('language').setDescription('Language').setRequired(true).addChoices(...LANG_CHOICES))
         .addRoleOption(opt => opt.setName('role').setDescription('Role to assign').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('learning')
         .setDescription('Set learning language role')
         .addStringOption(opt => opt.setName('language').setDescription('Language').setRequired(true).addChoices(...LANG_CHOICES))
         .addRoleOption(opt => opt.setName('role').setDescription('Role to assign').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('age')
         .setDescription('Set age role')
         .addStringOption(opt => opt.setName('age').setDescription('Age range').setRequired(true).addChoices(
           { name: '11-13', value: '11-13' },
           { name: '14-16', value: '14-16' },
           { name: '17-19', value: '17-19' },
           { name: '20-22', value: '20-22' }
         ))
         .addRoleOption(opt => opt.setName('role').setDescription('Role to assign').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('region')
         .setDescription('Set region role')
         .addStringOption(opt => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
           { name: 'Europe', value: 'europe' },
           { name: 'North America', value: 'north_america' },
           { name: 'South America', value: 'south_america' },
           { name: 'Eastern Europe / CIS', value: 'eastern_europe' },
           { name: 'Africa & Middle East', value: 'africa_me' },
           { name: 'Asia & Oceania', value: 'asia_oceania' }
         ))
         .addRoleOption(opt => opt.setName('role').setDescription('Role to assign').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('gender')
         .setDescription('Set gender role')
         .addStringOption(opt => opt.setName('gender').setDescription('Gender').setRequired(true).addChoices(
           { name: 'Male', value: 'male' },
           { name: 'Female', value: 'female' },
           { name: 'Other', value: 'other' }
         ))
         .addRoleOption(opt => opt.setName('role').setDescription('Role to assign').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('member')
         .setDescription('Set member role')
         .addRoleOption(opt => opt.setName('role').setDescription('Member role').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('show')
         .setDescription('Show current configuration')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
      config = new GuildConfig({ guildId });
    }

    if (subcommand === 'show') {
      const embed = new EmbedBuilder()
        .setTitle('Server Configuration')
        .setColor(0x5865F2);

      const roles = config.roles || {};

      const nativeRoles = roles.native && roles.native.size > 0 
        ? Array.from(roles.native.entries()).map(([k, v]) => '<@&' + v + '> (' + k + ')').join('\n') 
        : 'Not set';
      const learningRoles = roles.learning && roles.learning.size > 0 
        ? Array.from(roles.learning.entries()).map(([k, v]) => '<@&' + v + '> (' + k + ')').join('\n') 
        : 'Not set';
      const ageRoles = roles.age && roles.age.size > 0 
        ? Array.from(roles.age.entries()).map(([k, v]) => '<@&' + v + '> (' + k + ')').join('\n') 
        : 'Not set';
      const regionRoles = roles.region && roles.region.size > 0 
        ? Array.from(roles.region.entries()).map(([k, v]) => '<@&' + v + '> (' + k + ')').join('\n') 
        : 'Not set';
      const genderRoles = roles.gender && roles.gender.size > 0 
        ? Array.from(roles.gender.entries()).map(([k, v]) => '<@&' + v + '> (' + k + ')').join('\n') 
        : 'Not set';

      embed.addFields(
        { name: 'Native Roles', value: nativeRoles, inline: true },
        { name: 'Learning Roles', value: learningRoles, inline: true },
        { name: 'Age Roles', value: ageRoles, inline: true },
        { name: 'Region Roles', value: regionRoles, inline: true },
        { name: 'Gender Roles', value: genderRoles, inline: true },
        { name: 'Member Role', value: roles.member ? '<@&' + roles.member + '>' : 'Not set', inline: false }
      );

      return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    const role = interaction.options.getRole('role');

    if (subcommand === 'member') {
      config.roles.member = role.id;
    } else {
      const key = interaction.options.getString('language') || interaction.options.getString('age') || interaction.options.getString('region') || interaction.options.getString('gender');

      // Use .set() on the Map to properly store in MongoDB
      if (!config.roles[subcommand]) {
        config.roles[subcommand] = new Map();
      }
      config.roles[subcommand].set(key, role.id);
    }

    config.updatedAt = new Date();
    await config.save();

    const keyLabel = subcommand === 'member' ? '' : (interaction.options.getString('language') || interaction.options.getString('age') || interaction.options.getString('region') || interaction.options.getString('gender')).toUpperCase();
    await interaction.reply({
      content: '✅ ' + (subcommand === 'member' ? 'Member' : subcommand) + ' role' + (subcommand === 'member' ? '' : ' for ' + keyLabel) + ' set to <@&' + role.id + '>',
      flags: MessageFlags.Ephemeral
    });
  }
};
