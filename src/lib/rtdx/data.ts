/**
 * Handles accessing of Pokemon/Dungeon data from the ROM data.
 */

import RomData from './romdata';

interface PokemonData {
    const: string;
    name: string;
    index: number;
    valid: boolean;
}

interface DungeonData {
    name: string;
    index: number;
    floors: number;
    ascending: boolean;
    valid: boolean;
}

/**
 * Transforms string into only numbers and lowercase letters
 */
function toID(str?: string): string {
	if (!str) return '';
	return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export const Data = {
    pokemon: {
        all: function() {
            const pokemonList: PokemonData[] = [];
            for (const [i, pokemon] of RomData.pokemon.entries()) {
                let pokemonName = pokemon.name;
                if (pokemonName === 'Unown') {
                    pokemonName += ` (${pokemon.const.slice(7).replace('EXC', '!').replace('QUE', '?')})`;
                } else if (pokemonName === 'Deoxys') {
                    switch (pokemon.const.slice(-1)) {
                        case 'A':
                            pokemonName += ' (Attack)';
                            break;
                        case 'D':
                            pokemonName += ' (Defense)';
                            break;
                        case 'S':
                            pokemonName += ' (Speed)';
                            break;
                        default:
                            pokemonName += ' (Normal)';
                    }
                } else if (pokemon.const.includes('YOBI')) {
                    pokemonName += ' (Shiny)';
                }

                pokemonList.push({
                    const: pokemon.const,
                    name: pokemonName,
                    index: i,
                    valid: pokemon.valid,
                });
            }
            return pokemonList;
        },
        get: function(indexOrName: number | string) {
            let pokemon: PokemonData | undefined;
            if (typeof indexOrName === 'number') {
                pokemon = this.all().find(p => p.valid && p.index === indexOrName);
            } else {
                pokemon = this.all().find(p => p.valid && toID(p.name) === toID(indexOrName));
            }
            if (!pokemon) {
                pokemon = {
                    const: '',
                    name: '',
                    index: 0,
                    valid: false,
                };
            }
            return pokemon;
        }
    },

    dungeons: {
        all: function() {
            const dungeons: DungeonData[] = [];
            for (const [i, dungeon] of RomData.dungeons.entries()) {
                const index = parseInt(dungeon.const.slice(1));
                dungeons.push({
                    name: dungeon.name,
                    index,
                    floors: dungeon.floors,
                    ascending: dungeon.ascending,
                    valid: dungeon.valid && index <= 45,
                })
            }
            return dungeons;
        },
        get: function(indexOrName: number | string) {
            let dungeon: DungeonData | undefined;
            if (typeof indexOrName === 'number') {
                dungeon = this.all().find(d => d.valid && d.index === indexOrName);
            } else {
                dungeon = this.all().find(d => d.valid && toID(d.name) === toID(indexOrName));
            }
            if (!dungeon) {
                dungeon = {
                    name: '',
                    index: 0,
                    floors: 0,
                    ascending: false,
                    valid: false,
                };
            }
            return dungeon;
        }
    },

    charmap: "abdefghijkmnpqrtuyABCDEFGHJKLMNPQRSTUVWXYZ1234567890★▲◆&$%*+=<>:",
    charmap_text: "\u0000ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわをん゛゜ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヲンヴ・ー～／（）『』※♪♂♀！？　☆★○●◇◆□■△▽▲▼,.!¡?¿‘’“”abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@&-_#$%:;*+<=> àáâãäåæçèéêëìíîïðñòóôõöøœšþùúûüýÿž…ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØŒŠÞÙÚÛÜÝŸŽßＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ",
    crc32table: [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918000, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117],
}
