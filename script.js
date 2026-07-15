const STORAGE_KEY = 'campeonato_portal_data_qatar2022_v2';
const AUTH_KEY = 'campeonato_portal_auth_qatar2022_v1';
const APP_CONFIG = window.APP_CONFIG || {};
const DEFAULT_PLAYER_IMAGE = APP_CONFIG.defaultPlayerImage || 'img/player_generico.webp';
const DEFAULT_TEAM_IMAGE = APP_CONFIG.defaultTeamImage || 'img/team_generico.svg';

const firebaseConfig = {
    apiKey: "AIzaSyBCT8HlmOojHuXF6uOBtIvAWK2-RUTGxvg",
    authDomain: "copamundo-d7203.firebaseapp.com",
    projectId: "copamundo-d7203",
    messagingSenderId: "256705456625",
    appId: "1:256705456625:web:97c88e7a9f17645e78bc50"
};

const COLLECTIONS = {
    teams: 'teams',
    players: 'players',
    rounds: 'rounds',
    matches: 'matches',
    events: 'events',
    settings: 'settings',
    votes: 'votes'
};

const appState = {
    page: document.body.dataset.page || 'dashboard',
    cardFilter: 'todos',
    tableView: 'normal',
    adminView: 'overview',
    usingFirebase: false,
    data: null,
    firebase: null,
    authUser: null,
    dataLoaded: false
};

const defaultData = {
    settings: {},
    teams: [],
    players: [],
    rounds: [],
    matches: [],
    events: []
};

const INITIAL_SEED_DATA = {
    settings: {
        defaultPlayerImage: DEFAULT_PLAYER_IMAGE,
        teamOfRound: {
            votingConfigs: {},
            results: {},
            currentRoundId: ''
        }
    },
    teams: [
        { id: 'team_brasil', name: 'Brasil', logo: '' },
        { id: 'team_portugal', name: 'Portugal', logo: '' },
        { id: 'team_espanha', name: 'Espanha', logo: '' }
    ],
    players: [
        { id: 'player_raphael', name: 'RAPHAEL', teamId: 'team_portugal', mainPosition: 'goleiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_denilson', name: 'DENILSON', teamId: 'team_portugal', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_jairo', name: 'JAIRO', teamId: 'team_portugal', mainPosition: 'zagueiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_tabuada', name: 'TABUADA', teamId: 'team_portugal', mainPosition: 'zagueiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_diego_marcelo', name: 'DIEGO MARCELO', teamId: 'team_portugal', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_ramon', name: 'RAMON', teamId: 'team_portugal', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_lucas', name: 'LUCAS', teamId: 'team_portugal', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_lf', name: 'LF', teamId: 'team_portugal', mainPosition: 'atacante', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_hs', name: 'HS', teamId: 'team_portugal', mainPosition: 'atacante', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_np', name: 'NP', teamId: 'team_portugal', mainPosition: 'atacante', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_danilo', name: 'DANILO', teamId: 'team_espanha', mainPosition: 'goleiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_magno', name: 'MAGNO', teamId: 'team_espanha', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_riquelme', name: 'RIQUELME', teamId: 'team_espanha', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_caua', name: 'CAUÃ', teamId: 'team_espanha', mainPosition: 'atacante', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_macedo', name: 'MACEDO', teamId: 'team_espanha', mainPosition: 'zagueiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_diego_santos', name: 'DIEGO SANTOS', teamId: 'team_espanha', mainPosition: 'zagueiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_moises_neto', name: 'MOISES NETO', teamId: 'team_espanha', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_guilherme', name: 'GUILHERME', teamId: 'team_espanha', mainPosition: 'atacante', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_chorao', name: 'CHORÃO', teamId: 'team_espanha', mainPosition: 'atacante', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_avila', name: 'ÁVILA', teamId: 'team_espanha', mainPosition: 'zagueiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_leo', name: 'LEO', teamId: 'team_brasil', mainPosition: 'goleiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_vt', name: 'VT', teamId: 'team_brasil', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_vitinha', name: 'VITINHA', teamId: 'team_brasil', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_lisa', name: 'LISA', teamId: 'team_brasil', mainPosition: 'zagueiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_oziel', name: 'OZIEL', teamId: 'team_brasil', mainPosition: 'zagueiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_edilson', name: 'EDILSON', teamId: 'team_brasil', mainPosition: 'zagueiro', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_neto_leal', name: 'NETO LEAL', teamId: 'team_brasil', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_roque', name: 'ROQUE', teamId: 'team_brasil', mainPosition: 'meia', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_pablo', name: 'PABLO', teamId: 'team_brasil', mainPosition: 'atacante', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } },
        { id: 'player_cardoso', name: 'CARDOSO', teamId: 'team_brasil', mainPosition: 'atacante', photo: '', seedStats: { goals: 0, assists: 0, yellows: 0, reds: 0 } }
    ],
    rounds: Array.from({ length: 18 }, (_, index) => {
        const start = new Date('2026-07-07T12:00:00');
        start.setDate(start.getDate() + (index * 7));
        const yyyy = start.getFullYear();
        const mm = String(start.getMonth() + 1).padStart(2, '0');
        const dd = String(start.getDate()).padStart(2, '0');
        const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(start);
        return {
            id: `round_${String(index + 1).padStart(3, '0')}`,
            title: `Rodada ${index + 1}`,
            number: index + 1,
            date: `${yyyy}-${mm}-${dd}`,
            monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
            status: 'upcoming',
            votingEnabled: false,
            votingStartsAt: '',
            votingEndsAt: '',
            formation: '2-3-1'
        };
    }),
    matches: [],
    events: []
};


const CARTOLA_RULES_DEFAULT = {
    goal: 8,
    assist: 5,
    own_goal: -6,
    win: 3,
    draw: 1,
    yellow_card: -2,
    red_card: -5,
    // Mantidos apenas para compatibilidade com dados antigos.
    // A pontuação pública do Time do Campeonato não soma bônus de participação nem punição por derrota.
    participation: 0,
    loss: 0
};

const TEAM_OF_CHAMPIONSHIP_FORMATIONS = {
    // Formato: goleiro-defesa-meio-ataque.
    // O setor do meio aceita jogadores cadastrados como ala ou meia.
    '3-2-1': { goleiro: 1, zagueiro: 3, meio: 2, atacante: 1 },
    '2-3-1': { goleiro: 1, zagueiro: 2, meio: 3, atacante: 1 },
    '2-2-2': { goleiro: 1, zagueiro: 2, meio: 2, atacante: 2 },
    '1-3-2': { goleiro: 1, zagueiro: 1, meio: 3, atacante: 2 },
    '2-1-3': { goleiro: 1, zagueiro: 2, meio: 1, atacante: 3 }
};

const TEAM_OF_CHAMPIONSHIP_CONFIG = {
    formation: '2-3-1',
    positions: { ...TEAM_OF_CHAMPIONSHIP_FORMATIONS['2-3-1'] }
};

const TEAM_OF_CHAMPIONSHIP_POSITION_GROUPS = {
    goleiro: ['goleiro'],
    zagueiro: ['zagueiro'],
    meio: ['ala', 'meia'],
    atacante: ['atacante']
};


function rotateArray(values = [], offset = 0) {
    if (!Array.isArray(values) || !values.length) return [];
    const normalized = ((offset % values.length) + values.length) % values.length;
    if (normalized === 0) return [...values];
    return values.slice(normalized).concat(values.slice(0, normalized));
}

function buildBasePairs(teams = []) {
    const validTeams = [...teams].filter((team) => team && team.id);
    const pairs = [];

    for (let i = 0; i < validTeams.length; i += 1) {
        for (let j = i + 1; j < validTeams.length; j += 1) {
            pairs.push({
                teamAId: validTeams[i].id,
                teamBId: validTeams[j].id
            });
        }
    }

    return pairs;
}

function buildPairsForRound(basePairs = [], roundIndex = 0, teamCount = 0) {
    if (!basePairs.length) return [];

    if (teamCount === 3 && basePairs.length === 3) {
        const patterns = [
            [
                { pairIndex: 1, invert: false },
                { pairIndex: 0, invert: false },
                { pairIndex: 2, invert: false }
            ],
            [
                { pairIndex: 2, invert: false },
                { pairIndex: 1, invert: true },
                { pairIndex: 0, invert: false }
            ],
            [
                { pairIndex: 2, invert: true },
                { pairIndex: 0, invert: true },
                { pairIndex: 1, invert: true }
            ]
        ];
        const selected = patterns[roundIndex % patterns.length];
        return selected.map(({ pairIndex, invert }) => {
            const pair = basePairs[pairIndex];
            return invert
                ? { teamAId: pair.teamBId, teamBId: pair.teamAId }
                : { ...pair };
        });
    }

    const rotated = rotateArray(basePairs, roundIndex % basePairs.length);
    return rotated.map((pair, pairIndex) => {
        const shouldInvert = (roundIndex + pairIndex) % 2 === 1;
        return shouldInvert
            ? { teamAId: pair.teamBId, teamBId: pair.teamAId }
            : { ...pair };
    });
}

function buildRoundRobinMatches(rounds = [], teams = []) {
    const validTeams = [...teams].filter((team) => team && team.id);
    if (validTeams.length < 2 || !rounds.length) return [];

    const basePairs = buildBasePairs(validTeams);

    return rounds.flatMap((round, roundIndex) => {
        const orderedPairs = buildPairsForRound(basePairs, roundIndex, validTeams.length);
        return orderedPairs.map((pair, pairIndex) => ({
            id: `match_seed_${String(roundIndex + 1).padStart(3, '0')}_${String(pairIndex + 1).padStart(2, '0')}`,
            roundId: round.id,
            date: round.date,
            homeTeamId: pair.teamAId,
            awayTeamId: pair.teamBId,
            status: 'scheduled',
            homeScore: null,
            awayScore: null
        }));
    });
}

function canRegenerateSeedMatches(data) {
    const matches = Array.isArray(data?.matches) ? data.matches : [];
    const events = Array.isArray(data?.events) ? data.events : [];
    if (!matches.length) return true;
    if (events.length) return false;

    return matches.every((match) =>
        String(match.id || '').startsWith('match_seed_') &&
        match.status === 'scheduled' &&
        (match.homeScore === null || match.homeScore === '' || Number(match.homeScore) === 0) &&
        (match.awayScore === null || match.awayScore === '' || Number(match.awayScore) === 0)
    );
}

function regenerateSeedMatches(data) {
    const generated = buildRoundRobinMatches(data.rounds, data.teams);
    const timestamp = new Date().toISOString();
    data.matches = generated.map((match) => ({
        ...match,
        createdAt: timestamp,
        updatedAt: timestamp
    }));
    return data;
}

function ensureGeneratedMatches(data) {
    if (!data || !Array.isArray(data.rounds) || !Array.isArray(data.teams)) return data;
    if (Array.isArray(data.matches) && data.matches.length) return data;

    return regenerateSeedMatches(data);
}

function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function byId(arr, id) {
    return arr.find((item) => item.id === id);
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


function normalizePersonName(value = '') {
    return String(value || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function normalizeData(data) {
    const normalized = deepClone(defaultData);
    const source = data && typeof data === 'object' ? data : {};

    normalized.settings = {...(source.settings || {}) };
    delete normalized.settings.defaultTeamLogo;
    normalized.settings.defaultPlayerImage = DEFAULT_PLAYER_IMAGE;

    normalized.teams = Array.isArray(source.teams) ?
        source.teams.map((team) => ({
            id: team.id || uid('team'),
            name: (team.name || 'Time sem nome').trim(),
            logo: team.logo || '',
            createdAt: team.createdAt || ''
        })) : [];

    normalized.players = Array.isArray(source.players) ?
        source.players.map((player) => ({
            id: player.id || uid('player'),
            name: (player.name || 'Jogador sem nome').trim(),
            teamId: player.teamId || '',
            mainPosition: player.mainPosition || '',
            photo: player.photo || '',
            seedStats: {
                goals: Number(player?.seedStats?.goals || 0),
                assists: Number(player?.seedStats?.assists || 0),
                ownGoals: Number(player?.seedStats?.ownGoals || 0),
                yellows: Number(player?.seedStats?.yellows || 0),
                reds: Number(player?.seedStats?.reds || 0)
            },
            createdAt: player.createdAt || ''
        })) : [];

    normalized.rounds = Array.isArray(source.rounds) ?
        source.rounds.map((round) => ({
            id: round.id || uid('round'),
            title: (round.title || 'Rodada').trim(),
            number: Number(round.number || 0),
            date: round.date || '',
            monthLabel: round.monthLabel || '',
            status: round.status === 'finished' ? 'finished' : 'upcoming',
            votingEnabled: round.votingEnabled === true || round.votingEnabled === 'true',
            votingStartsAt: round.votingStartsAt || '',
            votingEndsAt: round.votingEndsAt || '',
            formation: round.formation || '2-3-1',
            createdAt: round.createdAt || ''
        })) : [];

    normalized.matches = Array.isArray(source.matches) ?
        source.matches.map((match) => ({
            id: match.id || uid('match'),
            roundId: match.roundId || '',
            date: match.date || '',
            homeTeamId: match.homeTeamId || '',
            awayTeamId: match.awayTeamId || '',
            status: match.status === 'finished' ? 'finished' : 'scheduled',
            homeScore: Number.isFinite(Number(match.homeScore)) ? Number(match.homeScore) : null,
            awayScore: Number.isFinite(Number(match.awayScore)) ? Number(match.awayScore) : null,
            createdAt: match.createdAt || ''
        })) : [];

    normalized.events = Array.isArray(source.events) ?
        source.events.map((event) => ({
            id: event.id || uid('event'),
            matchId: event.matchId || '',
            playerId: event.playerId || '',
            teamId: event.teamId || '',
            roundId: event.roundId || '',
            type: event.type || 'goal',
            relatedPlayerId: event.relatedPlayerId || '',
            responsibleTeamId: event.responsibleTeamId || '',
            creditedTeamId: event.creditedTeamId || '',
            order: Number.isFinite(Number(event.order)) ? Number(event.order) : 0,
            notes: event.notes || '',
            quantity: Math.max(1, Number(event.quantity || 1)),
            createdAt: event.createdAt || ''
        })) : [];

    return ensureGeneratedMatches(normalized);
}


function hasMeaningfulData(data) {
    return Boolean(
        data &&
        (data.teams?.length || data.players?.length || data.rounds?.length || data.matches?.length || data.events?.length)
    );
}

function buildSeedPlayerMap() {
    const idMap = new Map();
    const nameMap = new Map();

    (INITIAL_SEED_DATA.players || []).forEach((player) => {
        const seedStats = deepClone(player.seedStats || {});
        idMap.set(player.id, seedStats);
        nameMap.set(normalizePersonName(player.name), seedStats);
    });

    return { idMap, nameMap };
}

function applySeedStatsToData(data) {
    const normalized = normalizeData(data);
    const { idMap, nameMap } = buildSeedPlayerMap();

    normalized.players = normalized.players.map((player) => {
        const matchedSeed = idMap.get(player.id) || nameMap.get(normalizePersonName(player.name)) || {};
        const currentSeed = player.seedStats || {};

        return {
            ...player,
            seedStats: {
                goals: Number(currentSeed.goals ?? matchedSeed.goals ?? 0),
                assists: Number(currentSeed.assists ?? matchedSeed.assists ?? 0),
                ownGoals: Number(currentSeed.ownGoals ?? matchedSeed.ownGoals ?? 0),
                yellows: Number(currentSeed.yellows ?? matchedSeed.yellows ?? 0),
                reds: Number(currentSeed.reds ?? matchedSeed.reds ?? 0)
            }
        };
    });

    return normalized;
}

function shouldRefreshSeedData(data) {
    const version = data?.settings?.seedVersion || '';
    return version !== '2026-07-02-official-rosters-v11';
}

function canRegenerateSeedMatches(data) {
    const matches = Array.isArray(data?.matches) ? data.matches : [];
    const events = Array.isArray(data?.events) ? data.events : [];
    if (!matches.length) return true;
    if (events.length) return false;

    return matches.every((match) =>
        String(match.id || '').startsWith('match_seed_') &&
        match.status !== 'finished' &&
        (match.homeScore === null || match.homeScore === undefined) &&
        (match.awayScore === null || match.awayScore === undefined)
    );
}


function applyOfficialRoundSchedule(data) {
    if (!data || !Array.isArray(data.rounds)) return data;

    const start = new Date('2026-07-07T12:00:00');
    const roundByNumber = new Map();

    data.rounds.forEach((round, index) => {
        const number = Number(round.number || index + 1);
        const date = new Date(start);
        date.setDate(start.getDate() + ((number - 1) * 7));
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;
        const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);

        round.number = number;
        round.date = dateString;
        round.monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
        roundByNumber.set(round.id, dateString);
    });

    if (Array.isArray(data.matches)) {
        data.matches = data.matches.map((match) => ({
            ...match,
            date: roundByNumber.get(match.roundId) || match.date
        }));
    }

    return data;
}

function mergeSeedIntoExistingData(data) {
    const current = applySeedStatsToData(data || defaultData);
    const seeded = getInitialSeedData();
    const teamByName = new Map(current.teams.map((team) => [normalizePersonName(team.name), team]));
    const playerByName = new Map(current.players.map((player) => [normalizePersonName(player.name), player]));

    seeded.teams.forEach((team) => {
        if (!teamByName.has(normalizePersonName(team.name))) {
            current.teams.push(team);
            teamByName.set(normalizePersonName(team.name), team);
        }
    });

    const officialPlayerIds = new Set(seeded.players.map((player) => player.id));
    const currentPlayerById = new Map(current.players.map((player) => [player.id, player]));

    current.players = seeded.players.map((seedPlayer) => {
        const existing = currentPlayerById.get(seedPlayer.id) || playerByName.get(normalizePersonName(seedPlayer.name));
        return {
            ...seedPlayer,
            photo: existing?.photo || seedPlayer.photo || '',
            seedStats: deepClone(existing?.seedStats || seedPlayer.seedStats || {})
        };
    });

    current.events = Array.isArray(current.events)
        ? current.events.filter((event) => officialPlayerIds.has(event.playerId) && (!event.relatedPlayerId || officialPlayerIds.has(event.relatedPlayerId)))
        : [];

    const roundByNumber = new Map(current.rounds.map((round) => [Number(round.number || 0), round]));
    seeded.rounds.forEach((seedRound) => {
        const existing = roundByNumber.get(Number(seedRound.number || 0));
        if (existing) {
            existing.title = existing.title || seedRound.title;
            existing.formation = existing.formation || seedRound.formation;
        } else {
            current.rounds.push(seedRound);
            roundByNumber.set(Number(seedRound.number || 0), seedRound);
        }
    });

    applyOfficialRoundSchedule(current);

    current.settings = {
        ...(current.settings || {}),
        defaultPlayerImage: DEFAULT_PLAYER_IMAGE,
        seedVersion: '2026-07-02-official-rosters-v11',
        updatedAt: new Date().toISOString()
    };

    if (canRegenerateSeedMatches(current)) {
        current.matches = buildRoundRobinMatches(current.rounds, current.teams).map((match) => ({
            ...match,
            createdAt: match.createdAt || new Date().toISOString(),
            updatedAt: match.updatedAt || new Date().toISOString()
        }));
    } else {
        ensureGeneratedMatches(current);
    }

    return applySeedStatsToData(current);
}

function getInitialSeedData() {
    const seeded = normalizeData(INITIAL_SEED_DATA);
    const timestamp = new Date().toISOString();

    seeded.settings = {
        ...seeded.settings,
        defaultPlayerImage: DEFAULT_PLAYER_IMAGE,
        seedVersion: '2026-07-02-official-rosters-v11',
        updatedAt: timestamp
    };

    seeded.teams = seeded.teams.map((team) => ({
        ...team,
        createdAt: team.createdAt || timestamp,
        updatedAt: team.updatedAt || timestamp
    }));

    seeded.players = seeded.players.map((player) => ({
        ...player,
        createdAt: player.createdAt || timestamp,
        updatedAt: player.updatedAt || timestamp
    }));

    seeded.rounds = seeded.rounds.map((round) => ({
        ...round,
        createdAt: round.createdAt || timestamp,
        updatedAt: round.updatedAt || timestamp
    }));

    seeded.matches = seeded.matches.map((match) => ({
        ...match,
        createdAt: match.createdAt || timestamp,
        updatedAt: match.updatedAt || timestamp
    }));

    seeded.events = seeded.events.map((event) => ({
        ...event,
        createdAt: event.createdAt || timestamp,
        updatedAt: event.updatedAt || timestamp
    }));

    applyOfficialRoundSchedule(seeded);
    return ensureGeneratedMatches(seeded);
}

async function hydrateFirebaseWithSeedData(seedData) {
    if (!appState.usingFirebase) return;

    const writes = [];
    const officialPlayerIds = new Set((seedData.players || []).map((player) => player.id));
    const currentPlayerDocs = await getCollectionDocs(COLLECTIONS.players);

    currentPlayerDocs.forEach((player) => {
        if (!officialPlayerIds.has(player.id)) {
            writes.push(deleteDoc(COLLECTIONS.players, player.id));
        }
    });

    seedData.teams.forEach((team) => writes.push(setDoc(COLLECTIONS.teams, team.id, team, false)));
    seedData.players.forEach((player) => writes.push(setDoc(COLLECTIONS.players, player.id, player, false)));
    seedData.rounds.forEach((round) => writes.push(setDoc(COLLECTIONS.rounds, round.id, round, false)));
    seedData.matches.forEach((match) => writes.push(setDoc(COLLECTIONS.matches, match.id, match, false)));
    seedData.events.forEach((item) => writes.push(setDoc(COLLECTIONS.events, item.id, item, false)));
    writes.push(setDoc(COLLECTIONS.settings, 'main', seedData.settings, true));

    await Promise.all(writes);
}

function formatDate(dateString) {
    if (!dateString) return 'Sem data';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(`${dateString}T12:00:00`));
}

function formatDateLong(dateString) {
    if (!dateString) return 'Sem data';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(`${dateString}T12:00:00`));
}

function setNotice(id, message, type = 'success') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = `notice ${type}`;
}

function hideNotice(id) {
    const el = document.getElementById(id);
    if (el) {
        el.className = 'notice hidden';
        el.textContent = '';
    }
}

function canUseFirebase() {
    return Boolean(
        window.firebase &&
        firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        firebaseConfig.authDomain
    );
}

async function initFirebase() {
    if (!canUseFirebase()) return null;

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    appState.firebase = {
        app: firebase.app(),
        auth: firebase.auth(),
        db: firebase.firestore(),
        fieldValue: firebase.firestore.FieldValue,
        timestamp: firebase.firestore.FieldValue.serverTimestamp
    };
    appState.usingFirebase = true;

    return appState.firebase;
}

function loadLocalData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            let normalized = applySeedStatsToData(JSON.parse(saved));
            if (hasMeaningfulData(normalized)) {
                if (shouldRefreshSeedData(normalized)) {
                    normalized = mergeSeedIntoExistingData(normalized);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
                }
                return normalized;
            }
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    const seeded = mergeSeedIntoExistingData(getInitialSeedData());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
}

function persistLocalSnapshot() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applySeedStatsToData(appState.data || defaultData)));
}

function collectionRef(name) {
    return appState.firebase.db.collection(name);
}

async function getCollectionDocs(name) {
    const snap = await collectionRef(name).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function sanitizeForFirestore(data) {
    return JSON.parse(JSON.stringify(data));
}

async function loadFirebaseData() {
    const [teams, players, rounds, matches, events, settingsDocs] = await Promise.all([
        getCollectionDocs(COLLECTIONS.teams),
        getCollectionDocs(COLLECTIONS.players),
        getCollectionDocs(COLLECTIONS.rounds),
        getCollectionDocs(COLLECTIONS.matches),
        getCollectionDocs(COLLECTIONS.events),
        getCollectionDocs(COLLECTIONS.settings)
    ]);

    const settingsDoc = settingsDocs.find((item) => item.id === 'main') || {};

    appState.data = applySeedStatsToData({
        settings: settingsDoc,
        teams,
        players,
        rounds,
        matches,
        events
    });

    persistLocalSnapshot();
}

async function ensureFirebaseBaseDocs() {
    const settingsDoc = collectionRef(COLLECTIONS.settings).doc('main');
    const snap = await settingsDoc.get();
    if (!snap.exists) {
        await settingsDoc.set({
            defaultPlayerImage: DEFAULT_PLAYER_IMAGE,
            updatedAt: appState.firebase.timestamp()
        }, { merge: true });
    }
}

async function loadData() {
    try {
        await initFirebase();
    } catch (error) {
        console.error('Falha ao inicializar Firebase:', error);
        appState.usingFirebase = false;
    }

    if (appState.usingFirebase) {
        try {
            await ensureFirebaseBaseDocs();
            await loadFirebaseData();

            if (!hasMeaningfulData(appState.data)) {
                const seeded = mergeSeedIntoExistingData(getInitialSeedData());
                appState.data = seeded;
                await hydrateFirebaseWithSeedData(seeded);
                persistLocalSnapshot();
            } else if (shouldRefreshSeedData(appState.data)) {
                appState.data = mergeSeedIntoExistingData(appState.data);
                await hydrateFirebaseWithSeedData(appState.data);
                persistLocalSnapshot();
            }

            return;
        } catch (error) {
            console.error('Falha ao carregar Firestore; usando dados locais até o login:', error);
        }
    }

    appState.data = loadLocalData();
}

async function ensureDataLoaded() {
    if (appState.dataLoaded) return;
    await loadData();
    appState.dataLoaded = true;
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


function loadImageElement(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Não foi possível ler a imagem selecionada.'));
        };
        img.src = url;
    });
}

async function imageFileToDataUrl(file, options = {}) {
    const {
        maxWidth = 900,
            maxHeight = 900,
            quality = 0.86,
            preferredMimeType = 'image/webp',
            maxBytes = 320000
    } = options;

    if ((file.type || '').includes('svg')) {
        return fileToDataUrl(file);
    }

    const img = await loadImageElement(file);
    let ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
    let width = Math.max(1, Math.round(img.width * ratio));
    let height = Math.max(1, Math.round(img.height * ratio));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const render = (w, h) => {
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
    };

    render(width, height);

    const mimeCandidates = [];
    if (preferredMimeType) mimeCandidates.push(preferredMimeType);
    if ((file.type || '').includes('png') || (file.type || '').includes('webp')) {
        mimeCandidates.push('image/webp');
        mimeCandidates.push('image/png');
    } else {
        mimeCandidates.push('image/webp');
        mimeCandidates.push('image/jpeg');
    }

    let mimeType = [...new Set(mimeCandidates)].find(Boolean) || 'image/webp';
    let currentQuality = quality;
    let dataUrl = canvas.toDataURL(mimeType, currentQuality);

    while (dataUrl.length > maxBytes && currentQuality > 0.5) {
        currentQuality -= 0.08;
        dataUrl = canvas.toDataURL(mimeType, currentQuality);
    }

    while (dataUrl.length > maxBytes && width > 240 && height > 240) {
        width = Math.max(240, Math.round(width * 0.86));
        height = Math.max(240, Math.round(height * 0.86));
        render(width, height);
        currentQuality = Math.min(currentQuality, 0.76);
        dataUrl = canvas.toDataURL(mimeType, currentQuality);

        while (dataUrl.length > maxBytes && currentQuality > 0.5) {
            currentQuality -= 0.06;
            dataUrl = canvas.toDataURL(mimeType, currentQuality);
        }
    }

    return dataUrl;
}

function isLikelyInlineImage(url = '') {
    return typeof url === 'string' && url.startsWith('data:image/');
}

function humanizeFirebaseError(error, context = 'operação') {
    const code = error?.code || '';
    const message = error?.message || '';

    if (code.includes('permission-denied')) {
        return `Sem permissão no Firebase para concluir ${context}. Confira as regras do Firestore/Auth.`;
    }

    if (code.includes('network-request-failed')) {
        return 'Falha de conexão ao acessar o Firebase. Tente novamente.';
    }

    if (code.includes('auth/')) {
        return message || 'Sua sessão do Firebase expirou. Entre novamente.';
    }

    return message || `Não foi possível concluir ${context}.`;
}

function withTimeout(promise, ms, message) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(message)), ms);
        Promise.resolve(promise)
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

async function uploadImage(file, folder) {
    if (!file) return '';

    const isLogo = folder === 'team-logos';
    return imageFileToDataUrl(file, {
        maxWidth: isLogo ? 512 : 900,
        maxHeight: isLogo ? 512 : 900,
        quality: isLogo ? 0.92 : 0.84,
        preferredMimeType: isLogo ? 'image/webp' : 'image/webp',
        maxBytes: isLogo ? 220000 : 320000
    });
}

async function withAdminSubmit(formElement, pendingLabel, action) {
    const submitButton = formElement?.querySelector('button[type="submit"]');
    const originalLabel = submitButton?.textContent || pendingLabel;

    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = pendingLabel;
        }

        hideNotice('admin-notice');
        await action();
    } catch (error) {
        console.error(error);
        showAdminMessage(humanizeFirebaseError(error), 'error');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalLabel;
        }
    }
}

function getSettings() {
    return { defaultPlayerImage: DEFAULT_PLAYER_IMAGE, ...(appState.data?.settings || {}) };
}

function getPlayerPhoto(player) {
    return player?.photo || DEFAULT_PLAYER_IMAGE;
}

function getTeamLogo(team) {
    return team?.logo || DEFAULT_TEAM_IMAGE;
}

function getInitials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (!parts.length) return '?';
    return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

function renderTeamIdentity(team, size = 'sm') {
    const className = size === 'lg' ? 'team-badge team-badge-lg' : 'team-badge';
    const logo = getTeamLogo(team);
    if (logo) {
        return `<img class="${className}" src="${escapeHtml(logo)}" alt="${escapeHtml(team?.name || 'Time')}">`;
    }
    return `<div class="${className} team-badge-fallback" aria-label="${escapeHtml(team?.name || 'Time')}">${escapeHtml(getInitials(team?.name || 'Time'))}</div>`;
}

function getFinishedMatches() {
    return appState.data.matches.filter((match) => match.status === 'finished');
}

function getUpcomingRounds() {
    return appState.data.rounds
        .filter((round) => round.status === 'upcoming')
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

function getNextRound() {
    return getUpcomingRounds()[0] || null;
}

function matchesByRound(roundId) {
    return appState.data.matches
        .filter((match) => match.roundId === roundId)
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

function getPlayerStats() {
    const finishedMatchIds = new Set(getFinishedMatches().map((match) => match.id));

    return appState.data.players.map((player) => {
        const events = appState.data.events.filter((event) => (
            event.playerId === player.id &&
            (!event.matchId || finishedMatchIds.has(event.matchId))
        ));
        const team = byId(appState.data.teams, player.teamId);
        const seed = player.seedStats || {};

        const countByType = (type) => events
            .filter((event) => event.type === type)
            .reduce((sum, event) => sum + Math.max(1, Number(event.quantity || 1)), 0);

        const goals = Number(seed.goals || 0) + countByType('goal');
        const assists = Number(seed.assists || 0) + countByType('assist');
        const ownGoals = Number(seed.ownGoals || 0) + countByType('own_goal');
        const yellows = Number(seed.yellows || 0) + countByType('yellow_card');
        const reds = Number(seed.reds || 0) + countByType('red_card');

        return {
            ...player,
            team,
            goals,
            assists,
            ownGoals,
            yellows,
            reds,
            totalCards: yellows + reds
        };
    });
}


function getCartolaRules() {
    return {
        ...CARTOLA_RULES_DEFAULT,
        ...(appState.data?.settings?.cartolaRules || {})
    };
}

function normalizeTeamOfChampionshipPositions(formation, rawPositions = {}) {
    const base = TEAM_OF_CHAMPIONSHIP_FORMATIONS[formation] || TEAM_OF_CHAMPIONSHIP_CONFIG.positions;
    const raw = rawPositions || {};

    return {
        goleiro: Number(raw.goleiro ?? base.goleiro ?? 1),
        zagueiro: Number(raw.zagueiro ?? raw.defesa ?? base.zagueiro ?? 0),
        meio: Number(raw.meio ?? ((Number(raw.ala || 0) + Number(raw.meia || 0)) || base.meio || 0)),
        atacante: Number(raw.atacante ?? raw.ataque ?? base.atacante ?? 0)
    };
}

function getChampionshipPlayerSector(position = '') {
    return Object.entries(TEAM_OF_CHAMPIONSHIP_POSITION_GROUPS)
        .find(([, accepted]) => accepted.includes(position))?.[0] || '';
}

function getTeamOfChampionshipConfig() {
    const saved = appState.data?.settings?.teamOfChampionship || {};
    const formation = saved.formation || TEAM_OF_CHAMPIONSHIP_CONFIG.formation;

    return {
        formation,
        positions: normalizeTeamOfChampionshipPositions(formation, saved.positions)
    };
}

async function saveTeamOfChampionshipConfig(formation = TEAM_OF_CHAMPIONSHIP_CONFIG.formation) {
    const nextConfig = {
        formation,
        positions: normalizeTeamOfChampionshipPositions(formation)
    };

    appState.data.settings = {
        ...(appState.data.settings || {}),
        teamOfChampionship: nextConfig,
        updatedAt: new Date().toISOString()
    };

    await setDoc(COLLECTIONS.settings, 'main', appState.data.settings, true);
    persistLocalSnapshot();
    return nextConfig;
}

function getFinishedMatchesByTeam(teamId) {
    return getFinishedMatches().filter((match) => match.homeTeamId === teamId || match.awayTeamId === teamId);
}

function compareTeamOfChampionshipPlayers(a, b) {
    return (
        Number(b.cartolaScore || 0) - Number(a.cartolaScore || 0) ||
        Number(b.goals || 0) - Number(a.goals || 0) ||
        Number(b.assists || 0) - Number(a.assists || 0) ||
        Number(a.yellows || 0) - Number(b.yellows || 0) ||
        Number(a.reds || 0) - Number(b.reds || 0) ||
        Number(b.teamGoalBalance || 0) - Number(a.teamGoalBalance || 0) ||
        String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR')
    );
}

function getPlayerCartolaStats() {
    const rules = getCartolaRules();
    const baseStats = getPlayerStats();

    return baseStats.map((player) => {
        const finishedMatches = getFinishedMatchesByTeam(player.teamId);
        let resultPoints = 0;
        let teamGoalsFor = 0;
        let teamGoalsAgainst = 0;

        finishedMatches.forEach((match) => {
            const isHome = match.homeTeamId === player.teamId;
            const goalsFor = Number(isHome ? match.homeScore : match.awayScore) || 0;
            const goalsAgainst = Number(isHome ? match.awayScore : match.homeScore) || 0;

            teamGoalsFor += goalsFor;
            teamGoalsAgainst += goalsAgainst;

            if (goalsFor > goalsAgainst) {
                resultPoints += Number(rules.win || 0);
            } else if (goalsFor === goalsAgainst) {
                resultPoints += Number(rules.draw || 0);
            }
        });

        const score =
            (Number(player.goals || 0) * Number(rules.goal || 0)) +
            (Number(player.assists || 0) * Number(rules.assist || 0)) +
            (Number(player.ownGoals || 0) * Number(rules.own_goal || 0)) +
            (Number(player.yellows || 0) * Number(rules.yellow_card || 0)) +
            (Number(player.reds || 0) * Number(rules.red_card || 0)) +
            resultPoints;

        return {
            ...player,
            cartolaScore: Number(score.toFixed(2)),
            cartolaBreakdown: {
                goals: Number(player.goals || 0) * Number(rules.goal || 0),
                assists: Number(player.assists || 0) * Number(rules.assist || 0),
                ownGoals: Number(player.ownGoals || 0) * Number(rules.own_goal || 0),
                yellows: Number(player.yellows || 0) * Number(rules.yellow_card || 0),
                reds: Number(player.reds || 0) * Number(rules.red_card || 0),
                participation: 0,
                results: resultPoints
            },
            matchesPlayedByTeam: finishedMatches.length,
            teamGoalsFor,
            teamGoalsAgainst,
            teamGoalBalance: teamGoalsFor - teamGoalsAgainst
        };
    }).sort(compareTeamOfChampionshipPlayers);
}

function getTimeDoCampeonato(formationOverride = '') {
    const ranking = getPlayerCartolaStats();
    const lineup = [];
    const usedIds = new Set();
    const savedConfig = getTeamOfChampionshipConfig();
    const formation = formationOverride || savedConfig.formation;
    const config = {
        formation,
        positions: normalizeTeamOfChampionshipPositions(formation, savedConfig.positions)
    };
    const slots = config.positions;

    Object.entries(slots).forEach(([sector, amount]) => {
        const acceptedPositions = TEAM_OF_CHAMPIONSHIP_POSITION_GROUPS[sector] || [sector];
        const selected = ranking
            .filter((player) => acceptedPositions.includes(player.mainPosition) && !usedIds.has(player.id))
            .slice(0, Number(amount || 0));

        selected.forEach((player) => {
            usedIds.add(player.id);
            lineup.push({
                ...player,
                championshipSector: sector
            });
        });
    });

    return {
        formation: config.formation,
        positions: { ...config.positions },
        lineup,
        ranking
    };
}

function renderCartolaScore(value) {
    return `${Number(value || 0).toFixed(1)} pts`;
}

function renderTimeDoCampeonatoPitch(targetId, formationOverride = '') {
    const el = document.getElementById(targetId);
    if (!el) return;

    const payload = getTimeDoCampeonato(formationOverride);
    const lineupByPosition = {
        goleiro: payload.lineup.filter((player) => player.championshipSector === 'goleiro'),
        zagueiro: payload.lineup.filter((player) => player.championshipSector === 'zagueiro'),
        meio: payload.lineup.filter((player) => player.championshipSector === 'meio'),
        atacante: payload.lineup.filter((player) => player.championshipSector === 'atacante')
    };
    const rows = [
        { key: 'goleiro', top: 12, count: payload.positions.goleiro || 1, label: 'Goleiro' },
        { key: 'zagueiro', top: 33, count: payload.positions.zagueiro || 0, label: 'Defesa' },
        { key: 'meio', top: 57, count: payload.positions.meio || 0, label: 'Meio' },
        { key: 'atacante', top: 82, count: payload.positions.atacante || 0, label: 'Ataque' }
    ];

    const nodes = rows.map((row) => {
        const items = lineupByPosition[row.key] || [];
        const count = Math.max(Number(row.count || 0), items.length || 0);
        if (!count) return '';

        return Array.from({ length: count }, (_, index) => {
            const left = count === 1 ? 50 : 18 + ((64 / (count - 1)) * index);
            const player = items[index];
            return `
                <div class="team-of-round-player ${row.key === 'goleiro' ? 'is-goalkeeper' : ''}" style="left:${left}%; top:${row.top}%">
                    <div class="team-of-round-player-figure">
                        ${player ? `<img class="team-of-round-player-photo" src="${escapeHtml(getPlayerPhoto(player))}" alt="${escapeHtml(player.name)}">` : '<div class="team-of-round-placeholder-dot">+</div>'}
                    </div>
                    <div class="team-of-round-player-label championship-player-label">
                        ${player ? renderTeamIdentity(player.team) : ''}
                        <div class="championship-player-copy">
                            <strong>${escapeHtml(player?.name || 'Vago')}</strong>
                            <span>${escapeHtml(player ? renderCartolaScore(player.cartolaScore) : '—')}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }).join('');

    el.innerHTML = `
        <div class="team-of-round-surface championship-surface">
            <div class="team-of-round-toolbar championship-toolbar">
                <div class="team-of-round-pills">
                    <div class="team-of-round-pill"><span>Formação</span><strong>${escapeHtml(payload.formation)}</strong></div>
                    <div class="team-of-round-pill"><span>Critério</span><strong>Nota total</strong></div>
                </div>
                <div class="team-of-round-empty-note">Atualiza após cada jogo.</div>
            </div>
            <div class="team-of-round-pitch-frame">
                <div class="team-of-round-pitch championship-pitch" style="background-image:url('${escapeHtml(createDefaultChampionshipFieldImage())}')">
                    ${nodes}
                </div>
            </div>
        </div>`;
}

function renderCartolaRanking(targetId, limit = 0) {
    const el = document.getElementById(targetId);
    if (!el) return;

    const toggleSlot = targetId === 'time-campeonato-ranking'
        ? document.getElementById('time-campeonato-ranking-toggle-slot')
        : null;
    const ranking = getPlayerCartolaStats();
    const shouldUseAccordion = limit <= 0 && ranking.length > 3;
    const isExpanded = shouldUseAccordion && el.dataset.expanded === 'true';
    const list = shouldUseAccordion
        ? (isExpanded ? ranking : ranking.slice(0, 3))
        : (limit > 0 ? ranking.slice(0, limit) : ranking);

    if (!list.length) {
        if (toggleSlot) toggleSlot.innerHTML = '<span class="round-pill">Ranking</span>';
        el.innerHTML = renderEmptyState('Ainda sem pontuação.');
        return;
    }

    const positions = rankingPositions(list, 'cartolaScore');
    const toggleMarkup = shouldUseAccordion ? `
        <button class="cartola-ranking-toggle" type="button" aria-expanded="${isExpanded ? 'true' : 'false'}" aria-controls="${escapeHtml(targetId)}-list">
            <span>${isExpanded ? 'Mostrar apenas top 3' : 'Ver ranking completo'}</span>
        </button>` : '<span class="round-pill">Ranking</span>';

    if (toggleSlot) {
        toggleSlot.innerHTML = toggleMarkup;
    }

    el.innerHTML = `
        <div class="cartola-ranking-accordion ${isExpanded ? 'is-open' : 'is-closed'}">
            <div class="cartola-ranking-topbar">
                <div class="header-row ranking-header cartola-ranking-header">
                    <div>#</div>
                    <div>Jogador</div>
                    <div>Nota</div>
                </div>
                ${toggleSlot ? '' : toggleMarkup}
            </div>
            <div class="full-list cartola-ranking-list" id="${escapeHtml(targetId)}-list">
                ${list.map((player, index) => `
                    <article class="ranking-row premium-row cartola-ranking-row">
                        <div class="stat-rank">${positions[index]}</div>
                        <div class="player-block">
                            <img class="player-photo" src="${escapeHtml(getPlayerPhoto(player))}" alt="${escapeHtml(player.name)}">
                            <div class="player-meta">
                                <div class="player-name">${escapeHtml(player.name)}</div>
                                <div class="team-line">${renderTeamIdentity(player.team)}<span>${escapeHtml(player.team?.name || 'Sem time')} • ${escapeHtml(positionLabel(player.mainPosition))}</span></div>
                            </div>
                        </div>
                        <div class="stat-value">${Number(player.cartolaScore || 0).toFixed(1)}</div>
                    </article>`).join('')}
            </div>
        </div>`;

    const toggleButton = (toggleSlot || el).querySelector('.cartola-ranking-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            el.dataset.expanded = el.dataset.expanded === 'true' ? 'false' : 'true';
            renderCartolaRanking(targetId, limit);
        });
    }
}

function renderDashboardChampionshipCard() {
    const el = document.getElementById('dashboard-time-campeonato-link');
    if (!el) return;

    const payload = getTimeDoCampeonato();
    const ranking = payload.ranking.slice(0, 3);

    if (!ranking.length) {
        el.innerHTML = renderEmptyState('Ainda sem pontuação para montar o time ideal.');
        return;
    }

    el.innerHTML = `
        <div class="team-of-round-surface championship-link-surface">
            <div class="team-of-round-toolbar championship-link-toolbar">
                <div class="team-of-round-pills">
                    <div class="team-of-round-pill"><span>Formação</span><strong>${escapeHtml(payload.formation)}</strong></div>
                    <div class="team-of-round-pill"><span>Destaques</span><strong>Top 3</strong></div>
                </div>
                <div class="team-of-round-empty-note">Abra a página para ver o campo completo.</div>
            </div>
            <div class="dashboard-split-stats single-column championship-link-list">
                ${ranking.map((player, index) => `
                    <div class="mini-stat-card no-link championship-link-item">
                        <div class="mini-stat-row no-border">
                            <span class="mini-rank">${index + 1}</span>
                            <span class="mini-name">${escapeHtml(player.name)}</span>
                            <strong>${Number(player.cartolaScore || 0).toFixed(1)}</strong>
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;
}

function renderTimeDoCampeonatoPage() {
    renderTimeDoCampeonatoPitch('time-campeonato-campo');
    renderCartolaRanking('time-campeonato-ranking');
}

function createDefaultChampionshipFieldImage() {
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 920">
            <defs>
                <linearGradient id="bgcampeonato" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#08111f"/>
                    <stop offset="52%" stop-color="#0b1628"/>
                    <stop offset="100%" stop-color="#060a13"/>
                </linearGradient>
                <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#7b2dff"/>
                    <stop offset="18%" stop-color="#ff4fb8"/>
                    <stop offset="36%" stop-color="#ff2e3f"/>
                    <stop offset="54%" stop-color="#ff7a21"/>
                    <stop offset="72%" stop-color="#caff3a"/>
                    <stop offset="100%" stop-color="#79ffd7"/>
                </linearGradient>
                <linearGradient id="stripe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(121,255,215,0.08)"/>
                    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                </linearGradient>
            </defs>
            <rect width="1600" height="920" fill="url(#bgcampeonato)"/>
            <rect width="1600" height="920" fill="url(#stripe)" opacity="0.55"/>
            <g opacity="0.06">
                <rect x="180" y="0" width="120" height="920" fill="#79ffd7"/>
                <rect x="480" y="0" width="120" height="920" fill="#2555ff"/>
                <rect x="780" y="0" width="120" height="920" fill="#7b2dff"/>
                <rect x="1080" y="0" width="120" height="920" fill="#ff2e3f"/>
            </g>
            <rect x="26" y="26" width="1548" height="868" rx="24" fill="none" stroke="url(#accent)" stroke-width="6" opacity="0.95"/>
            <g fill="none" stroke="#e9dfc5" stroke-width="6" opacity="0.92">
                <rect x="34" y="34" width="1532" height="852" rx="16"/>
                <rect x="446" y="34" width="708" height="150" rx="8"/>
                <rect x="610" y="34" width="380" height="78" rx="8"/>
                <line x1="34" y1="460" x2="1566" y2="460"/>
                <circle cx="800" cy="460" r="88"/>
            </g>
        </svg>`);
}

function getStandings() {
    const table = appState.data.teams.map((team) => ({
        id: team.id,
        name: team.name,
        logo: getTeamLogo(team),
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        yellows: 0,
        reds: 0,
        cards: 0,
        form: []
    }));

    const finished = getFinishedMatches().sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    finished.forEach((match) => {
        const home = byId(table, match.homeTeamId);
        const away = byId(table, match.awayTeamId);
        if (!home || !away) return;

        const homeScore = Number(match.homeScore || 0);
        const awayScore = Number(match.awayScore || 0);

        home.played += 1;
        away.played += 1;

        home.goalsFor += homeScore;
        home.goalsAgainst += awayScore;
        away.goalsFor += awayScore;
        away.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
            home.wins += 1;
            home.points += 3;
            away.losses += 1;
            home.form.push('V');
            away.form.push('D');
        } else if (awayScore > homeScore) {
            away.wins += 1;
            away.points += 3;
            home.losses += 1;
            home.form.push('D');
            away.form.push('V');
        } else {
            home.draws += 1;
            away.draws += 1;
            home.points += 1;
            away.points += 1;
            home.form.push('E');
            away.form.push('E');
        }
    });

    appState.data.players.forEach((player) => {
        const team = byId(table, player.teamId);
        if (!team) return;

        team.yellows += Number(player?.seedStats?.yellows || 0);
        team.reds += Number(player?.seedStats?.reds || 0);
    });

    appState.data.events.forEach((event) => {
        const team = byId(table, event.teamId);
        if (!team) return;

        const qty = Math.max(1, Number(event.quantity || 1));

        if (event.type === 'yellow_card') {
            team.yellows += qty;
        }

        if (event.type === 'red_card') {
            team.reds += qty;
        }
    });

    table.forEach((team) => {
        team.goalDiff = team.goalsFor - team.goalsAgainst;
        team.cards = team.yellows + team.reds;
        team.form = team.form.slice(-3);
    });

    return table.sort(
        (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor ||
        a.cards - b.cards ||
        a.name.localeCompare(b.name, 'pt-BR')
    );
}

function rankingPositions(sortedValues, key) {
    let last = null;
    let pos = 0;

    return sortedValues.map((item, index) => {
        if (item[key] !== last) {
            pos = index + 1;
            last = item[key];
        }
        return pos;
    });
}

function renderEmptyState(message = 'Sem dados.') {
    return `<div class="empty">${escapeHtml(message)}</div>`;
}

function renderDashboardList(targetId, players, metric, limit = 5, cardsMode = false) {
    const el = document.getElementById(targetId);
    if (!el) return;

    const list = players.slice(0, limit);
    if (!list.length) {
        el.innerHTML = renderEmptyState();
        return;
    }

    const positions = rankingPositions(list, metric);
    el.innerHTML = `
    <div class="stats-list">
      ${list
        .map(
          (player, index) => `
            <article class="stat-row premium-row">
              <div class="stat-rank">${positions[index]}</div>
              <img class="player-photo" src="${escapeHtml(getPlayerPhoto(player))}" alt="${escapeHtml(player.name)}">
              <div class="player-meta">
                <div class="player-name">${escapeHtml(player.name)}</div>
                <div class="team-line">
                  ${renderTeamIdentity(player.team)}
                  <span>${escapeHtml(player.team?.name || 'Sem time')}</span>
                </div>
              </div>
              ${
                cardsMode
                  ? `<div class="card-stats"><small><span class="card-icon yellow"></span>${player.yellows}</small><small><span class="card-icon red"></span>${player.reds}</small><div class="stat-value">${player.totalCards}</div></div>`
                  : `<div class="stat-value">${player[metric]}</div>`
              }
            </article>`
        )
        .join('')}
    </div>`;
}

function renderFullRanking(targetId, items, metric, label) {
  const el = document.getElementById(targetId);
  if (!el) return;

  if (!items.length) {
    el.innerHTML = renderEmptyState('Nenhum ranking disponível ainda.');
    return;
  }

  const positions = rankingPositions(items, metric);
  const isCompactRankingPage = ['artilheiros-content', 'assistencias-content'].includes(targetId);
  const headerClass = isCompactRankingPage ? 'header-row ranking-header' : 'header-row';
  const rowClass = isCompactRankingPage ? 'full-row ranking-row premium-row' : 'full-row premium-row';

  el.innerHTML = `
    <div class="${headerClass}">
      <div>#</div>
      <div>Jogador</div>
      <div>${escapeHtml(label)}</div>
    </div>
    <div class="full-list">
      ${items
        .map(
          (item, index) => `
            <article class="${rowClass}">
              <div class="stat-rank">${positions[index]}</div>
              <div class="player-block">
                <img class="player-photo" src="${escapeHtml(getPlayerPhoto(item))}" alt="${escapeHtml(item.name)}">
                <div class="player-meta">
                  <div class="player-name">${escapeHtml(item.name)}</div>
                  <div class="team-line">
                    ${renderTeamIdentity(item.team)}
                    <span>${escapeHtml(item.team?.name || 'Sem time')}</span>
                  </div>
                </div>
              </div>
              <div class="stat-value">${item[metric]}</div>
            </article>`
        )
        .join('')}
    </div>`;
}

function renderDashboardGoalsAssists() {
  const el = document.getElementById('dashboard-gols-assistencias');
  if (!el) return;

  const stats = getPlayerStats();
  const scorers = [...stats]
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, 3);
  const assists = [...stats]
    .sort((a, b) => b.assists - a.assists || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, 3);

  const renderMini = (title, items, metric, href) => `
    <a class="mini-stat-card" href="${href}">
      <div class="mini-stat-head">
        <strong>${title}</strong>
        <span>Ver mais</span>
      </div>
      ${items.length ? items.map((item, index) => `
        <div class="mini-stat-row">
          <span class="mini-rank">${index + 1}</span>
          <span class="mini-name">${escapeHtml(item.name)}</span>
          <strong>${Number(item[metric] || 0)}</strong>
        </div>
      `).join('') : '<div class="empty">Sem dados.</div>'}
    </a>`;

  el.innerHTML = `
    <div class="dashboard-split-stats">
      ${renderMini('Artilheiros', scorers, 'goals', 'artilheiros.html')}
      ${renderMini('Assistências', assists, 'assists', 'assistencias.html')}
    </div>`;
}

function renderCardsPage() {
  const el = document.getElementById('cartoes-content');
  if (!el) return;

  const list = getPlayerStats().sort(
    (a, b) =>
      b.totalCards - a.totalCards ||
      b.yellows - a.yellows ||
      b.reds - a.reds ||
      a.name.localeCompare(b.name, 'pt-BR')
  );

  if (!list.length) {
    el.innerHTML = renderEmptyState('Nenhum cartão registrado ainda.');
    return;
  }

  const positions = rankingPositions(list, 'totalCards');
  const mode = appState.cardFilter;
  const label = mode === 'amarelo' ? 'Amarelos' : mode === 'vermelho' ? 'Vermelhos' : 'Total';

  el.innerHTML = `
    <div class="header-row">
      <div>#</div>
      <div>Jogador</div>
      <div>${label}</div>
    </div>
    <div class="full-list">
      ${list
        .map(
          (item, index) => `
            <article class="full-row premium-row">
              <div class="stat-rank">${positions[index]}</div>
              <div class="player-block">
                <img class="player-photo" src="${escapeHtml(getPlayerPhoto(item))}" alt="${escapeHtml(item.name)}">
                <div class="player-meta">
                  <div class="player-name">${escapeHtml(item.name)}</div>
                  <div class="team-line">
                    ${renderTeamIdentity(item.team)}
                    <span>${escapeHtml(item.team?.name || 'Sem time')}</span>
                  </div>
                </div>
              </div>
              <div class="cards-value-group">
                ${mode !== 'vermelho' ? `<div class="cards-chip"><span class="card-icon yellow"></span>${item.yellows}</div>` : ''}
                ${mode !== 'amarelo' ? `<div class="cards-chip"><span class="card-icon red"></span>${item.reds}</div>` : ''}
                <div class="cards-total">${mode === 'amarelo' ? item.yellows : mode === 'vermelho' ? item.reds : item.totalCards}</div>
              </div>
            </article>`
        )
        .join('')}
    </div>`;
}

function renderStandings() {
  const el = document.getElementById('classificacao-content');
  if (!el) return;

  const table = getStandings();
  if (!table.length) {
    el.innerHTML = renderEmptyState('Nenhuma classificação disponível.');
    return;
  }

  if (appState.tableView === 'forma') {
    el.innerHTML = `
      <div class="table-wrap premium-table-wrap">
        <table class="standings-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Time</th>
              <th>Pts</th>
              <th>Últimos jogos</th>
            </tr>
          </thead>
          <tbody>
            ${table
              .map(
                (team, index) => `
                  <tr>
                    <td><div class="rank-box">${index + 1}</div></td>
                    <td>
                      <div class="team-cell">
                        ${renderTeamIdentity(team, 'lg')}
                        <strong>${escapeHtml(team.name)}</strong>
                      </div>
                    </td>
                    <td>${team.points}</td>
                    <td>
                      <div class="form-pills">
                        ${team.form.length ? team.form.map((result) => `<span class="form-pill ${result}">${result}</span>`).join('') : '<span class="muted">—</span>'}
                      </div>
                    </td>
                  </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="table-wrap premium-table-wrap">
      <table class="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Time</th>
            <th>Pts</th>
            <th>J</th>
            <th>V</th>
            <th>E</th>
            <th>D</th>
            <th>GP</th>
            <th>GC</th>
            <th>SG</th>
            <th>CA</th>
            <th>CV</th>
            <th>Cartões</th>
          </tr>
        </thead>
        <tbody>
          ${table
            .map(
              (team, index) => `
                <tr>
                  <td><div class="rank-box">${index + 1}</div></td>
                  <td>
                    <div class="team-cell">
                      ${renderTeamIdentity(team, 'lg')}
                      <strong>${escapeHtml(team.name)}</strong>
                    </div>
                  </td>
                  <td><strong>${team.points}</strong></td>
                  <td>${team.played}</td>
                  <td>${team.wins}</td>
                  <td>${team.draws}</td>
                  <td>${team.losses}</td>
                  <td>${team.goalsFor}</td>
                  <td>${team.goalsAgainst}</td>
                  <td>${team.goalDiff}</td>
                  <td>${team.yellows}</td>
                  <td>${team.reds}</td>
                  <td>${team.cards}</td>
                </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

function renderDashboardStandings() {
  const el = document.getElementById('dashboard-classificacao');
  if (!el) return;

  const table = getStandings().slice(0, 6);
  if (!table.length) {
    el.innerHTML = renderEmptyState('Nenhum time cadastrado ainda.');
    return;
  }

  el.innerHTML = `
    <div class="table-wrap premium-table-wrap compact">
      <table class="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Time</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${table
            .map(
              (team, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    <div class="team-cell">
                      ${renderTeamIdentity(team, 'lg')}
                      <strong>${escapeHtml(team.name)}</strong>
                    </div>
                  </td>
                  <td><strong>${team.points}</strong></td>
                </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

function matchCard(match, showScore = true) {
  const home = byId(appState.data.teams, match.homeTeamId);
  const away = byId(appState.data.teams, match.awayTeamId);
  const score = showScore ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : 'vs';
  const status = match.status === 'finished' ? 'FT' : formatDate(match.date);

  return `
    <article class="match-card premium-row">
      <div class="match-row">
        <div class="match-side home">
          <span>${escapeHtml(home?.name || 'Time')}</span>
          ${renderTeamIdentity(home, 'lg')}
        </div>
        <div class="score-box">
          <div class="score-main">${score}</div>
          <div class="score-status">${status}</div>
        </div>
        <div class="match-side away">
          ${renderTeamIdentity(away, 'lg')}
          <span>${escapeHtml(away?.name || 'Time')}</span>
        </div>
      </div>
    </article>`;
}

function renderRoundsBlock(targetId, rounds, mode = 'past') {
  const el = document.getElementById(targetId);
  if (!el) return;

  if (!rounds.length) {
    el.innerHTML = renderEmptyState('Nada por aqui ainda.');
    return;
  }

  el.innerHTML = `
    <div class="rounds-accordion-list">
      ${rounds
        .map((round, index) => {
          const roundMatches = matchesByRound(round.id).filter((match) =>
            mode === 'past' ? match.status === 'finished' : true
          );
          const summaryLabel = mode === 'past'
            ? `${roundMatches.filter((item) => item.status === 'finished').length} resultado(s)`
            : `${roundMatches.length} confronto(s)`;

          return `
            <details class="round-accordion" ${index === 0 ? 'open' : ''}>
              <summary>
                <div>
                  <strong>${escapeHtml(round.title)}</strong>
                  <span>${formatDateLong(round.date)}</span>
                </div>
                <span class="round-pill">${summaryLabel}</span>
              </summary>
              <div class="round-accordion-body">
                ${roundMatches.length ? roundMatches.map((match) => matchCard(match, match.status === 'finished')).join('') : renderEmptyState('Sem jogos nesta rodada.')}
              </div>
            </details>`;
        })
        .join('')}
    </div>`;
}

function renderDashboardRounds() {
  const pastRounds = [...appState.data.rounds]
    .filter((round) => round.status === 'finished')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 1);

  const nextRound = getNextRound();
  renderRoundsBlock('dashboard-rodadas-anteriores', pastRounds, 'past');
  renderRoundsBlock('dashboard-proxima-rodada', nextRound ? [nextRound] : [], 'next');
}

function populatePublicPages() {
  const stats = getPlayerStats();
  const topScorers = [...stats].sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, 'pt-BR'));
  const topAssists = [...stats].sort((a, b) => b.assists - a.assists || a.name.localeCompare(b.name, 'pt-BR'));
  const topCards = [...stats].sort(
    (a, b) =>
      b.totalCards - a.totalCards ||
      b.yellows - a.yellows ||
      a.name.localeCompare(b.name, 'pt-BR')
  );

  renderDashboardStandings();
  renderDashboardGoalsAssists();
  renderDashboardList('dashboard-artilheiros', topScorers, 'goals');
  renderDashboardList('dashboard-assistencias', topAssists, 'assists');
  renderDashboardList('dashboard-cartoes', topCards, 'totalCards', 5, true);
  renderDashboardRounds();
  renderDashboardChampionshipCard();

  renderStandings();
  renderFullRanking('artilheiros-content', topScorers, 'goals', 'Gols');
  renderFullRanking('assistencias-content', topAssists, 'assists', 'Assistências');
  renderCardsPage();
  renderTimeDoCampeonatoPage();

  const finishedRounds = [...appState.data.rounds]
    .filter((round) => round.status === 'finished')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const nextRound = getNextRound();
  renderRoundsBlock('rodadas-passadas', finishedRounds, 'past');
  renderRoundsBlock('rodadas-futuras', nextRound ? [nextRound] : [], 'next');
}

function isLocalAdmin() {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

function setLocalAdmin(value) {
  localStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
}

async function loginAdmin(email, password) {
  if (!appState.usingFirebase) {
    throw new Error('Firebase não está disponível.');
  }

  await appState.firebase.auth.signInWithEmailAndPassword(email, password);
  appState.authUser = appState.firebase.auth.currentUser;
  setLocalAdmin(true);
}

async function logoutAdmin() {
  if (appState.usingFirebase) {
    await appState.firebase.auth.signOut();
  }
  appState.authUser = null;
  setLocalAdmin(false);
}

function isAdminLogged() {
  return appState.usingFirebase ? Boolean(appState.firebase?.auth.currentUser) : isLocalAdmin();
}

function positionLabel(position) {
  return ({ zagueiro: 'Zagueiro', ala: 'Ala', meia: 'Meia', meio: 'Meio', atacante: 'Atacante', goleiro: 'Goleiro' }[position] || position || '—');
}

function teamOptions(selected = '') {
  return [...appState.data.teams]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((team) => `<option value="${team.id}" ${team.id === selected ? 'selected' : ''}>${escapeHtml(team.name)}</option>`)
    .join('');
}

function roundOptions(selected = '') {
  return [...appState.data.rounds]
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .map((round) => `<option value="${round.id}" ${round.id === selected ? 'selected' : ''}>${escapeHtml(round.title)}</option>`)
    .join('');
}

function matchOptions(selected = '') {
  return [...appState.data.matches]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .map((match) => {
      const home = byId(appState.data.teams, match.homeTeamId);
      const away = byId(appState.data.teams, match.awayTeamId);
      return `<option value="${match.id}" ${match.id === selected ? 'selected' : ''}>${escapeHtml(home?.name || '')} x ${escapeHtml(away?.name || '')} • ${formatDateLong(match.date)}</option>`;
    })
    .join('');
}

function playerOptions(selected = '') {
  return [...appState.data.players]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((player) => `<option value="${player.id}" ${player.id === selected ? 'selected' : ''}>${escapeHtml(player.name)}</option>`)
    .join('');
}

function fillAdminSelects() {
  ['player-team', 'match-home', 'match-away', 'event-team', 'match-editor-home', 'match-editor-away'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<option value="">Selecione</option>${teamOptions(el.value)}`;
    }
  });

  ['match-round', 'match-editor-round'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<option value="">Selecione</option>${roundOptions(el.value)}`;
    }
  });

  ['result-match', 'event-match', 'match-editor-picker'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const prefix = id === 'match-editor-picker'
        ? '<option value="">Nova partida</option>'
        : '<option value="">Selecione</option>';
      el.innerHTML = `${prefix}${matchOptions(el.value)}`;
    }
  });

  const eventPlayer = document.getElementById('event-player');
  if (eventPlayer) {
    eventPlayer.innerHTML = `<option value="">Selecione</option>${playerOptions(eventPlayer.value)}`;
  }
}

function renderAdminOverview() {
  const el = document.getElementById('admin-overview');
  if (!el) return;

  const standings = getStandings();
  const nextRound = getNextRound();
  const cards = [
    { value: appState.data.teams.length, label: 'times cadastrados' },
    { value: appState.data.players.length, label: 'jogadores' },
    { value: appState.data.rounds.length, label: 'rodadas' },
    { value: getFinishedMatches().length, label: 'partidas finalizadas' },
    { value: appState.data.events.length, label: 'eventos' },
    { value: nextRound ? nextRound.title : 'Nenhuma', label: 'próxima rodada' }
  ];

  el.innerHTML = `
    <div class="overview-grid">
      ${cards
        .map(
          (card) => `
            <article class="overview-card">
              <strong>${escapeHtml(String(card.value))}</strong>
              <span>${escapeHtml(card.label)}</span>
            </article>`
        )
        .join('')}
    </div>
    <div class="table-wrap premium-table-wrap" style="margin-top: 18px;">
      <table class="list-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Time</th>
            <th>Pontos</th>
          </tr>
        </thead>
        <tbody>
          ${
            standings.length
              ? standings
                  .map(
                    (team, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>
                          <span class="item-chip">
                            ${renderTeamIdentity(team)}
                            ${escapeHtml(team.name)}
                          </span>
                        </td>
                        <td>${team.points}</td>
                      </tr>`
                  )
                  .join('')
              : `<tr><td colspan="3">Nenhum dado disponível.</td></tr>`
          }
        </tbody>
      </table>
    </div>`;
}

function renderTeamsAdmin() {
  const el = document.getElementById('teams-list');
  if (!el) return;

  if (!appState.data.teams.length) {
    el.innerHTML = renderEmptyState('Nenhum time cadastrado.');
    return;
  }

  el.innerHTML = `
    <div class="table-wrap premium-table-wrap">
      <table class="list-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Jogadores</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${appState.data.teams
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
            .map(
              (team) => `
                <tr>
                  <td>
                    <span class="item-chip">
                      ${renderTeamIdentity(team)}
                      ${escapeHtml(team.name)}
                    </span>
                  </td>
                  <td>${appState.data.players.filter((player) => player.teamId === team.id).length}</td>
                  <td>
                    <div class="inline-actions">
                      <button class="btn btn-soft btn-sm" data-edit-team="${team.id}">Editar</button>
                      <button class="btn btn-danger btn-sm" data-delete-team="${team.id}">Excluir</button>
                    </div>
                  </td>
                </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

function renderPlayersAdmin() {
  const el = document.getElementById('players-list');
  if (!el) return;

  if (!appState.data.players.length) {
    el.innerHTML = renderEmptyState('Nenhum jogador cadastrado.');
    return;
  }

  el.innerHTML = `
    <div class="table-wrap premium-table-wrap">
      <table class="list-table">
        <thead>
          <tr>
            <th>Jogador</th>
            <th>Time</th>
            <th>Posição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${appState.data.players
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
            .map((player) => {
              const team = byId(appState.data.teams, player.teamId);
              return `
                <tr>
                  <td>
                    <span class="item-chip">
                      <img src="${escapeHtml(getPlayerPhoto(player))}" alt="${escapeHtml(player.name)}">
                      ${escapeHtml(player.name)}
                    </span>
                  </td>
                  <td>
                    <span class="item-chip">
                      ${renderTeamIdentity(team)}
                      ${escapeHtml(team?.name || 'Sem time')}
                    </span>
                  </td>
                  <td>${escapeHtml(positionLabel(player.mainPosition || ''))}</td>
                  <td>
                    <div class="inline-actions">
                      <button class="btn btn-soft btn-sm" data-edit-player="${player.id}">Editar</button>
                      <button class="btn btn-danger btn-sm" data-delete-player="${player.id}">Excluir</button>
                    </div>
                  </td>
                </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>`;
}

function renderRoundsAdmin() {
  const el = document.getElementById('rounds-list');
  if (!el) return;

  if (!appState.data.rounds.length) {
    el.innerHTML = renderEmptyState('Nenhuma rodada cadastrada.');
    return;
  }

  const sortedRounds = [...appState.data.rounds].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  el.innerHTML = sortedRounds
    .map(
      (round) => `
        <article class="panel admin-round-panel">
          <div class="panel-head">
            <div>
              <h2>${escapeHtml(round.title)}</h2>
              <div class="muted">${formatDateLong(round.date)} • ${escapeHtml(round.monthLabel || '')} • ${round.status === 'upcoming' ? 'próxima rodada' : 'finalizada'}</div>
            </div>
            <div class="inline-actions">
              <button class="btn btn-soft btn-sm" data-edit-round="${round.id}">Editar rodada</button>
              <button class="btn btn-danger btn-sm" data-delete-round="${round.id}">Excluir rodada</button>
            </div>
          </div>
          <div class="table-wrap premium-table-wrap compact">
            <table class="list-table">
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${
                  matchesByRound(round.id)
                    .map((match) => {
                      const home = byId(appState.data.teams, match.homeTeamId);
                      const away = byId(appState.data.teams, match.awayTeamId);
                      return `
                        <tr>
                          <td>${escapeHtml(home?.name || '')} x ${escapeHtml(away?.name || '')}</td>
                          <td>${match.status === 'finished' ? `${match.homeScore} x ${match.awayScore}` : 'Agendado'}</td>
                          <td>
                            <div class="inline-actions">
                              <button class="btn btn-soft btn-sm" data-edit-match="${match.id}">Editar jogo</button>
                              <button class="btn btn-danger btn-sm" data-delete-match="${match.id}">Excluir jogo</button>
                            </div>
                          </td>
                        </tr>`;
                    })
                    .join('') || '<tr><td colspan="3">Sem jogos</td></tr>'
                }
              </tbody>
            </table>
          </div>
        </article>`
    )
    .join('');
}

function renderEventsAdmin() {
  const el = document.getElementById('events-list');
  if (!el) return;

  if (!appState.data.events.length) {
    el.innerHTML = renderEmptyState('Nenhum evento cadastrado.');
    return;
  }

  const labelMap = {
    goal: 'Gol',
    assist: 'Assistência',
    own_goal: 'Gol contra',
    yellow_card: 'Amarelo',
    red_card: 'Vermelho'
  };

  el.innerHTML = `
    <div class="table-wrap premium-table-wrap">
      <table class="list-table">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Partida</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          ${appState.data.events
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .map((event) => {
              const player = byId(appState.data.players, event.playerId);
              const team = byId(appState.data.teams, event.teamId);
              const responsibleTeam = event.type === 'own_goal' ? byId(appState.data.teams, player?.teamId) : team;
              const match = byId(appState.data.matches, event.matchId);
              const home = match ? byId(appState.data.teams, match.homeTeamId) : null;
              const away = match ? byId(appState.data.teams, match.awayTeamId) : null;

              return `
                <tr>
                  <td>${labelMap[event.type] || 'Evento'}${Number(event.quantity || 1) > 1 ? ` x${Number(event.quantity || 1)}` : ''} • ${escapeHtml(player?.name || 'Jogador')} (${escapeHtml(responsibleTeam?.name || 'Time')})${event.type === 'own_goal' ? ` → crédito para ${escapeHtml(team?.name || 'adversário')}` : ''}</td>
                  <td>${escapeHtml(home?.name || '')} x ${escapeHtml(away?.name || '')}</td>
                  <td><button class="btn btn-danger btn-sm" data-delete-event="${event.id}">Excluir</button></td>
                </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>`;
}

function renderSettingsPreview() {
  const el = document.getElementById('settings-preview');
  if (!el) return;

  el.innerHTML = `
    <div class="section-grid settings-grid">
      <div class="admin-note">
        <div class="muted">Imagem padrão do jogador</div>
        <div class="settings-lockup">
          <img src="${escapeHtml(DEFAULT_PLAYER_IMAGE)}" alt="Padrão jogador" class="settings-preview-img settings-preview-player">
          <div>
            <strong>Definida no código</strong>
            <div class="muted">Usada automaticamente quando o jogador não possui foto cadastrada.</div>
          </div>
        </div>
      </div>
      <div class="admin-note">
        <div class="muted">Clubes sem foto genérica</div>
        <div class="settings-lockup">
          <div class="team-badge team-badge-lg team-badge-fallback">CL</div>
          <div>
            <strong>Escudo genérico ativo</strong>
            <div class="muted">Quando um clube não tiver escudo, o sistema exibe automaticamente a imagem padrão do arquivo img/team_generico.svg (ou outro arquivo definido em config.js).</div>
          </div>
        </div>
      </div>
    </div>`;
}


function renderTeamChampionshipAdmin() {
  const form = document.getElementById('team-championship-form');
  if (!form) return;

  const config = getTeamOfChampionshipConfig();
  const formationField = document.getElementById('team-championship-formation');
  const selectedFormation = formationField?.value || config.formation;
  const formationLabel = document.getElementById('team-championship-formation-label');
  const summary = document.getElementById('team-championship-summary');
  const preview = document.getElementById('team-championship-admin-preview');
  const payload = getTimeDoCampeonato(selectedFormation);

  if (formationField && !formationField.value) formationField.value = config.formation;
  if (formationLabel) formationLabel.textContent = selectedFormation;

  if (summary) {
    const counts = Object.entries(payload.positions)
      .filter(([, amount]) => Number(amount || 0) > 0)
      .map(([position, amount]) => `${positionLabel(position)}: ${amount}`)
      .join(' • ');

    summary.innerHTML = `<strong>Formação ativa</strong><div class="muted">${escapeHtml(payload.formation)} • ${escapeHtml(counts)}.</div>`;
  }

  if (preview) {
    preview.innerHTML = '';
    renderTimeDoCampeonatoPitch('team-championship-admin-preview', selectedFormation);
  }
}

async function handleTeamChampionshipSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    const formation = document.getElementById('team-championship-formation')?.value || TEAM_OF_CHAMPIONSHIP_CONFIG.formation;
    await saveTeamOfChampionshipConfig(formation);
    showAdminMessage('Formação do Time do Campeonato salva com sucesso.');
    rerenderAll();
  });
}

function refreshAdmin() {
  fillAdminSelects();
  renderAdminOverview();
  renderTeamsAdmin();
  renderPlayersAdmin();
  renderRoundsAdmin();
  renderMatchCenterPanel();
  renderSettingsPreview();
  renderTeamChampionshipAdmin();
}

function showAdminView(view) {
  appState.adminView = view;

  document.querySelectorAll('.admin-menu button[data-admin-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminView === view);
  });

  document.querySelectorAll('.admin-section').forEach((section) => {
    section.classList.toggle('hidden', section.dataset.adminSection !== view);
  });
}

async function syncFirestoreSnapshot() {
  if (!appState.usingFirebase) return;
  await loadFirebaseData();
}

async function openAdmin() {
  await ensureDataLoaded();
  await syncFirestoreSnapshot();
  document.getElementById('admin-login')?.classList.add('hidden');
  document.getElementById('admin-app')?.classList.remove('hidden');
  refreshAdmin();
}

function closeAdmin() {
  document.getElementById('admin-login')?.classList.remove('hidden');
  document.getElementById('admin-app')?.classList.add('hidden');
}

async function setDoc(collectionName, id, data, merge = true) {
  if (appState.usingFirebase) {
    await collectionRef(collectionName).doc(id).set(sanitizeForFirestore(data), { merge });
  }
}

async function deleteDoc(collectionName, id) {
  if (appState.usingFirebase) {
    await collectionRef(collectionName).doc(id).delete();
  }
}

async function saveSettings() {
  const payload = {
    ...getSettings(),
    defaultPlayerImage: DEFAULT_PLAYER_IMAGE,
    updatedAt: new Date().toISOString()
  };
  appState.data.settings = payload;
  await setDoc(COLLECTIONS.settings, 'main', payload, true);
  persistLocalSnapshot();
}

async function handleTeamSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    const id = document.getElementById('team-id').value || uid('team');
    const name = document.getElementById('team-name').value.trim();
    const file = document.getElementById('team-logo').files[0];

    if (!name) {
      showAdminMessage('Digite o nome do time.', 'error');
      return;
    }

    const current = byId(appState.data.teams, id);
    const logo = file ? await uploadImage(file, 'team-logos') : current?.logo || '';
    const payload = {
      id,
      name,
      logo,
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (current) {
      Object.assign(current, payload);
    } else {
      appState.data.teams.push(payload);
    }

    await setDoc(COLLECTIONS.teams, id, payload, false);
    persistLocalSnapshot();
    event.target.reset();
    document.getElementById('team-id').value = '';
    showAdminMessage('Time salvo com sucesso.');
    rerenderAll();
  });
}

function resetPlayerPhotoRemovalFlag() {
  const input = document.getElementById('player-remove-photo');
  if (input) input.value = 'false';
}

function shouldRemovePlayerPhoto() {
  return document.getElementById('player-remove-photo')?.value === 'true';
}

function markPlayerPhotoForRemoval() {
  const input = document.getElementById('player-remove-photo');
  const playerId = document.getElementById('player-id')?.value || '';
  if (!input) return;

  if (!playerId) {
    showAdminMessage('Selecione um jogador já cadastrado para remover a foto atual.', 'error');
    return;
  }

  input.value = 'true';
  const photoInput = document.getElementById('player-photo');
  if (photoInput) photoInput.value = '';
  showAdminMessage('Foto marcada para remoção. Clique em "Salvar jogador" para confirmar.', 'success');
}

async function handlePlayerSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    const id = document.getElementById('player-id').value || uid('player');
    const name = document.getElementById('player-name').value.trim();
    const teamId = document.getElementById('player-team').value;
    const file = document.getElementById('player-photo').files[0];

    if (!name || !teamId) {
      showAdminMessage('Preencha nome e time do jogador.', 'error');
      return;
    }

    const current = byId(appState.data.players, id);
    const removeCurrentPhoto = shouldRemovePlayerPhoto();
    const photo = removeCurrentPhoto
      ? ''
      : (file ? await uploadImage(file, 'player-photos') : current?.photo || '');
    const payload = {
      id,
      name,
      teamId,
      mainPosition: document.getElementById('player-position').value || (current?.mainPosition || 'ala'),
      photo,
      seedStats: current?.seedStats || {
        goals: 0,
        assists: 0,
        ownGoals: 0,
        yellows: 0,
        reds: 0
      },
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (current) {
      Object.assign(current, payload);
    } else {
      appState.data.players.push(payload);
    }

    await setDoc(COLLECTIONS.players, id, payload, false);
    persistLocalSnapshot();
    event.target.reset();
    document.getElementById('player-id').value = '';
    resetPlayerPhotoRemovalFlag();
    showAdminMessage(removeCurrentPhoto ? 'Jogador salvo e foto removida com sucesso.' : 'Jogador salvo com sucesso.');
    rerenderAll();
  });
}

async function handleRoundSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    const id = document.getElementById('round-id').value || uid('round');
    const title = document.getElementById('round-title').value.trim();
    const date = document.getElementById('round-date').value;
    const status = document.getElementById('round-status').value;

    if (!title || !date) {
      showAdminMessage('Preencha título e data da rodada.', 'error');
      return;
    }

    const current = byId(appState.data.rounds, id);
    const payload = {
      id,
      title,
      number: current?.number || Number(String(title).replace(/\D+/g, '')) || (appState.data.rounds.length + 1),
      date,
      monthLabel: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(`${date}T12:00:00`)).replace(/^./, (m) => m.toUpperCase()),
      status,
      votingEnabled: current?.votingEnabled || false,
      votingStartsAt: current?.votingStartsAt || '',
      votingEndsAt: current?.votingEndsAt || '',
      formation: current?.formation || '2-3-1',
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (current) {
      Object.assign(current, payload);
    } else {
      appState.data.rounds.push(payload);
    }

    await setDoc(COLLECTIONS.rounds, id, payload, false);
    persistLocalSnapshot();
    event.target.reset();
    document.getElementById('round-id').value = '';
    showAdminMessage('Rodada salva com sucesso.');
    rerenderAll();
  });
}

async function handleMatchSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    const id = document.getElementById('match-id').value || uid('match');
    const roundId = document.getElementById('match-round').value;
    const date = document.getElementById('match-date').value;
    const homeTeamId = document.getElementById('match-home').value;
    const awayTeamId = document.getElementById('match-away').value;
    const status = document.getElementById('match-status').value;

    if (!roundId || !date || !homeTeamId || !awayTeamId) {
      showAdminMessage('Preencha todos os campos do jogo.', 'error');
      return;
    }

    if (homeTeamId === awayTeamId) {
      showAdminMessage('Escolha times diferentes para a partida.', 'error');
      return;
    }

    const current = byId(appState.data.matches, id);
    const payload = {
      id,
      roundId,
      date,
      homeTeamId,
      awayTeamId,
      status,
      homeScore: current?.homeScore ?? (status === 'finished' ? 0 : null),
      awayScore: current?.awayScore ?? (status === 'finished' ? 0 : null),
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (current) {
      Object.assign(current, payload);
    } else {
      appState.data.matches.push(payload);
    }

    await setDoc(COLLECTIONS.matches, id, payload, false);
    persistLocalSnapshot();
    event.target.reset();
    document.getElementById('match-id').value = '';
    showAdminMessage('Jogo salvo com sucesso.');
    rerenderAll();
  });
}

async function updateRoundStatus(roundId) {
  const round = byId(appState.data.rounds, roundId);
  if (!round) return;
  const roundMatches = matchesByRound(roundId);
  const allFinished = roundMatches.length > 0 && roundMatches.every((item) => item.status === 'finished');
  const nextStatus = allFinished ? 'finished' : 'upcoming';

  if (round.status !== nextStatus) {
    round.status = nextStatus;
    round.updatedAt = new Date().toISOString();
    await setDoc(COLLECTIONS.rounds, round.id, round, false);
  }
}

async function handleResultSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    const matchId = document.getElementById('result-match').value;
    const home = Number(document.getElementById('result-home').value);
    const away = Number(document.getElementById('result-away').value);
    const match = byId(appState.data.matches, matchId);

    if (!matchId || Number.isNaN(home) || Number.isNaN(away) || !match) {
      showAdminMessage('Selecione a partida e informe o placar.', 'error');
      return;
    }

    match.homeScore = home;
    match.awayScore = away;
    match.status = 'finished';
    match.updatedAt = new Date().toISOString();

    await setDoc(COLLECTIONS.matches, match.id, match, false);
    await updateRoundStatus(match.roundId);
    persistLocalSnapshot();
    event.target.reset();
    showAdminMessage('Resultado salvo. A tabela foi atualizada.');
    rerenderAll();
  });
}

async function handleEventSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    const matchId = document.getElementById('event-match').value;
    const playerId = document.getElementById('event-player').value;
    const teamId = document.getElementById('event-team').value;
    const type = document.getElementById('event-type').value;

    if (!matchId || !playerId || !teamId) {
      showAdminMessage('Preencha partida, jogador e time do evento.', 'error');
      return;
    }

    const payload = {
      id: uid('event'),
      matchId,
      playerId,
      teamId,
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    appState.data.events.push(payload);
    await setDoc(COLLECTIONS.events, payload.id, payload, false);
    persistLocalSnapshot();
    showAdminMessage('Evento adicionado com sucesso.');
    event.target.reset();
    rerenderAll();
  });
}

async function handleSettingsSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    await saveSettings();
    showAdminMessage('Configuração validada. A imagem padrão continua fixa no código.', 'success');
    event.target.reset();
    rerenderAll();
  });
}

function fillTeamForm(id) {
  const team = byId(appState.data.teams, id);
  if (!team) return;
  document.getElementById('team-id').value = team.id;
  document.getElementById('team-name').value = team.name;
  showAdminView('times');
}

function fillPlayerForm(id) {
  const player = byId(appState.data.players, id);
  if (!player) return;
  document.getElementById('player-id').value = player.id;
  document.getElementById('player-name').value = player.name;
  document.getElementById('player-team').value = player.teamId;
  const positionField = document.getElementById('player-position');
  if (positionField) positionField.value = player.mainPosition || 'ala';
  const photoInput = document.getElementById('player-photo');
  if (photoInput) photoInput.value = '';
  resetPlayerPhotoRemovalFlag();
  showAdminView('players');
}

function fillRoundForm(id) {
  const round = byId(appState.data.rounds, id);
  if (!round) return;
  document.getElementById('round-id').value = round.id;
  document.getElementById('round-title').value = round.title;
  document.getElementById('round-date').value = round.date;
  document.getElementById('round-status').value = round.status;
  showAdminView('match-center');
}

function fillMatchForm(id) {
  loadMatchIntoEditor(id);
  showAdminView('match-center');
}

async function deleteTeam(id) {
  const linkedPlayers = appState.data.players.some((player) => player.teamId === id);
  const linkedMatches = appState.data.matches.some((match) => match.homeTeamId === id || match.awayTeamId === id);

  if (linkedPlayers || linkedMatches) {
    showAdminMessage('Não é possível excluir o time enquanto houver jogadores ou partidas ligadas a ele.', 'error');
    return;
  }

  if (!window.confirm('Excluir este time?')) return;
  appState.data.teams = appState.data.teams.filter((team) => team.id !== id);
  await deleteDoc(COLLECTIONS.teams, id);
  persistLocalSnapshot();
  showAdminMessage('Time excluído.');
  rerenderAll();
}

async function deletePlayer(id) {
  if (!window.confirm('Excluir este jogador? Os eventos dele também serão removidos.')) return;

  const eventsToDelete = appState.data.events.filter((event) => event.playerId === id);
  await Promise.all(eventsToDelete.map((event) => deleteDoc(COLLECTIONS.events, event.id)));
  appState.data.players = appState.data.players.filter((player) => player.id !== id);
  appState.data.events = appState.data.events.filter((event) => event.playerId !== id);
  await deleteDoc(COLLECTIONS.players, id);
  persistLocalSnapshot();
  showAdminMessage('Jogador excluído com sucesso.');
  rerenderAll();
}

async function deleteRound(id) {
  const linkedMatches = appState.data.matches.filter((match) => match.roundId === id);
  if (linkedMatches.length) {
    showAdminMessage('Exclua os jogos dessa rodada antes de excluir a rodada.', 'error');
    return;
  }

  if (!window.confirm('Excluir esta rodada?')) return;
  appState.data.rounds = appState.data.rounds.filter((round) => round.id !== id);
  await deleteDoc(COLLECTIONS.rounds, id);
  persistLocalSnapshot();
  showAdminMessage('Rodada excluída.');
  rerenderAll();
}

async function deleteMatch(id) {
  if (!window.confirm('Excluir esta partida? Os eventos ligados a ela também serão removidos.')) return;

  const match = byId(appState.data.matches, id);
  const eventsToDelete = appState.data.events.filter((event) => event.matchId === id);
  await Promise.all(eventsToDelete.map((event) => deleteDoc(COLLECTIONS.events, event.id)));
  appState.data.matches = appState.data.matches.filter((item) => item.id !== id);
  appState.data.events = appState.data.events.filter((event) => event.matchId !== id);
  await deleteDoc(COLLECTIONS.matches, id);
  if (match?.roundId) {
    await updateRoundStatus(match.roundId);
  }
  persistLocalSnapshot();
  showAdminMessage('Partida excluída.');
  rerenderAll();
}

async function deleteEvent(id) {
  if (!window.confirm('Excluir este evento?')) return;

  appState.data.events = appState.data.events.filter((event) => event.id !== id);
  await deleteDoc(COLLECTIONS.events, id);
  persistLocalSnapshot();
  showAdminMessage('Evento excluído.');
  rerenderAll();
}

function getMatchTeamsFromEditor() {
  return {
    homeTeamId: document.getElementById('match-editor-home')?.value || '',
    awayTeamId: document.getElementById('match-editor-away')?.value || ''
  };
}

function getEligiblePlayersForTeams(homeTeamId, awayTeamId) {
  const allowed = new Set([homeTeamId, awayTeamId].filter(Boolean));
  return appState.data.players
    .filter((player) => allowed.has(player.teamId))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function getPlayersFromTeam(teamId) {
  return appState.data.players
    .filter((player) => player.teamId === teamId)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function getOpponentTeamId(teamId) {
  const { homeTeamId, awayTeamId } = getMatchTeamsFromEditor();
  if (teamId === homeTeamId) return awayTeamId;
  if (teamId === awayTeamId) return homeTeamId;
  return '';
}

function eventTypeLabel(type) {
  return ({
    goal: 'Gol',
    own_goal: 'Gol contra',
    assist: 'Assistência',
    yellow_card: 'Amarelo',
    red_card: 'Vermelho'
  }[type] || 'Evento');
}

function getEventBuilderContainer(type = 'yellow_card') {
  if (type === 'yellow_card' || type === 'red_card') {
    return document.getElementById('match-events-builder-cards');
  }
  return null;
}

function createEventRowMarkup(type = 'yellow_card') {
  const normalizedType = type === 'red_card' ? 'red_card' : 'yellow_card';

  return `
    <div class="event-row card-event-row event-row-${normalizedType.replace(/_/g, '-')}">
      <div class="field">
        <label>Cartão</label>
        <select class="event-row-type">
          <option value="yellow_card" ${normalizedType === 'yellow_card' ? 'selected' : ''}>Amarelo</option>
          <option value="red_card" ${normalizedType === 'red_card' ? 'selected' : ''}>Vermelho</option>
        </select>
      </div>
      <div class="field">
        <label>Time</label>
        <select class="event-row-team"></select>
      </div>
      <div class="field">
        <label>Jogador</label>
        <select class="event-row-player"></select>
      </div>
      <input class="event-row-quantity" type="hidden" value="1">
      <button class="btn btn-danger btn-sm" type="button" data-remove-event-row="1">Remover cartão</button>
    </div>`;
}

function getEventRowMaxQuantity(row) {
  const type = row.querySelector('.event-row-type')?.value || 'yellow_card';
  return type === 'yellow_card' || type === 'red_card' ? 1 : 0;
}

function syncEventRowQuantityState(row) {
  const quantityInput = row.querySelector('.event-row-quantity');
  if (!quantityInput) return;
  quantityInput.value = 1;
  quantityInput.max = 1;
  quantityInput.readOnly = true;
}

function populateEventRow(row, data = {}) {
  const { homeTeamId, awayTeamId } = getMatchTeamsFromEditor();
  const teams = [byId(appState.data.teams, homeTeamId), byId(appState.data.teams, awayTeamId)].filter(Boolean);
  const teamSelect = row.querySelector('.event-row-team');
  const playerSelect = row.querySelector('.event-row-player');
  const typeField = row.querySelector('.event-row-type');
  const selectedTeamId = data.teamId || teamSelect?.value || '';
  const validTeamId = teams.some((team) => team.id === selectedTeamId) ? selectedTeamId : '';

  if (!teamSelect || !playerSelect || !typeField) return;
  if (data.type === 'red_card' || data.type === 'yellow_card') typeField.value = data.type;

  teamSelect.innerHTML = `<option value="">Selecione</option>${teams.map((team) => `<option value="${team.id}" ${team.id === validTeamId ? 'selected' : ''}>${escapeHtml(team.name)}</option>`).join('')}`;

  const allowedPlayers = getPlayersFromTeam(validTeamId);
  const selectedPlayerId = allowedPlayers.some((player) => player.id === data.playerId)
    ? data.playerId
    : (allowedPlayers.some((player) => player.id === playerSelect.value) ? playerSelect.value : '');
  playerSelect.innerHTML = `<option value="">Selecione</option>${allowedPlayers.map((player) => `<option value="${player.id}" ${player.id === selectedPlayerId ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}`;

  syncEventRowQuantityState(row);
}

function addMatchEventRow(data = {}) {
  const initialType = data.type === 'red_card' ? 'red_card' : 'yellow_card';
  const container = getEventBuilderContainer(initialType);
  if (!container) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = createEventRowMarkup(initialType).trim();
  const row = wrap.firstElementChild;
  container.appendChild(row);
  populateEventRow(row, data);
  updateCardsAccordionSummary();
  const accordion = document.getElementById('match-cards-accordion');
  if (accordion) accordion.open = true;
}

function updateCardsAccordionSummary() {
  const rows = document.querySelectorAll('#match-events-builder-cards .event-row').length;
  const summary = document.getElementById('match-cards-summary');
  if (summary) summary.textContent = `${rows} ${rows === 1 ? 'cartão cadastrado' : 'cartões cadastrados'}`;
}

function refreshMatchEventRows() {
  document.querySelectorAll('#match-events-builder-cards .event-row').forEach((row) => {
    populateEventRow(row, {
      type: row.querySelector('.event-row-type')?.value || 'yellow_card',
      teamId: row.querySelector('.event-row-team')?.value || '',
      playerId: row.querySelector('.event-row-player')?.value || ''
    });
  });
  updateCardsAccordionSummary();
}

let matchEditorGoalDraft = new Map();

function captureGoalCardsState() {
  const state = new Map();
  document.querySelectorAll('#match-goal-accordions .match-team-goals-accordion').forEach((accordion) => {
    const teamId = accordion.dataset.teamId || '';
    if (!teamId) return;
    const cards = [...accordion.querySelectorAll('.goal-event-card')].map((card) => ({
      type: card.querySelector('.goal-event-type')?.value || 'goal',
      playerId: card.querySelector('.goal-event-player')?.value || '',
      assistPlayerId: card.querySelector('.goal-event-assist')?.value || ''
    }));
    state.set(teamId, { cards, open: accordion.open });
  });
  return state;
}

function goalCardMarkup(teamId, index, data = {}) {
  const type = data.type === 'own_goal' ? 'own_goal' : 'goal';
  return `
    <details class="goal-event-card ${type === 'own_goal' ? 'is-own-goal' : ''}" data-goal-index="${index}" open>
      <summary>
        <span>Gol ${index + 1}</span>
        <span class="goal-card-status">Pendente</span>
      </summary>
      <div class="goal-card-body">
        <div class="goal-card-fields">
          <div class="field">
            <label>Tipo</label>
            <select class="goal-event-type">
              <option value="goal" ${type === 'goal' ? 'selected' : ''}>Gol normal</option>
              <option value="own_goal" ${type === 'own_goal' ? 'selected' : ''}>Gol contra</option>
            </select>
          </div>
          <div class="field goal-player-field">
            <label>${type === 'own_goal' ? 'Jogador responsável pelo gol contra' : 'Autor do gol'}</label>
            <select class="goal-event-player"></select>
          </div>
          <div class="field goal-assist-field ${type === 'own_goal' ? 'hidden' : ''}">
            <label>Assistência</label>
            <select class="goal-event-assist"></select>
          </div>
        </div>
      </div>
    </details>`;
}

function teamGoalsAccordionMarkup(team, score, state = {}, isFirst = false) {
  const cards = Array.isArray(state.cards) ? state.cards : [];
  const shouldOpen = typeof state.open === 'boolean' ? state.open : (isFirst && score > 0);
  return `
    <details class="match-event-accordion match-team-goals-accordion" data-team-id="${team?.id || ''}" ${shouldOpen ? 'open' : ''}>
      <summary>
        <span class="match-accordion-title">Gols de ${escapeHtml(team?.name || 'Time')}</span>
        <span class="match-accordion-count">${score} ${score === 1 ? 'gol' : 'gols'}</span>
      </summary>
      <div class="match-event-accordion-body">
        <div class="team-goal-cards">
          ${score > 0
            ? Array.from({ length: score }, (_, index) => goalCardMarkup(team?.id || '', index, cards[index] || {})).join('')
            : '<div class="team-goals-empty">Nenhum gol para cadastrar neste time.</div>'}
        </div>
      </div>
    </details>`;
}

function populateGoalCard(card, data = {}) {
  const accordion = card.closest('.match-team-goals-accordion');
  const scoringTeamId = accordion?.dataset.teamId || '';
  const typeSelect = card.querySelector('.goal-event-type');
  const playerSelect = card.querySelector('.goal-event-player');
  const assistSelect = card.querySelector('.goal-event-assist');
  const playerField = card.querySelector('.goal-player-field');
  const assistField = card.querySelector('.goal-assist-field');
  if (!typeSelect || !playerSelect || !assistSelect) return;

  const type = data.type === 'own_goal' || typeSelect.value === 'own_goal' ? 'own_goal' : 'goal';
  typeSelect.value = type;
  card.classList.toggle('is-own-goal', type === 'own_goal');

  const responsibleTeamId = type === 'own_goal' ? getOpponentTeamId(scoringTeamId) : scoringTeamId;
  const playerOptions = getPlayersFromTeam(responsibleTeamId);
  const currentPlayerId = data.playerId ?? playerSelect.value ?? '';
  const selectedPlayerId = playerOptions.some((player) => player.id === currentPlayerId) ? currentPlayerId : '';
  playerSelect.innerHTML = `<option value="">Selecione o jogador</option>${playerOptions.map((player) => `<option value="${player.id}" ${player.id === selectedPlayerId ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}`;

  if (playerField) {
    const label = playerField.querySelector('label');
    if (label) label.textContent = type === 'own_goal' ? 'Jogador responsável pelo gol contra' : 'Autor do gol';
  }

  const assistOptions = getPlayersFromTeam(scoringTeamId);
  const currentAssistId = type === 'own_goal' ? '' : (data.assistPlayerId ?? assistSelect.value ?? '');
  const selectedAssistId = assistOptions.some((player) => player.id === currentAssistId) ? currentAssistId : '';
  assistSelect.innerHTML = `<option value="">Sem assistência</option>${assistOptions.map((player) => `<option value="${player.id}" ${player.id === selectedAssistId ? 'selected' : ''}>${escapeHtml(player.name)}</option>`).join('')}`;
  assistSelect.disabled = type === 'own_goal';
  if (assistField) assistField.classList.toggle('hidden', type === 'own_goal');

  syncGoalCardStatus(card);
}

function syncGoalCardStatus(card) {
  const playerId = card.querySelector('.goal-event-player')?.value || '';
  const status = card.querySelector('.goal-card-status');
  if (!status) return;
  const complete = Boolean(playerId);
  status.textContent = complete ? 'Preenchido' : 'Pendente';
  status.classList.toggle('is-complete', complete);
}

function updateScoreEditorLabels() {
  const { homeTeamId, awayTeamId } = getMatchTeamsFromEditor();
  const home = byId(appState.data.teams, homeTeamId);
  const away = byId(appState.data.teams, awayTeamId);
  const homeLabel = document.querySelector('label[for="match-editor-home-score"]');
  const awayLabel = document.querySelector('label[for="match-editor-away-score"]');
  if (homeLabel) homeLabel.textContent = `Gols de ${home?.name || 'Time 1'}`;
  if (awayLabel) awayLabel.textContent = `Gols de ${away?.name || 'Time 2'}`;
}

function syncAutomaticGoalCards(options = {}) {
  const host = document.getElementById('match-goal-accordions');
  const emptyState = document.getElementById('match-goals-empty-state');
  if (!host || !emptyState) return;

  updateScoreEditorLabels();

  const status = document.getElementById('match-editor-status')?.value || 'scheduled';
  if (status !== 'finished') {
    if (options.seedByTeam instanceof Map) {
      matchEditorGoalDraft = options.seedByTeam;
    } else {
      const currentDraft = captureGoalCardsState();
      if (currentDraft.size) matchEditorGoalDraft = currentDraft;
    }
    host.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  const { homeTeamId, awayTeamId } = getMatchTeamsFromEditor();
  const homeTeam = byId(appState.data.teams, homeTeamId);
  const awayTeam = byId(appState.data.teams, awayTeamId);
  if (!homeTeam || !awayTeam || homeTeamId === awayTeamId) {
    host.innerHTML = '';
    host.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyState.innerHTML = 'Selecione <strong>dois times diferentes</strong> para gerar os campos de gols.';
    return;
  }

  emptyState.innerHTML = 'Defina a partida como <strong>Finalizada</strong> e informe o placar para cadastrar os gols.';
  const captured = captureGoalCardsState();
  const previous = options.seedByTeam instanceof Map
    ? options.seedByTeam
    : (captured.size ? captured : matchEditorGoalDraft);
  const homeScore = Math.max(0, Number(document.getElementById('match-editor-home-score')?.value || 0));
  const awayScore = Math.max(0, Number(document.getElementById('match-editor-away-score')?.value || 0));

  host.innerHTML = [
    teamGoalsAccordionMarkup(homeTeam, homeScore, previous.get(homeTeamId) || {}, true),
    teamGoalsAccordionMarkup(awayTeam, awayScore, previous.get(awayTeamId) || {}, false)
  ].join('');

  host.querySelectorAll('.goal-event-card').forEach((card) => {
    const teamId = card.closest('.match-team-goals-accordion')?.dataset.teamId || '';
    const index = Number(card.dataset.goalIndex || 0);
    const seed = previous.get(teamId)?.cards?.[index] || {};
    populateGoalCard(card, seed);
  });

  emptyState.classList.add('hidden');
  host.classList.remove('hidden');
  matchEditorGoalDraft = captureGoalCardsState();
}

function expandStoredEvents(events = []) {
  const expanded = [];
  events.forEach((event) => {
    const quantity = Math.max(1, Number(event.quantity || 1));
    for (let index = 0; index < quantity; index += 1) expanded.push({ ...event, quantity: 1 });
  });
  return expanded;
}

function buildGoalEditorSeed(match, events) {
  const expanded = expandStoredEvents(events);
  const map = new Map([
    [match.homeTeamId, { cards: [], open: Number(match.homeScore || 0) > 0 }],
    [match.awayTeamId, { cards: [], open: false }]
  ]);

  [match.homeTeamId, match.awayTeamId].forEach((teamId) => {
    const goals = expanded
      .filter((item) => item.teamId === teamId && (item.type === 'goal' || item.type === 'own_goal'))
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    const assists = expanded
      .filter((item) => item.teamId === teamId && item.type === 'assist')
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    const unusedAssists = [...assists];
    const cards = goals.map((goal, goalIndex) => {
      const canHaveAssist = goal.type !== 'own_goal';
      let assist = null;
      if (canHaveAssist) {
        const orderedIndex = unusedAssists.findIndex((item) => Number(item.order || 0) > 0 && Number(item.order || 0) === Number(goal.order || goalIndex + 1));
        assist = orderedIndex >= 0 ? unusedAssists.splice(orderedIndex, 1)[0] : unusedAssists.shift();
      }
      return {
        type: goal.type === 'own_goal' ? 'own_goal' : 'goal',
        playerId: goal.playerId || '',
        assistPlayerId: assist?.playerId || ''
      };
    });
    map.set(teamId, { ...(map.get(teamId) || {}), cards });
  });

  return map;
}

function getSuggestedMatchForRound(roundId, ignoreMatchId = '') {
  const usedPairs = new Set((appState.data.matches || [])
    .filter((match) => match.roundId === roundId && match.id !== ignoreMatchId)
    .map((match) => [match.homeTeamId, match.awayTeamId].sort().join('::')));

  const teams = [...(appState.data.teams || [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      const key = [teams[i].id, teams[j].id].sort().join('::');
      if (!usedPairs.has(key)) return { homeTeamId: teams[i].id, awayTeamId: teams[j].id };
    }
  }

  return { homeTeamId: teams[0]?.id || '', awayTeamId: teams[1]?.id || '' };
}

function syncMatchEditorFromRound(roundId, preserveTeams = false) {
  const round = byId(appState.data.rounds, roundId);
  if (round && document.getElementById('match-editor-date')) {
    document.getElementById('match-editor-date').value = round.date || '';
  }

  if (!preserveTeams) {
    const currentMatchId = document.getElementById('match-editor-id')?.value || '';
    const suggested = getSuggestedMatchForRound(roundId, currentMatchId);
    if (document.getElementById('match-editor-home')) document.getElementById('match-editor-home').value = suggested.homeTeamId || '';
    if (document.getElementById('match-editor-away')) document.getElementById('match-editor-away').value = suggested.awayTeamId || '';
  }

  refreshMatchEventRows();
  syncAutomaticGoalCards();
}

function resetMatchEditor() {
  document.getElementById('match-editor-form')?.reset();
  document.getElementById('match-editor-id').value = '';
  document.getElementById('match-editor-picker').value = '';
  document.getElementById('match-editor-status').value = 'scheduled';
  document.getElementById('match-editor-home-score').value = 0;
  document.getElementById('match-editor-away-score').value = 0;
  document.getElementById('match-events-builder-cards').innerHTML = '';
  document.getElementById('match-goal-accordions').innerHTML = '';
  matchEditorGoalDraft = new Map();
  const defaultRoundId = [...(appState.data.rounds || [])].sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0]?.id || '';
  if (defaultRoundId) {
    document.getElementById('match-editor-round').value = defaultRoundId;
    syncMatchEditorFromRound(defaultRoundId, false);
  } else {
    syncAutomaticGoalCards({ seedByTeam: new Map() });
  }
  refreshMatchEventRows();
  const cardsAccordion = document.getElementById('match-cards-accordion');
  if (cardsAccordion) cardsAccordion.open = false;
}

function loadMatchIntoEditor(id) {
  const match = byId(appState.data.matches, id);
  if (!match) return;
  document.getElementById('match-editor-id').value = match.id;
  document.getElementById('match-editor-picker').value = match.id;
  document.getElementById('match-editor-round').value = match.roundId;
  document.getElementById('match-editor-date').value = match.date;
  document.getElementById('match-editor-home').value = match.homeTeamId;
  document.getElementById('match-editor-away').value = match.awayTeamId;
  document.getElementById('match-editor-status').value = match.status;
  document.getElementById('match-editor-home-score').value = Number(match.homeScore ?? 0);
  document.getElementById('match-editor-away-score').value = Number(match.awayScore ?? 0);

  const allEvents = appState.data.events.filter((event) => event.matchId === match.id);
  const goalSeed = buildGoalEditorSeed(match, allEvents);
  matchEditorGoalDraft = goalSeed;
  document.getElementById('match-events-builder-cards').innerHTML = '';
  expandStoredEvents(allEvents)
    .filter((event) => event.type === 'yellow_card' || event.type === 'red_card')
    .forEach((event) => addMatchEventRow(event));

  syncAutomaticGoalCards({ seedByTeam: goalSeed });
  refreshMatchEventRows();
  const cardsAccordion = document.getElementById('match-cards-accordion');
  if (cardsAccordion) cardsAccordion.open = document.querySelectorAll('#match-events-builder-cards .event-row').length > 0;
}

function collectGoalEditorEvents(matchId) {
  const { homeTeamId, awayTeamId } = getMatchTeamsFromEditor();
  const allowedTeams = new Set([homeTeamId, awayTeamId].filter(Boolean));
  const cards = [...document.querySelectorAll('#match-goal-accordions .goal-event-card')];
  const status = document.getElementById('match-editor-status')?.value || 'scheduled';

  if (!cards.length && status !== 'finished') {
    return appState.data.events
      .filter((event) => event.matchId === matchId && ['goal', 'own_goal', 'assist'].includes(event.type))
      .map((event) => ({ ...event }));
  }

  const events = [];

  for (const card of cards) {
    const scoringTeamId = card.closest('.match-team-goals-accordion')?.dataset.teamId || '';
    const index = Number(card.dataset.goalIndex || 0) + 1;
    const type = card.querySelector('.goal-event-type')?.value === 'own_goal' ? 'own_goal' : 'goal';
    const playerId = card.querySelector('.goal-event-player')?.value || '';
    const assistPlayerId = type === 'own_goal' ? '' : (card.querySelector('.goal-event-assist')?.value || '');
    const scoringTeam = byId(appState.data.teams, scoringTeamId);

    if (!allowedTeams.has(scoringTeamId)) throw new Error('Há gol associado a um time fora da partida.');
    if (!playerId) throw new Error(`${scoringTeam?.name || 'Time'}: selecione o jogador do Gol ${index}.`);

    const player = byId(appState.data.players, playerId);
    const expectedPlayerTeamId = type === 'own_goal' ? getOpponentTeamId(scoringTeamId) : scoringTeamId;
    if (!player || player.teamId !== expectedPlayerTeamId) {
      throw new Error(type === 'own_goal'
        ? `${scoringTeam?.name || 'Time'}: o responsável pelo gol contra deve ser um jogador do adversário.`
        : `${scoringTeam?.name || 'Time'}: o autor do gol deve pertencer ao próprio time.`);
    }

    events.push({
      id: uid('event'),
      matchId,
      playerId,
      teamId: scoringTeamId,
      type,
      ...(type === 'own_goal' ? { responsibleTeamId: player.teamId, creditedTeamId: scoringTeamId } : {}),
      order: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (assistPlayerId) {
      const assistPlayer = byId(appState.data.players, assistPlayerId);
      if (!assistPlayer || assistPlayer.teamId !== scoringTeamId) {
        throw new Error(`${scoringTeam?.name || 'Time'}: a assistência deve ser de um jogador da equipe que marcou.`);
      }
      events.push({
        id: uid('event'),
        matchId,
        playerId: assistPlayerId,
        teamId: scoringTeamId,
        type: 'assist',
        relatedPlayerId: playerId,
        order: index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  return events;
}

function collectCardEditorEvents(matchId) {
  const { homeTeamId, awayTeamId } = getMatchTeamsFromEditor();
  const allowedTeams = new Set([homeTeamId, awayTeamId].filter(Boolean));
  const rows = [...document.querySelectorAll('#match-events-builder-cards .event-row')];
  const events = [];

  for (const row of rows) {
    const type = row.querySelector('.event-row-type')?.value === 'red_card' ? 'red_card' : 'yellow_card';
    const teamId = row.querySelector('.event-row-team')?.value || '';
    const playerId = row.querySelector('.event-row-player')?.value || '';
    if (!teamId || !playerId) throw new Error('Preencha time e jogador em cada cartão antes de salvar.');
    if (!allowedTeams.has(teamId)) throw new Error('Há cartão com time fora da partida.');
    const player = byId(appState.data.players, playerId);
    if (!player || player.teamId !== teamId) throw new Error('Há cartão com jogador incompatível com o time selecionado.');

    events.push({
      id: uid('event'),
      matchId,
      playerId,
      teamId,
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return events;
}

function collectMatchEditorEvents(matchId) {
  return [...collectGoalEditorEvents(matchId), ...collectCardEditorEvents(matchId)];
}

function validateMatchEventTotals(match, events) {
  if (match.status !== 'finished') return;

  const totals = new Map([
    [match.homeTeamId, { goals: 0, normalGoals: 0, ownGoals: 0, assists: 0 }],
    [match.awayTeamId, { goals: 0, normalGoals: 0, ownGoals: 0, assists: 0 }]
  ]);

  events.forEach((item) => {
    const bucket = totals.get(item.teamId);
    if (!bucket) return;
    if (item.type === 'goal') {
      bucket.goals += 1;
      bucket.normalGoals += 1;
    }
    if (item.type === 'own_goal') {
      bucket.goals += 1;
      bucket.ownGoals += 1;
    }
    if (item.type === 'assist') bucket.assists += 1;
  });

  const checks = [
    { teamId: match.homeTeamId, expectedGoals: Number(match.homeScore || 0) },
    { teamId: match.awayTeamId, expectedGoals: Number(match.awayScore || 0) }
  ];

  checks.forEach(({ teamId, expectedGoals }) => {
    const team = byId(appState.data.teams, teamId);
    const bucket = totals.get(teamId) || { goals: 0, normalGoals: 0, ownGoals: 0, assists: 0 };
    const teamName = team?.name || 'Time';

    if (bucket.goals !== expectedGoals) {
      throw new Error(`${teamName}: você informou ${expectedGoals} gol(s) no placar, então precisa preencher exatamente ${expectedGoals} gol(s).`);
    }

    if (bucket.assists > bucket.normalGoals) {
      throw new Error(`${teamName}: gols contra não recebem assistência. O máximo permitido é ${bucket.normalGoals} assistência(s).`);
    }
  });
}

async function handleMatchEditorSave(event) {
  event.preventDefault();

  await withAdminSubmit(event.target, 'Salvando...', async () => {
    const id = document.getElementById('match-editor-id').value || uid('match');
    const roundId = document.getElementById('match-editor-round').value;
    const date = document.getElementById('match-editor-date').value;
    const homeTeamId = document.getElementById('match-editor-home').value;
    const awayTeamId = document.getElementById('match-editor-away').value;
    const status = document.getElementById('match-editor-status').value;
    const homeScore = Number(document.getElementById('match-editor-home-score').value || 0);
    const awayScore = Number(document.getElementById('match-editor-away-score').value || 0);

    if (!roundId || !date || !homeTeamId || !awayTeamId) {
      showAdminMessage('Preencha rodada, data e os dois times.', 'error');
      return;
    }

    if (homeTeamId === awayTeamId) {
      showAdminMessage('Escolha times diferentes para a partida.', 'error');
      return;
    }

    const current = byId(appState.data.matches, id);
    const payload = {
      id,
      roundId,
      date,
      homeTeamId,
      awayTeamId,
      status,
      homeScore: status === 'finished' ? homeScore : null,
      awayScore: status === 'finished' ? awayScore : null,
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newEvents = collectMatchEditorEvents(id);
    validateMatchEventTotals(payload, newEvents);
    const oldEvents = appState.data.events.filter((item) => item.matchId === id);

    if (current) Object.assign(current, payload);
    else appState.data.matches.push(payload);

    appState.data.events = appState.data.events.filter((item) => item.matchId !== id).concat(newEvents);

    await setDoc(COLLECTIONS.matches, id, payload, false);
    await Promise.all(oldEvents.map((item) => deleteDoc(COLLECTIONS.events, item.id)));
    await Promise.all(newEvents.map((item) => setDoc(COLLECTIONS.events, item.id, item, false)));
    await updateRoundStatus(roundId);
    persistLocalSnapshot();
    fillAdminSelects();
    document.getElementById('match-editor-picker').value = id;
    showAdminMessage(newEvents.length ? 'Partida salva com sucesso.' : 'Partida salva sem eventos. Você pode editar depois para adicionar gols, assistências e cartões.');
    rerenderAll();
    loadMatchIntoEditor(id);
  });
}

function renderMatchCenterPanel() {
  const el = document.getElementById('match-center-list');
  if (!el) return;

  const matches = [...appState.data.matches].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (!matches.length) {
    el.innerHTML = renderEmptyState('Nenhuma partida cadastrada ainda.');
    if (!document.getElementById('match-editor-id')?.value) resetMatchEditor();
    return;
  }

  el.innerHTML = `
    <div class="admin-match-list">
      ${matches.map((match) => {
        const home = byId(appState.data.teams, match.homeTeamId);
        const away = byId(appState.data.teams, match.awayTeamId);
        const count = appState.data.events.filter((event) => event.matchId === match.id).reduce((sum, event) => sum + Math.max(1, Number(event.quantity || 1)), 0);
        return `
          <button class="admin-match-card ${document.getElementById('match-editor-id')?.value === match.id ? 'active' : ''}" type="button" data-edit-match="${match.id}">
            <strong>${escapeHtml(home?.name || '')} x ${escapeHtml(away?.name || '')}</strong>
            <span>${formatDateLong(match.date)} • ${match.status === 'finished' ? `${match.homeScore} x ${match.awayScore}` : 'Agendado'}</span>
            <small>${count} evento(s)</small>
          </button>`;
      }).join('')}
    </div>`;

  if (!document.getElementById('match-editor-id')?.value) resetMatchEditor();
}

function resetForm(id, hiddenId) {
  document.getElementById(id)?.reset();
  if (hiddenId && document.getElementById(hiddenId)) {
    document.getElementById(hiddenId).value = '';
  }
}

function showAdminMessage(message, type = 'success') {
  const region = document.getElementById('admin-toast-region');
  const normalizedType = ['success', 'error', 'warning'].includes(type) ? type : 'success';

  if (!region) {
    setNotice('admin-notice', message, normalizedType);
    return;
  }

  hideNotice('admin-notice');
  const icon = normalizedType === 'error' ? '✕' : normalizedType === 'warning' ? '!' : '✓';
  const title = normalizedType === 'error' ? 'Não foi possível concluir' : normalizedType === 'warning' ? 'Atenção' : 'Tudo certo';
  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast-${normalizedType}`;
  toast.setAttribute('role', normalizedType === 'error' ? 'alert' : 'status');
  toast.innerHTML = `
    <span class="admin-toast-icon" aria-hidden="true">${icon}</span>
    <div class="admin-toast-copy">
      <strong>${title}</strong>
      <span>${escapeHtml(message)}</span>
    </div>
    <button class="admin-toast-close" type="button" aria-label="Fechar mensagem">×</button>`;

  const removeToast = () => {
    if (!toast.isConnected) return;
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 220);
  };

  toast.querySelector('.admin-toast-close')?.addEventListener('click', removeToast);
  region.appendChild(toast);
  window.requestAnimationFrame(() => toast.classList.add('is-visible'));
  window.setTimeout(removeToast, normalizedType === 'error' ? 6500 : 4500);
}

function bindPublicEvents() {
  document.querySelectorAll('.segmented button[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.tableView = button.dataset.view;
      document.querySelectorAll('.segmented button[data-view]').forEach((item) => {
        item.classList.toggle('active', item === button);
      });
      renderStandings();
    });
  });

  document.querySelectorAll('.card-filter button[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.cardFilter = button.dataset.filter;
      document.querySelectorAll('.card-filter button[data-filter]').forEach((item) => {
        item.classList.toggle('active', item === button);
      });
      renderCardsPage();
    });
  });

  document.querySelectorAll('[data-dashboard-link]').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      const href = card.dataset.dashboardLink;
      if (href) {
        window.location.href = href;
      }
    });
  });
}

function bindAdminEvents() {
  document.getElementById('login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideNotice('login-notice');

    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';
      }

      await loginAdmin(email, password);
      await openAdmin();
    } catch (error) {
      let message = error?.message || 'Falha no login.';

      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
        message = 'Email ou senha inválidos.';
      } else if (message.includes('auth/user-not-found')) {
        message = 'Usuário admin não encontrado no Firebase.';
      } else if (message.includes('auth/invalid-email')) {
        message = 'Email inválido.';
      } else if (message.includes('auth/network-request-failed')) {
        message = 'Falha de conexão. Verifique sua internet.';
      } else if (message.includes('permission-denied')) {
        message = 'Sem permissão no Firestore. Revise as regras do Firebase.';
      }

      setNotice('login-notice', message, 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar no painel';
      }
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await logoutAdmin();
    closeAdmin();
  });

  document.querySelectorAll('.admin-menu button[data-admin-view]').forEach((button) => {
    button.addEventListener('click', () => showAdminView(button.dataset.adminView));
  });

  document.getElementById('team-form')?.addEventListener('submit', handleTeamSave);
  document.getElementById('player-form')?.addEventListener('submit', handlePlayerSave);
  document.getElementById('round-form')?.addEventListener('submit', handleRoundSave);
  document.getElementById('match-form')?.addEventListener('submit', handleMatchSave);
  document.getElementById('match-editor-form')?.addEventListener('submit', handleMatchEditorSave);
  document.getElementById('settings-form')?.addEventListener('submit', handleSettingsSave);
  document.getElementById('team-championship-form')?.addEventListener('submit', handleTeamChampionshipSave);
  document.getElementById('team-championship-formation')?.addEventListener('change', renderTeamChampionshipAdmin);

  document.getElementById('team-form-reset')?.addEventListener('click', () => resetForm('team-form', 'team-id'));
  document.getElementById('player-form-reset')?.addEventListener('click', () => { resetForm('player-form', 'player-id'); resetPlayerPhotoRemovalFlag(); });
  document.getElementById('player-remove-photo-btn')?.addEventListener('click', markPlayerPhotoForRemoval);
  document.getElementById('round-form-reset')?.addEventListener('click', () => resetForm('round-form', 'round-id'));
  document.getElementById('match-form-reset')?.addEventListener('click', () => resetForm('match-form', 'match-id'));
  document.getElementById('match-editor-reset')?.addEventListener('click', resetMatchEditor);
  document.getElementById('add-card-event-row')?.addEventListener('click', () => addMatchEventRow({ type: 'yellow_card' }));
  document.getElementById('match-editor-picker')?.addEventListener('change', (event) => {
    const matchId = event.target.value;
    if (matchId) loadMatchIntoEditor(matchId);
    else resetMatchEditor();
  });
  document.getElementById('match-editor-round')?.addEventListener('change', (event) => {
    const preserveTeams = Boolean(document.getElementById('match-editor-id')?.value);
    syncMatchEditorFromRound(event.target.value, preserveTeams);
  });
  ['match-editor-home', 'match-editor-away'].forEach((id) => {
    document.getElementById(id)?.addEventListener('change', () => {
      refreshMatchEventRows();
      syncAutomaticGoalCards();
    });
  });
  document.getElementById('match-editor-status')?.addEventListener('change', () => syncAutomaticGoalCards());
  ['match-editor-home-score', 'match-editor-away-score'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => syncAutomaticGoalCards());
  });

  document.body.addEventListener('change', (event) => {
    const goalCard = event.target.closest('.goal-event-card');
    if (goalCard) {
      if (event.target.matches('.goal-event-type')) {
        populateGoalCard(goalCard, {
          type: event.target.value,
          playerId: '',
          assistPlayerId: ''
        });
      } else {
        syncGoalCardStatus(goalCard);
      }
      matchEditorGoalDraft = captureGoalCardsState();
      return;
    }

    const cardRow = event.target.closest('#match-events-builder-cards .event-row');
    if (cardRow && event.target.matches('.event-row-team')) {
      populateEventRow(cardRow, {
        type: cardRow.querySelector('.event-row-type')?.value || 'yellow_card',
        teamId: event.target.value,
        playerId: ''
      });
    }
  });

  document.body.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-edit-team],[data-delete-team],[data-edit-player],[data-delete-player],[data-edit-round],[data-delete-round],[data-edit-match],[data-delete-match],[data-delete-event],[data-remove-event-row]');
    if (!target) return;

    const {
      editTeam,
      deleteTeam: deleteTeamId,
      editPlayer,
      deletePlayer: deletePlayerId,
      editRound,
      deleteRound: deleteRoundId,
      editMatch,
      deleteMatch: deleteMatchId,
      deleteEvent: deleteEventId,
      removeEventRow
    } = target.dataset;

    if (editTeam) fillTeamForm(editTeam);
    if (deleteTeamId) await deleteTeam(deleteTeamId);
    if (editPlayer) fillPlayerForm(editPlayer);
    if (deletePlayerId) await deletePlayer(deletePlayerId);
    if (editRound) fillRoundForm(editRound);
    if (deleteRoundId) await deleteRound(deleteRoundId);
    if (editMatch) fillMatchForm(editMatch);
    if (deleteMatchId) await deleteMatch(deleteMatchId);
    if (deleteEventId) await deleteEvent(deleteEventId);
    if (removeEventRow) {
      target.closest('.event-row')?.remove();
      updateCardsAccordionSummary();
    }
  });
}

function rerenderAll() {
  populatePublicPages();
  if (appState.page === 'admin' && isAdminLogged()) {
    refreshAdmin();
  }
}


async function ensurePublicVoterAuth() {
  if (appState.page === 'admin' || !appState.usingFirebase || !appState.firebase?.auth) return;

  const currentUser = appState.firebase.auth.currentUser;
  if (currentUser) return;

  try {
    await appState.firebase.auth.signInAnonymously();
  } catch (error) {
    console.error('Falha ao iniciar sessão pública anônima.', error);
  }
}

async function initAdminAuthState() {
  if (appState.page !== 'admin') return;

  bindAdminEvents();

  if (!appState.usingFirebase) {
    closeAdmin();
    setNotice('login-notice', 'Firebase não carregou. Verifique Auth e Firestore no projeto.', 'error');
    return;
  }

  appState.firebase.auth.onAuthStateChanged(async (user) => {
    appState.authUser = user;

    if (user && !user.isAnonymous) {
      try {
        await openAdmin();
      } catch (error) {
        console.error(error);
        closeAdmin();
        setNotice('login-notice', 'Login realizado, mas não foi possível carregar os dados do painel.', 'error');
      }
    } else {
      closeAdmin();
    }
  });
}

async function init() {
  bindPublicEvents();
  await ensureDataLoaded();
  await ensurePublicVoterAuth();

  if (appState.page === 'admin') {
    await initAdminAuthState();
    return;
  }

  populatePublicPages();
}

init();