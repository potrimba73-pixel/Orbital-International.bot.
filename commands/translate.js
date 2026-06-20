const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const translate = require('@iamtraction/google-translate');

const languages = {
  'pt': '🇵🇹 Português',
  'en': '🇬🇧 English',
  'ru': '🇷🇺 Russian',
  'es': '🇪🇸 Español',
  'fr': '🇫🇷 Français'
};

// Correções manuais para traduções PT -> ES que o Google falha com texto curto
const correctionsPtEs = {
  'ola': 'hola', 'olá': 'hola',
  'obrigado': 'gracias', 'obrigada': 'gracias',
  'sim': 'sí', 'nao': 'no', 'não': 'no',
  'bom dia': 'buenos días', 'boa tarde': 'buenas tardes', 'boa noite': 'buenas noches',
  'tudo bem': 'todo bien', 'como estas': 'cómo estás', 'como está': 'cómo está',
  'adeus': 'adiós', 'ate logo': 'hasta luego', 'até logo': 'hasta luego',
  'de nada': 'de nada', 'desculpe': 'lo siento', 'desculpa': 'lo siento',
  'com licenca': 'con permiso', 'com licença': 'con permiso',
  'bem vindo': 'bienvenido', 'bem vinda': 'bienvenida',
  'parabens': 'felicidades', 'parabéns': 'felicidades',
  'feliz aniversario': 'feliz cumpleaños', 'feliz aniversário': 'feliz cumpleaños',
  'te amo': 'te amo', 'eu te amo': 'te amo',
  'saudades': 'te extraño', 'tenho saudades': 'te extraño',
  'beijo': 'beso', 'beijos': 'besos',
  'hoje': 'hoy', 'ontem': 'ayer', 'amanha': 'mañana', 'amanhã': 'mañana',
  'dia': 'día', 'mes': 'mes', 'mês': 'mes', 'ano': 'año',
  'manha': 'mañana', 'manhã': 'mañana', 'tarde': 'tarde', 'noite': 'noche',
  'casa': 'casa', 'carro': 'coche', 'rua': 'calle',
  'trabalho': 'trabajo', 'escola': 'escuela',
  'amigo': 'amigo', 'amiga': 'amiga', 'pessoa': 'persona', 'coisa': 'cosa',
  'tempo': 'tiempo', 'gosto': 'me gusta', 'quero': 'quiero',
  'preciso': 'necesito', 'tenho': 'tengo', 'sou': 'soy', 'estou': 'estoy',
  'fazer': 'hacer', 'faz': 'hace', 'fez': 'hizo', 'fiz': 'hice',
  'posso': 'puedo', 'pode': 'puede', 'vou': 'voy', 'vai': 'va',
  'vem': 'viene', 'veio': 'vino', 'foi': 'fue',
  'dizer': 'decir', 'diz': 'dice', 'disse': 'dijo',
  'saber': 'saber', 'sei': 'sé', 'sabe': 'sabe', 'soube': 'supo',
  'ver': 'ver', 'vejo': 'veo', 've': 've', 'viu': 'vio',
  'dar': 'dar', 'dou': 'doy', 'da': 'da', 'deu': 'dio',
  'comer': 'comer', 'como': 'como', 'come': 'come', 'comeu': 'comió',
  'beber': 'beber', 'bebo': 'bebo', 'bebe': 'bebe', 'bebeu': 'bebió',
  'dormir': 'dormir', 'durmo': 'duermo', 'dorme': 'duerme', 'dormiu': 'durmió',
  'acordar': 'despertar', 'acordo': 'despierto', 'acorda': 'despierta', 'acordou': 'despertó',
  'entrar': 'entrar', 'entro': 'entro', 'entra': 'entra', 'entrou': 'entró',
  'sair': 'salir', 'sai': 'sale', 'saiu': 'salió',
  'chegar': 'llegar', 'chego': 'llego', 'chega': 'llega', 'chegou': 'llegó',
  'comprar': 'comprar', 'compro': 'compro', 'compra': 'compra', 'comprou': 'compró',
  'pagar': 'pagar', 'pago': 'pago', 'paga': 'paga', 'pagou': 'pagó',
  'ganhar': 'ganar', 'ganho': 'gano', 'ganha': 'gana', 'ganhou': 'ganó',
  'perder': 'perder', 'perco': 'pierdo', 'perde': 'pierde', 'perdeu': 'perdió',
  'achar': 'encontrar', 'acho': 'encuentro', 'acha': 'encuentra', 'achou': 'encontró',
  'usar': 'usar', 'uso': 'uso', 'usa': 'usa', 'usou': 'usó',
  'abrir': 'abrir', 'abro': 'abro', 'abre': 'abre', 'abriu': 'abrió',
  'fechar': 'cerrar', 'fecho': 'cierro', 'fecha': 'cierra', 'fechou': 'cerró',
  'ligar': 'llamar', 'ligo': 'llamo', 'liga': 'llama', 'ligou': 'llamó',
  'pegar': 'coger', 'pego': 'cojo', 'pega': 'coge', 'pegou': 'cogió',
  'deixar': 'dejar', 'deixo': 'dejo', 'deixa': 'deja', 'deixou': 'dejó',
  'trazer': 'traer', 'trago': 'traigo', 'traz': 'trae', 'trouxe': 'trajo',
  'levar': 'llevar', 'levo': 'llevo', 'leva': 'lleva', 'levou': 'llevó',
  'olhar': 'mirar', 'olho': 'miro', 'olha': 'mira', 'olhou': 'miró',
  'ouvir': 'oír', 'ouço': 'oigo', 'ouve': 'oye', 'ouviu': 'oyó',
  'sentir': 'sentir', 'sinto': 'siento', 'sente': 'siente', 'sentiu': 'sintió',
  'pensar': 'pensar', 'penso': 'pienso', 'pensa': 'piensa', 'pensou': 'pensó',
  'acreditar': 'creer', 'acredito': 'creo', 'acredita': 'cree', 'acreditou': 'creyó',
  'duvidar': 'dudar', 'duvido': 'dudo', 'duvida': 'duda', 'duvidou': 'dudó',
  'conhecer': 'conocer', 'conheço': 'conozco', 'conhece': 'conoce', 'conheceu': 'conoció',
  'lembrar': 'recordar', 'lembro': 'recuerdo', 'lembra': 'recuerda', 'lembrou': 'recordó',
  'esquecer': 'olvidar', 'esqueço': 'olvido', 'esquece': 'olvida', 'esqueceu': 'olvidó',
  'entender': 'entender', 'entendo': 'entiendo', 'entende': 'entiende', 'entendeu': 'entendió',
  'aprender': 'aprender', 'aprendo': 'aprendo', 'aprende': 'aprende', 'aprendeu': 'aprendió',
  'ensinar': 'enseñar', 'ensino': 'enseño', 'ensina': 'enseña', 'ensinou': 'enseñó',
  'ajudar': 'ayudar', 'ajudo': 'ayudo', 'ajuda': 'ayuda', 'ajudou': 'ayudó',
  'esperar': 'esperar', 'espero': 'espero', 'espera': 'espera', 'esperou': 'esperó',
  'precisar': 'necesitar', 'preciso': 'necesito', 'precisa': 'necesita', 'precisou': 'necesitó',
  'dever': 'deber', 'devo': 'debo', 'deve': 'debe', 'deveu': 'debió',
  'poder': 'poder', 'pudemos': 'pudimos',
  'querer': 'querer', 'quer': 'quiere', 'quis': 'quiso',
  'amar': 'amar', 'amo': 'amo', 'ama': 'ama', 'amou': 'amó',
  'odiar': 'odiar', 'odeio': 'odio', 'odeia': 'odia', 'odiou': 'odió',
  'gostar': 'gustar', 'gosta': 'le gusta', 'gostou': 'gustó',
  'preferir': 'preferir', 'prefiro': 'prefiero', 'prefere': 'prefiere', 'preferiu': 'prefirió',
  'comecar': 'empezar', 'começar': 'empezar', 'comeco': 'empiezo', 'começo': 'empiezo',
  'comeca': 'empieza', 'começa': 'empieza', 'comecou': 'empezó', 'começou': 'empezó',
  'terminar': 'terminar', 'termino': 'termino', 'termina': 'termina', 'terminou': 'terminó',
  'acabar': 'acabar', 'acabo': 'acabo', 'acaba': 'acaba', 'acabou': 'acabó',
  'continuar': 'continuar', 'continuo': 'continúo', 'continua': 'continúa', 'continuou': 'continuó',
  'parar': 'parar', 'paro': 'paro', 'para': 'para', 'parou': 'paró',
  'voltar': 'volver', 'volto': 'vuelvo', 'volta': 'vuelve', 'voltou': 'volvió',
  'ir': 'ir', 'vir': 'venir', 'venho': 'vengo', 'ficar': 'quedar',
  'fico': 'quedo', 'fica': 'queda', 'ficou': 'quedó',
  'morar': 'vivir', 'moro': 'vivo', 'mora': 'vive', 'morou': 'vivió',
  'nascer': 'nacer', 'nasci': 'nací', 'nasceu': 'nació',
  'morrer': 'morir', 'morri': 'morí', 'morreu': 'murió',
  'crescer': 'crecer', 'cresci': 'crecí', 'cresceu': 'creció',
  'viver': 'vivir', 'vivo': 'vivo', 'vive': 'vive', 'viveu': 'vivió',
  'trabalhar': 'trabajar', 'trabalha': 'trabaja', 'trabalhou': 'trabajó',
  'estudar': 'estudiar', 'estudo': 'estudio', 'estuda': 'estudia', 'estudou': 'estudió',
  'jogar': 'jugar', 'jogo': 'juego', 'joga': 'juega', 'jogou': 'jugó',
  'brincar': 'jugar', 'brinco': 'juego', 'brinca': 'juega', 'brincou': 'jugó',
  'cantar': 'cantar', 'canto': 'canto', 'canta': 'canta', 'cantou': 'cantó',
  'dancar': 'bailar', 'dançar': 'bailar', 'danco': 'bailo', 'danço': 'bailo',
  'danca': 'baila', 'dança': 'baila', 'dancou': 'bailó', 'dançou': 'bailó',
  'correr': 'correr', 'corro': 'corro', 'corre': 'corre', 'correu': 'corrió',
  'andar': 'andar', 'ando': 'ando', 'anda': 'anda', 'andou': 'andó',
  'saltar': 'saltar', 'salto': 'salto', 'salta': 'salta', 'saltou': 'saltó',
  'nadar': 'nadar', 'nado': 'nado', 'nada': 'nada', 'nadou': 'nadó',
  'voar': 'volar', 'voo': 'vuelo', 'voa': 'vuela', 'voou': 'voló',
  'cair': 'caer', 'caio': 'caigo', 'cai': 'cae', 'caiu': 'cayó',
  'levantar': 'levantar', 'levanto': 'levanto', 'levanta': 'levanta', 'levantou': 'levantó',
  'sentar': 'sentar', 'sento': 'siento', 'senta': 'sienta', 'sentou': 'sentó',
  'deitar': 'echar', 'deito': 'echo', 'deita': 'echa', 'deitou': 'echó',
  'cortar': 'cortar', 'corto': 'corto', 'corta': 'corta', 'cortou': 'cortó',
  'partir': 'partir', 'parto': 'parto', 'parte': 'parte', 'partiu': 'partió',
  'quebrar': 'romper', 'quebro': 'rompo', 'quebra': 'rompe', 'quebrou': 'rompió',
  'consertar': 'arreglar', 'conserto': 'arreglo', 'conserta': 'arregla', 'consertou': 'arregló',
  'limpar': 'limpiar', 'limpo': 'limpio', 'limpa': 'limpia', 'limpou': 'limpió',
  'sujar': 'ensuciar', 'sujo': 'ensucio', 'suja': 'ensucia', 'sujou': 'ensució',
  'molhar': 'mojar', 'molho': 'mojo', 'molha': 'moja', 'molhou': 'mojó',
  'secar': 'secar', 'seco': 'seco', 'seca': 'seca', 'secou': 'secó',
  'queimar': 'quemar', 'queimo': 'quemo', 'queima': 'quema', 'queimou': 'quemó',
  'congelar': 'congelar', 'congelo': 'congelo', 'congela': 'congela', 'congelou': 'congeló',
  'derreter': 'derretir', 'derreto': 'derrito', 'derrete': 'derrite', 'derreteu': 'derritió',
  'cozinhar': 'cocinar', 'cozinho': 'cocino', 'cozinha': 'cocina', 'cozinhou': 'cocinó',
  'vestir': 'vestir', 'visto': 'visto', 'veste': 'viste', 'vestiu': 'vistió',
  'tocar': 'tocar', 'toco': 'toco', 'toca': 'toca', 'tocou': 'tocó',
  'cheirar': 'oler', 'cheiro': 'huelo', 'cheira': 'huele', 'cheirou': 'olió',
  'provar': 'probar', 'provo': 'pruebo', 'prova': 'prueba', 'provou': 'probó',
  'acordar': 'despertar', 'acordo': 'despierto', 'acorda': 'despierta', 'acordou': 'despertó',
  'mandar': 'mandar', 'mando': 'mando', 'manda': 'manda', 'mandou': 'mandó',
  'receber': 'recibir', 'recebo': 'recibo', 'recebe': 'recibe', 'recebeu': 'recibió',
  'escrever': 'escribir', 'escrevo': 'escribo', 'escreve': 'escribe', 'escreveu': 'escribió',
  'ler': 'leer', 'leio': 'leo', 'le': 'lee', 'leu': 'leyó',
  'portugal': 'portugal', 'português': 'portugués', 'portugues': 'portugués',
  'tuga': 'tuga', 'então': 'entonces', 'entao': 'entonces',
  'depois': 'después', 'antes': 'antes', 'agora': 'ahora',
  'mesmo': 'mismo', 'assim': 'así', 'também': 'también', 'tambem': 'también',
  'só': 'solo', 'so': 'solo', 'ja': 'ya', 'já': 'ya', 'ainda': 'todavía',
  'muitos': 'muchos', 'poucos': 'pocos', 'todos': 'todos', 'alguns': 'algunos',
  'grande': 'grande', 'pequeno': 'pequeño', 'pequena': 'pequeña',
  'bom': 'bueno', 'boa': 'buena', 'mau': 'malo', 'má': 'mala',
  'novo': 'nuevo', 'nova': 'nueva', 'velho': 'viejo', 'velha': 'vieja',
  'bonito': 'bonito', 'bonita': 'bonita', 'feio': 'feo', 'feia': 'fea',
  'rapido': 'rápido', 'rápido': 'rápido', 'devagar': 'despacio',
  'facil': 'fácil', 'fácil': 'fácil', 'dificil': 'difícil', 'difícil': 'difícil',
  'certo': 'correcto', 'errado': 'equivocado',
  'sempre': 'siempre', 'nunca': 'nunca', 'talvez': 'tal vez',
  'aqui': 'aquí', 'ali': 'allí', 'la': 'allá', 'lá': 'allá', 'ca': 'aquí', 'cá': 'aquí',
  'tudo': 'todo', 'nada': 'nada', 'algo': 'algo',
  'alguem': 'alguien', 'alguém': 'alguien', 'ninguem': 'nadie', 'ninguém': 'nadie',
  'todas': 'todas', 'algumas': 'algunas', 'muitas': 'muchas', 'poucas': 'pocas',
  'semana': 'semana', 'hora': 'hora', 'minuto': 'minuto', 'segundo': 'segundo',
  'q': 'q', 'qlq': 'cualquiera', 'qlqr': 'cualquiera', 'qualquer': 'cualquiera',
  'pq': 'por qué', 'qnd': 'cuándo', 'qdo': 'cuándo',
  'cmg': 'conmigo', 'ctg': 'contigo', 'vc': 'tú', 'tb': 'también', 'tbm': 'también',
  'kkk': 'jaja', 'kkkk': 'jajaja', 'haha': 'jaja', 'hehe': 'jeje', 'rsrs': 'jeje'
};

// Transliteração russa cirílico -> latim
const russianTranslit = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': "'", 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '', 'Ы': 'Y', 'Ь': "'", 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
};

function transliterateRussian(text) {
  let result = '';
  for (const char of text) {
    result += russianTranslit[char] || char;
  }
  return result;
}

// Verifica se o texto tem caracteres cirílicos
function hasCyrillic(text) {
  return /[\u0400-\u04FF]/.test(text);
}

// Helper para corrigir deteção automática de português
function fixPortugueseDetection(text, detectedIso) {
  if (detectedIso === 'pt') return 'pt';

  const lower = text.toLowerCase().trim();
  const ptWords = ['ola', 'olá', 'obrigado', 'obrigada', 'por favor', 'desculpe', 'desculpa',
    'sim', 'nao', 'não', 'talvez', 'claro', 'como', 'esta', 'está', 'estas', 'estás',
    'voce', 'você', 'vc', 'tb', 'também', 'tambem', 'muito', 'mt', 'bem', 'mal', 'mais', 'menos',
    'quando', 'onde', 'porque', 'porquê', 'por que', 'aqui', 'ali', 'la', 'lá', 'ca', 'cá',
    'tudo', 'nada', 'algo', 'alguem', 'alguém', 'hoje', 'ontem', 'amanha', 'amanhã', 'sempre', 'nunca',
    'gosto', 'quero', 'preciso', 'tenho', 'sou', 'estou', 'fazer', 'faz', 'fez', 'fiz', 'fizemos',
    'casa', 'carro', 'rua', 'trabalho', 'escola', 'amigo', 'amiga', 'pessoa', 'coisa', 'tempo',
    'portugal', 'português', 'portugues', 'tuga', 'então', 'entao', 'depois', 'antes', 'agora',
    'mesmo', 'assim', 'também', 'tambem', 'só', 'so', 'ja', 'já', 'ainda', 'sempre',
    'muitos', 'poucos', 'todos', 'alguns', 'grande', 'pequeno', 'bom', 'boa', 'mau', 'má',
    'novo', 'nova', 'velho', 'velha', 'bonito', 'bonita', 'feio', 'feia', 'rapido', 'rápido',
    'devagar', 'facil', 'fácil', 'dificil', 'difícil', 'certo', 'errado', 'sempre', 'nunca',
    'aqui', 'ali', 'la', 'lá', 'ca', 'cá', 'tudo', 'nada', 'algo', 'alguem', 'alguém',
    'ninguem', 'ninguém', 'todos', 'todas', 'alguns', 'algumas', 'muitos', 'muitas',
    'poucos', 'poucas', 'hoje', 'ontem', 'amanha', 'amanhã', 'dia', 'semana', 'mes', 'mês',
    'ano', 'hora', 'minuto', 'segundo', 'manha', 'manhã', 'tarde', 'noite',
    'q', 'qlq', 'qlqr', 'qualquer', 'pq', 'qnd', 'qdo', 'cmg', 'ctg', 'vc', 'tb', 'tbm',
    'kkk', 'kkkk', 'haha', 'hehe', 'rsrs'];

  const hasPtWord = ptWords.some(w => lower === w || lower.includes(' ' + w + ' ') || lower.startsWith(w + ' ') || lower.endsWith(' ' + w));
  const hasPtAccent = /[çãõáéíóúâêô]/i.test(text);

  if ((hasPtWord && text.length < 200) || (hasPtAccent && text.length < 100)) {
    return 'pt';
  }

  return detectedIso;
}

// Aplica correções manuais PT -> ES
function applyPtEsCorrection(text, translatedText) {
  const lower = text.toLowerCase().trim();

  // Verifica correspondência exata
  if (correctionsPtEs[lower]) {
    return correctionsPtEs[lower];
  }

  // Verifica se é uma frase simples (sem pontuação complexa)
  if (!translatedText || translatedText.toLowerCase() === 'ser' || translatedText.toLowerCase() === 'estar') {
    const words = lower.split(/\s+/);
    const correctedWords = words.map(w => correctionsPtEs[w] || w);
    // Se pelo menos uma palavra foi corrigida, retorna a frase corrigida
    if (correctedWords.some((w, i) => w !== words[i])) {
      return correctedWords.join(' ');
    }
  }

  return translatedText;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text between languages')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to translate')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('to')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(
          { name: '🇵🇹 Português', value: 'pt' },
          { name: '🇬🇧 English', value: 'en' },
          { name: '🇷🇺 Russian', value: 'ru' },
          { name: '🇪🇸 Español', value: 'es' },
          { name: '🇫🇷 Français', value: 'fr' }
        ))
    .addStringOption(option =>
      option.setName('from')
        .setDescription('Source language (auto-detect if not specified)')
        .setRequired(false)
        .addChoices(
          { name: '🇵🇹 Português', value: 'pt' },
          { name: '🇬🇧 English', value: 'en' },
          { name: '🇷🇺 Russian', value: 'ru' },
          { name: '🇪🇸 Español', value: 'es' },
          { name: '🇫🇷 Français', value: 'fr' }
        )),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    const to = interaction.options.getString('to');
    const from = interaction.options.getString('from');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const result = await translate(text, { 
        to: to, 
        from: from || 'auto' 
      });

      // Corrige deteção automática se necessário
      let detectedIso = from ? from : result.from.language.iso;
      if (!from) {
        detectedIso = fixPortugueseDetection(text, detectedIso);
      }

      const detectedLang = languages[detectedIso] || detectedIso.toUpperCase();
      const targetLang = languages[to] || to.toUpperCase();

      // Aplica correções manuais PT -> ES
      let finalTranslation = result.text;
      if (detectedIso === 'pt' && to === 'es') {
        finalTranslation = applyPtEsCorrection(text, result.text);
      }

      // Se for russo, adiciona transliteração latina
      let translitField = null;
      if (to === 'ru' && hasCyrillic(finalTranslation)) {
        const translit = transliterateRussian(finalTranslation);
        if (translit !== finalTranslation) {
          translitField = { name: '📝 Transliteration (Latin)', value: translit.substring(0, 1024), inline: false };
        }
      }

      const fields = [
        { 
          name: `📤 Original (${detectedLang})`, 
          value: text.substring(0, 1024),
          inline: false
        },
        { 
          name: `📥 Translation (${targetLang})`, 
          value: finalTranslation.substring(0, 1024),
          inline: false
        }
      ];

      if (translitField) {
        fields.push(translitField);
      }

      await interaction.editReply({
        embeds: [{
          title: '🌐 Translation',
          color: 0x5865F2,
          fields: fields,
          footer: { text: 'Powered by Google Translate' }
        }]
      });
    } catch (error) {
      console.error('Translation error:', error);
      await interaction.editReply({
        content: '❌ Translation failed. Please try again later.'
      });
    }
  }
};
