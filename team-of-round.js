(function() {
    const FORMATIONS = {
        // A formação agora é tratada por tipo de setor: defesa, meio e ataque.
        // No meio, alas e meias concorrem juntos. Ex.: 2-3-1 = 2 defesas, 3 jogadores de meio, 1 atacante.
        '3-2-1': { goleiro: 1, defesa: 3, meio: 2, ataque: 1 },
        '2-3-1': { goleiro: 1, defesa: 2, meio: 3, ataque: 1 },
        '2-2-2': { goleiro: 1, defesa: 2, meio: 2, ataque: 2 },
        '1-3-2': { goleiro: 1, defesa: 1, meio: 3, ataque: 2 },
        '2-1-3': { goleiro: 1, defesa: 2, meio: 1, ataque: 3 }
    };
    const SLOT_TYPES = ['goleiro', 'defesa', 'meio', 'ataque'];
    const POSITIONS = ['goleiro', 'zagueiro', 'ala', 'meia', 'atacante'];
    const TYPE_ACCEPTS = {
        goleiro: ['goleiro'],
        defesa: ['zagueiro'],
        meio: ['meia', 'ala'],
        ataque: ['atacante']
    };
    const LEGACY_TO_TYPE = {
        goleiro: 'goleiro',
        zagueiro: 'defesa',
        defesa: 'defesa',
        ala: 'meio',
        meia: 'meio',
        meio: 'meio',
        atacante: 'ataque',
        ataque: 'ataque'
    };
    const TYPE_DEFAULT_LEGACY_POSITION = { goleiro: 'goleiro', defesa: 'zagueiro', meio: 'meia', ataque: 'atacante' };
    const VOTER_KEY = 'team_of_round_voter_id_v1';
    const LOCAL_VOTE_KEY = 'team_of_round_local_votes_v1';
    const DEFAULT_FIELD_IMAGE = createDefaultFieldImage();
    let adminBindingsReady = false;
    let voteDraftState = {};
    let voteModalState = { roundId: '', slotKey: '', candidateId: '', anchorTop: 24 };

    function createDefaultFieldImage() {
        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 920">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
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
        </defs>
        <rect width="1600" height="920" fill="url(#bg)"/>
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
      </svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    function positionLabelLocal(position) {
        return ({
            goleiro: 'Goleiro',
            zagueiro: 'Defesa',
            defesa: 'Defesa',
            ala: 'Ala',
            meia: 'Meia',
            meio: 'Meio',
            atacante: 'Ataque',
            ataque: 'Ataque'
        }[position] || position || '—');
    }

    function positionToType(position) {
        return LEGACY_TO_TYPE[position] || position || 'meio';
    }

    function typeToLegacyPosition(type) {
        return TYPE_DEFAULT_LEGACY_POSITION[type] || type || 'meia';
    }

    function typeHelpText(type) {
        if (type === 'meio') return 'Meias e alas podem ser votados neste setor.';
        if (type === 'defesa') return 'Zagueiros disputam este setor.';
        if (type === 'ataque') return 'Atacantes disputam este setor.';
        return 'Goleiros disputam esta vaga.';
    }

    function getCandidateType(candidate = {}, player = null) {
        return positionToType(candidate.disputedType || candidate.disputedPosition || player?.mainPosition || 'meio');
    }

    function normalizeFormationPositions(formation) {
        return { ...(FORMATIONS[formation] || FORMATIONS['2-3-1']) };
    }

    function normalizeConfigPositions(formation, rawPositions = {}) {
        const base = normalizeFormationPositions(formation);
        const raw = rawPositions || {};
        const hasTypedPositions = SLOT_TYPES.some((type) => raw[type] !== undefined);
        if (hasTypedPositions) {
            return SLOT_TYPES.reduce((acc, type) => {
                acc[type] = Number(raw[type] ?? base[type] ?? 0);
                return acc;
            }, {});
        }

        // Compatibilidade com configurações antigas que separavam ala e meia.
        return {
            goleiro: Number(raw.goleiro ?? base.goleiro ?? 1),
            defesa: Number(raw.defesa ?? raw.zagueiro ?? base.defesa ?? 0),
            meio: Number(raw.meio ?? ((Number(raw.ala || 0) + Number(raw.meia || 0)) || base.meio || 0)),
            ataque: Number(raw.ataque ?? raw.atacante ?? base.ataque ?? 0)
        };
    }

    function getRootState() {
        const settings = getSettings ?.() || {};
        const tor = settings.teamOfRound || {};
        return {
            votingConfigs: tor.votingConfigs || {},
            results: tor.results || {},
            currentRoundId: tor.currentRoundId || ''
        };
    }

    function saveRootState(nextRoot) {
        appState.data.settings = {
            ...(appState.data.settings || {}),
            teamOfRound: nextRoot,
            updatedAt: new Date().toISOString()
        };
        return setDoc(COLLECTIONS.settings, 'main', appState.data.settings, true).then(() => persistLocalSnapshot());
    }

    function getRoundById(id) {
        return byId(appState.data ?.rounds || [], id);
    }

    function getVoterId() {
        let value = localStorage.getItem(VOTER_KEY);
        if (!value) {
            value = uid('voter');
            localStorage.setItem(VOTER_KEY, value);
        }
        return value;
    }

    function getRoundOptions(selected = '') {
        return ['<option value="">Selecione</option>']
            .concat(
                [...(appState.data ?.rounds || [])]
                .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                .map((round) => `<option value="${round.id}" ${round.id === selected ? 'selected' : ''}>${escapeHtml(round.title)} • ${formatDateLong(round.date)}</option>`)
            )
            .join('');
    }

    function formatDateTimeLocal(value) {
        if (!value) return '';
        const date = new Date(value);
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function getConfig(roundId) {
        const root = getRootState();
        const round = getRoundById(roundId);
        const savedConfig = (root.votingConfigs || {})[roundId] || {};
        const formation = savedConfig.formation || round ?.formation || '2-3-1';
        const basePositions = normalizeFormationPositions(formation);
        return {
            roundId,
            status: 'draft',
            formation,
            votingStartsAt: '',
            votingEndsAt: '',
            fieldImage: '',
            positions: basePositions,
            candidates: [],
            ...savedConfig,
            positions: normalizeConfigPositions(formation, savedConfig.positions || basePositions)
        };
    }

    function getPlayersForRound(roundId, explicitConfig = null) {
        const config = explicitConfig || getConfig(roundId);
        return [...(appState.data ?.players || [])]
            .map((player) => {
                const candidate = (config.candidates || []).find((item) => item.playerId === player.id) || {};
                const playedPosition = candidate.disputedPosition || player.mainPosition || 'meia';
                return {
                    ...player,
                    active: candidate.playerId ? candidate.active !== false : false,
                    playedPosition,
                    playedType: getCandidateType(candidate, player)
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }

    function getFieldImage(configOrResult) {
        return configOrResult ?.fieldImage || DEFAULT_FIELD_IMAGE;
    }

    function serializeCandidates(roundId) {
        return (appState.data.players || []).map((player) => {
            const active = document.querySelector(`[data-candidate-active="${player.id}"]`) ?.checked || false;
            const disputedType = document.querySelector(`[data-candidate-type="${player.id}"]`) ?.value || positionToType(player.mainPosition || 'meio');
            return {
                roundId,
                playerId: player.id,
                teamId: player.teamId || '',
                disputedType,
                disputedPosition: typeToLegacyPosition(disputedType),
                active,
                createdAt: new Date().toISOString()
            };
        }).filter((item) => item.active);
    }

    function candidateMarkup(roundId, explicitConfig = null) {
        const config = explicitConfig || getConfig(roundId);
        const players = getPlayersForRound(roundId, config);

        return SLOT_TYPES.map((type) => {
            const items = players.filter((player) => player.playedType === type || positionToType(player.mainPosition) === type);
            return `
        <div class="team-of-round-slot-group">
          <div class="team-of-round-slot-head">
            <strong>${positionLabelLocal(type)}</strong>
            <span>${config.positions[type] || 0} vaga(s)</span>
          </div>
          <p class="team-of-round-form-muted">${escapeHtml(typeHelpText(type))}</p>
          <div class="team-of-round-slot-grid">
            ${items.length ? items.map((player) => {
              const team = byId(appState.data.teams || [], player.teamId);
              const candidate = (config.candidates || []).find((item) => item.playerId === player.id) || {};
              const selectedType = getCandidateType(candidate, player);
              return `
                <div class="vote-card">
                  <label><input type="checkbox" data-candidate-active="${player.id}" ${candidate.playerId && candidate.active !== false ? 'checked' : ''}> ${escapeHtml(player.name)}</label>
                  <div class="team-line">${renderTeamIdentity(team)} <span>${escapeHtml(team?.name || 'Sem time')}</span></div>
                  <div class="team-of-round-form-muted">Posição base: ${escapeHtml(positionLabelLocal(player.mainPosition))}</div>
                  <div class="field">
                    <label>Tipo da formação</label>
                    <select data-candidate-type="${player.id}">
                      ${SLOT_TYPES.map((item) => `<option value="${item}" ${selectedType === item ? 'selected' : ''}>${positionLabelLocal(item)}</option>`).join('')}
                    </select>
                  </div>
                </div>`;
            }).join('') : '<div class="empty">Nenhum jogador disponível neste tipo.</div>'}
          </div>
        </div>`;
        }).join('');
    }

async function saveVote(roundId, payload) {
    const voterId = getVoterId();
    const docId = `${roundId}_${voterId}`;
    const voteDoc = { roundId, voterId, choices: payload, createdAt: new Date().toISOString() };
    const localVotes = JSON.parse(localStorage.getItem(LOCAL_VOTE_KEY) || '{}');
    localVotes[docId] = voteDoc;
    localStorage.setItem(LOCAL_VOTE_KEY, JSON.stringify(localVotes));

    if (appState.usingFirebase && appState.firebase ?.db) {
        try {
            await appState.firebase.db.collection('votes').doc(docId).set(voteDoc, { merge: true });
        } catch (error) {
            console.error('Falha ao salvar voto no Firestore, mantendo local.', error);
        }
    }
}

async function loadVotes(roundId) {
    const localVotes = Object.values(JSON.parse(localStorage.getItem(LOCAL_VOTE_KEY) || '{}')).filter((item) => item.roundId === roundId);
    if (appState.usingFirebase && appState.firebase ?.db) {
        try {
            const snap = await appState.firebase.db.collection('votes').where('roundId', '==', roundId).get();
            const remote = snap.docs.map((doc) => doc.data());
            const map = new Map();
            [...localVotes, ...remote].forEach((item) => map.set(`${item.roundId}_${item.voterId}`, item));
            return [...map.values()];
        } catch (error) {
            console.error('Falha ao carregar votos do Firestore.', error);
        }
    }
    return localVotes;
}

async function buildResult(roundId) {
    const config = getConfig(roundId);
    const votes = await loadVotes(roundId);
    const tally = {};
    SLOT_TYPES.forEach((type) => { tally[type] = new Map(); });

    votes.forEach((vote) => {
        Object.entries(vote.choices || {}).forEach(([slot, playerId]) => {
            if (!playerId) return;
            const type = positionToType(String(slot || '').split('_')[0]);
            if (!tally[type]) return;
            tally[type].set(playerId, (tally[type].get(playerId) || 0) + 1);
        });
    });

    const rankings = {};
    const winners = {};
    SLOT_TYPES.forEach((type) => {
        const limit = Number(config.positions[type] || 0);
        rankings[type] = [...(tally[type] || new Map()).entries()]
            .map(([playerId, voteCount]) => {
                const player = byId(appState.data.players || [], playerId);
                return {
                    playerId,
                    votes: voteCount,
                    playerName: player?.name || '',
                    tieBreaker: 'Votos > ordem alfabética > ID do jogador'
                };
            })
            .sort((a, b) => {
                if (b.votes !== a.votes) return b.votes - a.votes;
                const nameCompare = (a.playerName || '').localeCompare((b.playerName || ''), 'pt-BR', { sensitivity: 'base' });
                if (nameCompare !== 0) return nameCompare;
                return String(a.playerId).localeCompare(String(b.playerId));
            });

        winners[type] = rankings[type]
            .slice(0, limit)
            .map((item) => item.playerId);
    });

    return {
        roundId,
        formation: config.formation,
        fieldImage: config.fieldImage || '',
        status: 'final',
        winners,
        rankings,
        tieBreaker: 'Em caso de empate: maior número de votos; persistindo empate, ordem alfabética do nome; persistindo empate, ID do jogador.',
        totalVotes: votes.length,
        generatedAt: new Date().toISOString()
    };
}

async function finalizeRound(roundId, silent = false) {
    if (!roundId) return;
    const root = getRootState();
    const result = await buildResult(roundId);
    root.results = {...(root.results || {}), [roundId]: result };
    root.votingConfigs = {
        ...(root.votingConfigs || {}),
        [roundId]: {...getConfig(roundId), status: 'closed' }
    };
    root.currentRoundId = roundId;
    await saveRootState(root);
    if (!silent) showAdminMessage('Votação apurada com sucesso.', 'success');
    rerenderAll();
}

async function finalizeIfNeeded(roundId) {
    const config = getConfig(roundId);
    if (config.status !== 'open' || !config.votingEndsAt) return;
    if (Date.now() >= new Date(config.votingEndsAt).getTime()) {
        await finalizeRound(roundId, true);
    }
}

function getWinnerIdsForType(result, type) {
    const winners = result?.winners || {};
    if (Array.isArray(winners[type])) return winners[type];
    if (type === 'defesa') return winners.zagueiro || winners.defesa || [];
    if (type === 'meio') return [...(winners.meio || []), ...(winners.ala || []), ...(winners.meia || [])];
    if (type === 'ataque') return winners.atacante || winners.ataque || [];
    return winners.goleiro || [];
}

function getPitchRows(configOrResult = {}) {
    const formation = FORMATIONS[configOrResult?.formation] || FORMATIONS['2-3-1'];
    const positions = normalizeConfigPositions(configOrResult?.formation || '2-3-1', configOrResult?.positions || formation);
    return [
        { type: 'goleiro', top: 11, count: 1, label: 'Goleiro' },
        { type: 'defesa', top: 31, count: positions.defesa || formation.defesa || 0, label: 'Defesa' },
        { type: 'meio', top: 53, count: positions.meio || formation.meio || 0, label: 'Meio' },
        { type: 'ataque', top: 80, count: positions.ataque || formation.ataque || 0, label: 'Ataque' }
    ];
}

function renderPitchFromResult(result) {
    const rows = getPitchRows(result);

    const nodes = rows.map((row) => {
        const ids = getWinnerIdsForType(result, row.type);
        const count = Math.max(Number(row.count || 0), ids.length || 1);

        return Array.from({ length: count }, (_, index) => {
            const left = count === 1 ? 50 : 18 + ((64 / (count - 1)) * index);
            const player = byId(appState.data.players || [], ids[index] || '');
            const team = byId(appState.data.teams || [], player ?.teamId || '');

            return `
          <div class="team-of-round-player ${row.type === 'goleiro' ? 'is-goalkeeper' : ''}" style="left:${left}%; top:${row.top}%">
            <div class="team-of-round-player-figure">
              ${player ? `<img class="team-of-round-player-photo" src="${escapeHtml(getPlayerPhoto(player))}" alt="${escapeHtml(player.name)}">` : '<div class="team-of-round-placeholder-dot">+</div>'}
            </div>
            <div class="team-of-round-player-label">${player ? renderTeamIdentity(team) : ''}<strong>${escapeHtml(player?.name || 'Vago')}</strong></div>
          </div>`;
        }).join('');
    }).join('');

    return `
      <div class="team-of-round-pitch-frame">
        <div class="team-of-round-pitch" style="background-image:url('${escapeHtml(getFieldImage(result))}')">${nodes}</div>
      </div>`;
  }

  function getDashboardRoundId() {
    const root = getRootState();
    if (root.currentRoundId) return root.currentRoundId;
    const open = Object.values(root.votingConfigs || {}).find((cfg) => cfg.status === 'open');
    return open?.roundId || appState.data?.rounds?.[0]?.id || '';
  }

  function syncUniqueVoteChoices(form) {
    if (!form) return;
    const checkedValues = new Set(
      [...form.querySelectorAll('input[type="radio"]:checked')]
        .map((input) => input.value)
        .filter(Boolean)
    );

    form.querySelectorAll('input[type="radio"]').forEach((input) => {
      const baseDisabled = input.dataset.baseDisabled === 'true';
      const shouldDisable = checkedValues.has(input.value) && !input.checked;
      input.disabled = baseDisabled || shouldDisable;
      input.closest('.vote-option')?.classList.toggle('is-disabled', shouldDisable);
    });
  }

  function setDashboardTorView(view = 'selection') {
    const safeView = view === 'vote' ? 'vote' : 'selection';
    document.querySelectorAll('[data-tor-view]').forEach((button) => {
      button.classList.toggle('active', button.dataset.torView === safeView);
    });
    document.querySelectorAll('[data-tor-pane]').forEach((pane) => {
      const isActive = pane.dataset.torPane === safeView;
      pane.classList.toggle('hidden', !isActive);
      pane.classList.toggle('is-active', isActive);
    });
  }

  function bindDashboardToggle() {
    document.querySelectorAll('[data-tor-view]').forEach((button) => {
      if (button.dataset.torBound === 'true') return;
      button.dataset.torBound = 'true';
      button.addEventListener('click', () => setDashboardTorView(button.dataset.torView));
    });
    setDashboardTorView('selection');
  }

  function buildVoteSlotDefinitions(config) {
    const rows = getPitchRows(config);

    return rows.flatMap((row) => {
      const count = row.type === 'goleiro' ? 1 : Math.max(Number(row.count || 0), 0);
      if (!count) return [];

      return Array.from({ length: count }, (_, index) => {
        const left = count === 1 ? 50 : 18 + ((64 / (count - 1)) * index);
        const slotIndex = index + 1;
        return {
          key: `${row.type}_${slotIndex}`,
          type: row.type,
          position: row.type,
          slotIndex,
          left,
          top: row.top,
          label: row.type === 'goleiro' ? 'Goleiro' : `${positionLabelLocal(row.type)} ${slotIndex}`,
          help: typeHelpText(row.type)
        };
      });
    });
  }

  function ensureVoteDraft(roundId, config) {
    const slots = buildVoteSlotDefinitions(config);
    const current = voteDraftState[roundId] || {};
    const normalized = {};
    slots.forEach((slot) => {
      normalized[slot.key] = current[slot.key] || '';
    });
    voteDraftState[roundId] = normalized;
    return normalized;
  }

  function clearVoteDraft(roundId, config) {
    voteDraftState[roundId] = {};
    return ensureVoteDraft(roundId, config);
  }

  function getSelectedPlayerIds(draft = {}, ignoreSlotKey = '') {
    return new Set(
      Object.entries(draft)
        .filter(([slotKey, playerId]) => slotKey !== ignoreSlotKey && playerId)
        .map(([, playerId]) => playerId)
    );
  }

  function getCandidatesForSlot(config, slotKey, draft = {}) {
    const type = positionToType(String(slotKey || '').split('_')[0] || '');
    const selectedIds = getSelectedPlayerIds(draft, slotKey);
    return (config?.candidates || [])
      .filter((candidate) => {
        const player = byId(appState.data.players || [], candidate.playerId);
        return candidate.active !== false && getCandidateType(candidate, player) === type;
      })
      .map((candidate) => {
        const player = byId(appState.data.players || [], candidate.playerId);
        const team = byId(appState.data.teams || [], candidate.teamId || player?.teamId || '');
        return {
          ...candidate,
          disputedType: getCandidateType(candidate, player),
          player,
          team,
          isTaken: selectedIds.has(candidate.playerId)
        };
      })
      .filter((candidate) => candidate.player && (!candidate.isTaken || draft?.[slotKey] === candidate.playerId))
      .sort((a, b) => (a.player?.name || '').localeCompare(b.player?.name || '', 'pt-BR'));
  }

  function renderInteractiveVotePitch(roundId, config, draft, disabled = false) {
    const slots = buildVoteSlotDefinitions(config);
    return `
      <div class="team-of-round-pitch-frame vote-pitch-frame">
        <div class="team-of-round-pitch team-of-round-vote-pitch" style="background-image:url('${escapeHtml(getFieldImage(config))}')">
          ${slots.map((slot) => {
            const player = byId(appState.data.players || [], draft?.[slot.key] || '');
            const team = byId(appState.data.teams || [], player?.teamId || '');
            const isFilled = Boolean(player);
            return `
              <button
                type="button"
                class="team-of-round-vote-node ${slot.position === 'goleiro' ? 'is-goalkeeper' : ''} ${isFilled ? 'is-filled' : 'is-empty'}"
                style="left:${slot.left}%; top:${slot.top}%"
                data-open-vote-slot="${slot.key}"
                ${disabled ? 'disabled' : ''}
              >
                <span class="team-of-round-vote-node-kicker">${escapeHtml(slot.label)}</span>
                <div class="team-of-round-vote-node-card">
                  <div class="team-of-round-vote-node-figure">
                    ${isFilled ? `<img class="team-of-round-vote-node-photo" src="${escapeHtml(getPlayerPhoto(player))}" alt="${escapeHtml(player.name)}">` : '<span class="team-of-round-vote-node-plus">+</span>'}
                  </div>
                  <div class="team-of-round-vote-node-copy">
                    <strong>${escapeHtml(player?.name || 'Selecionar jogador')}</strong>
                    <small>${escapeHtml(team?.name || (disabled ? 'Votação indisponível' : 'Toque para votar'))}</small>
                  </div>
                  <span class="team-of-round-vote-node-action">${isFilled ? 'Alterar' : 'Votar'}</span>
                </div>
              </button>`;
          }).join('')}
        </div>
      </div>`;
  }


  function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getOrCreateVoteModalRoot() {
    let root = document.querySelector('[data-global-vote-overlay]');
    if (!root) {
      root = document.createElement('div');
      root.setAttribute('data-global-vote-overlay', '');
      root.className = 'vote-modal-overlay hidden';
      document.body.appendChild(root);
    }
    return root;
  }

  function getVoteModalScrollableElement() {
    return getOrCreateVoteModalRoot()?.querySelector('.vote-modal-list') || null;
  }

  function routeVoteModalScroll(container, deltaY) {
    const list = getVoteModalScrollableElement();
    if (!list) return false;

    const maxScrollTop = Math.max(0, list.scrollHeight - list.clientHeight);
    if (maxScrollTop <= 0) return false;

    const nextScrollTop = clampValue(list.scrollTop + deltaY, 0, maxScrollTop);
    if (nextScrollTop === list.scrollTop) return false;

    list.scrollTop = nextScrollTop;
    return true;
  }

  function getVoteModalAnchorTop(triggerElement) {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!viewportHeight) return 24;

    const shell = document.querySelector('.vote-modal-shell');
    const estimatedHeight = shell?.getBoundingClientRect?.().height || Math.min(560, viewportHeight - 48);
    const centeredTop = Math.round(Math.max(16, (viewportHeight - estimatedHeight) / 2));
    return centeredTop;
  }

  function lockVoteModalBodyScroll() {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function unlockVoteModalBodyScroll() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }


  function renderVoteModalContent(roundId, config, draft) {
    const slotKey = voteModalState.slotKey;
    if (!slotKey || voteModalState.roundId !== roundId) return '';

    const slots = buildVoteSlotDefinitions(config);
    const slot = slots.find((item) => item.key === slotKey);
    const candidates = getCandidatesForSlot(config, slotKey, draft);
    const selectedCandidateId = voteModalState.candidateId || draft?.[slotKey] || '';

    return `
      <div class="vote-modal-shell" role="dialog" aria-modal="true" aria-labelledby="vote-modal-title">
        <div class="vote-modal-head">
          <div>
            <span class="kicker">Escolher jogador</span>
            <h3 id="vote-modal-title">${escapeHtml(slot?.label || 'Vaga')}</h3>
            <p>${escapeHtml(slot?.help || 'Selecione um jogador.')}</p>
          </div>
          <button type="button" class="btn btn-soft btn-sm" data-close-vote-modal>Fechar</button>
        </div>

        <div class="vote-modal-list">
          ${candidates.length ? candidates.map((candidate) => {
            const player = candidate.player;
            const team = candidate.team;
            const isSelected = selectedCandidateId === candidate.playerId;
            return `
              <label class="vote-player-option ${isSelected ? 'is-selected' : ''}" data-vote-candidate="${candidate.playerId}">
                <input type="checkbox" ${isSelected ? 'checked' : ''}>
                <img class="vote-player-option-photo" src="${escapeHtml(getPlayerPhoto(player))}" alt="${escapeHtml(player?.name || 'Jogador')}">
                <span class="vote-player-option-copy">
                  <strong>${escapeHtml(player?.name || 'Jogador')}</strong>
                  <small>${escapeHtml(team?.name || 'Sem time')}</small>
                </span>
              </label>`;
          }).join('') : '<div class="empty">Nenhum jogador disponível para essa vaga no momento.</div>'}
        </div>

        <div class="vote-modal-actions">
          <button type="button" class="btn btn-soft" data-close-vote-modal>Cancelar</button>
          ${draft?.[slotKey] ? '<button type="button" class="btn btn-soft" data-clear-vote-slot>Limpar vaga</button>' : ''}
          <button type="button" class="btn btn-primary" data-confirm-vote-slot ${selectedCandidateId ? '' : 'disabled'}>Confirmar jogador</button>
        </div>
      </div>`;
  }

  function closeVoteModal() {
  const overlay = getOrCreateVoteModalRoot();
  voteModalState = { roundId: '', slotKey: '', candidateId: '', anchorTop: 24 };
  overlay.classList.add('hidden');
  overlay.style.removeProperty('--vote-modal-offset-top');
  overlay.innerHTML = '';
  unlockVoteModalBodyScroll();
}

function openVoteModal(container, roundId, config, draft, slotKey, triggerElement = null) {
  const overlay = getOrCreateVoteModalRoot();
  voteModalState = {
    roundId,
    slotKey,
    candidateId: draft?.[slotKey] || '',
    anchorTop: getVoteModalAnchorTop(triggerElement)
  };
  overlay.innerHTML = renderVoteModalContent(roundId, config, draft);
  overlay.style.setProperty('--vote-modal-offset-top', `${voteModalState.anchorTop}px`);
  overlay.classList.remove('hidden');
  lockVoteModalBodyScroll();
  const scrollableList = getVoteModalScrollableElement();
  if (scrollableList) scrollableList.scrollTop = 0;
}

  function updateVoteModalSelection() {
    const overlay = getOrCreateVoteModalRoot();
    overlay.querySelectorAll('[data-vote-candidate]').forEach((option) => {
      const input = option.querySelector('input[type="checkbox"]');
      const isSelected = option.dataset.voteCandidate === voteModalState.candidateId;
      option.classList.toggle('is-selected', isSelected);
      if (input) input.checked = isSelected;
    });
    const confirmButton = overlay.querySelector('[data-confirm-vote-slot]');
    if (confirmButton) confirmButton.disabled = !voteModalState.candidateId;
  }

  function bindDashboardVoteFlow(container, roundId, config, draft, disabled) {
    const voteForm = container?.querySelector('#team-of-round-vote-form');
    if (!voteForm) return;

    voteForm.addEventListener('keydown', (event) => {
      const overlay = getOrCreateVoteModalRoot();
      if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
        closeVoteModal();
      }
    });

    voteForm.addEventListener('click', (event) => {
      const slotButton = event.target.closest('[data-open-vote-slot]');
      if (slotButton) {
        event.preventDefault();
        if (disabled) return;
        openVoteModal(container, roundId, config, draft, slotButton.dataset.openVoteSlot, slotButton);
        return;
      }

      if (event.target.closest('[data-clear-vote-draft]')) {
        event.preventDefault();
        clearVoteDraft(roundId, config);
        closeVoteModal();
        renderDashboardVote();
      }
    });

    const globalOverlay = getOrCreateVoteModalRoot();

    globalOverlay.onclick = (event) => {
      if (event.target === globalOverlay || event.target.closest('[data-close-vote-modal]')) {
        event.preventDefault();
        closeVoteModal();
        return;
      }

      const option = event.target.closest('[data-vote-candidate]');
      if (option) {
        event.preventDefault();
        voteModalState.candidateId = option.dataset.voteCandidate || '';
        updateVoteModalSelection();
        return;
      }

      if (event.target.closest('[data-clear-vote-slot]')) {
        event.preventDefault();
        if (voteModalState.slotKey) draft[voteModalState.slotKey] = '';
        closeVoteModal();
        renderDashboardVote();
        return;
      }

      if (event.target.closest('[data-confirm-vote-slot]')) {
        event.preventDefault();
        if (!voteModalState.slotKey || !voteModalState.candidateId) return;
        draft[voteModalState.slotKey] = voteModalState.candidateId;
        closeVoteModal();
        renderDashboardVote();
      }
    };

    globalOverlay.onchange = (event) => {
      const input = event.target.closest('.vote-player-option input[type="checkbox"]');
      if (!input) return;

      const option = input.closest('[data-vote-candidate]');
      if (!option) return;

      voteModalState.candidateId = input.checked ? option.dataset.voteCandidate || '' : '';
      updateVoteModalSelection();
    };

    voteForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (disabled) return;

      const slots = buildVoteSlotDefinitions(config);
      const isComplete = slots.every((slot) => draft?.[slot.key]);
      if (!isComplete) return;

      const button = event.currentTarget.querySelector('button[type="submit"]');
      const status = event.currentTarget.querySelector('[data-vote-status]');
      if (button) {
        button.disabled = true;
        button.textContent = 'Enviando voto...';
      }

      try {
        await saveVote(roundId, draft);
        clearVoteDraft(roundId, config);
        closeVoteModal();
        if (status) status.textContent = 'Voto salvo com sucesso.';
        renderDashboardVote();
        return;
      } catch (error) {
        console.error(error);
        if (status) status.textContent = 'Não foi possível enviar agora. Tente novamente.';
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = 'Enviar voto';
        }
      }
    });
  }

  async function renderDashboardVote() {
    const container = document.getElementById('dashboard-team-of-round-vote');
    if (!container) return;

    const roundId = getDashboardRoundId();
    if (!roundId) {
      container.innerHTML = '<div class="empty">Nenhuma rodada disponível para votação.</div>';
      return;
    }

    await finalizeIfNeeded(roundId);
    const config = getConfig(roundId);
    const round = getRoundById(roundId);
    const root = getRootState();
    const result = root.results?.[roundId];

    if (config.status === 'closed' && result) {
      container.innerHTML = `<div class="vote-grid"><div class="vote-card"><strong>${escapeHtml(round?.title || 'Rodada')}</strong><div class="vote-meta"><span>Votação encerrada</span><span>${result.totalVotes || 0} voto(s)</span></div>${renderPitchFromResult(result)}</div></div>`;
      return;
    }

    const now = Date.now();
    const startsAt = config.votingStartsAt ? new Date(config.votingStartsAt).getTime() : 0;
    const endsAt = config.votingEndsAt ? new Date(config.votingEndsAt).getTime() : 0;
    const countdown = endsAt ? Math.max(0, endsAt - now) : 0;
    const hours = Math.floor(countdown / 3600000);
    const minutes = Math.floor((countdown % 3600000) / 60000);
    const disabled = config.status !== 'open' || (startsAt && now < startsAt) || (endsAt && now > endsAt);
    const slots = buildVoteSlotDefinitions(config);
    const draft = ensureVoteDraft(roundId, config);
    const filledCount = slots.filter((slot) => draft?.[slot.key]).length;
    const isComplete = slots.length > 0 && filledCount === slots.length;

    container.innerHTML = `
      <form id="team-of-round-vote-form" class="vote-builder-shell">
        <div class="vote-builder-card">
          <div class="vote-builder-head">
            <div>
              <span class="kicker">Monte sua escalação</span>
              <h3>${escapeHtml(round?.title || 'Rodada')}</h3>
              <p>Toque em cada posição para abrir o modal de escolha e montar a seleção completa antes do envio.</p>
            </div>
            <div class="vote-builder-meta">
              <span class="vote-builder-chip">Formação ${escapeHtml(config.formation)}</span>
              <span class="vote-builder-chip">${escapeHtml(config.status === 'open' ? 'Votação aberta' : 'Aguardando abertura')}</span>
              <span class="vote-builder-chip">${endsAt ? `Encerra em ${hours}h ${minutes}min` : 'Sem prazo definido'}</span>
            </div>
          </div>

          ${renderInteractiveVotePitch(roundId, config, draft, disabled)}

          <div class="vote-builder-footer">
            <div class="vote-builder-progress">
              <strong>${filledCount}/${slots.length}</strong>
              <span>${isComplete ? 'Escalação completa. Revise e envie seu voto.' : 'Preencha todas as posições para liberar o envio final.'}</span>
            </div>
            <div class="inline-actions vote-builder-actions">
              <button type="button" class="btn btn-soft" data-clear-vote-draft ${filledCount ? '' : 'disabled'}>Limpar escalação</button>
              <button class="btn btn-primary" type="submit" ${disabled || !isComplete ? 'disabled' : ''}>Enviar voto</button>
            </div>
          </div>
          <div class="vote-builder-status" data-vote-status></div>
        </div>
      </form>`;

    bindDashboardVoteFlow(container, roundId, config, draft, disabled);
  }

  function renderDashboardSelection() {
    const container = document.getElementById('dashboard-team-of-round');
    if (!container) return;
    const roundId = getDashboardRoundId();
    const result = getRootState().results?.[roundId];
    if (!result) {
      container.innerHTML = '<div class="empty">A seleção final aparecerá aqui depois da apuração. Use a aba “Votação” para abrir a votação quando ela estiver disponível.</div>';
      return;
    }

    container.innerHTML = `<div class="team-of-round-surface"><div class="team-of-round-toolbar"><div class="team-of-round-pills"><div class="team-of-round-pill"><span>Formação</span><strong>${escapeHtml(result.formation)}</strong></div><div class="team-of-round-pill"><span>Votos</span><strong>${result.totalVotes || 0}</strong></div></div></div>${renderPitchFromResult(result)}</div>`;
  }

  function getAdminFormOverrides() {
    const roundId = document.getElementById('team-of-round-round')?.value || getRootState().currentRoundId || appState.data?.rounds?.[0]?.id || '';
    if (!roundId) return null;
    const current = getConfig(roundId);
    const formation = document.getElementById('team-of-round-formation')?.value || current.formation;
    return {
      roundId,
      status: document.getElementById('team-of-round-enabled')?.value || current.status,
      formation,
      votingStartsAt: document.getElementById('team-of-round-voting-start')?.value ? new Date(document.getElementById('team-of-round-voting-start').value).toISOString() : '',
      votingEndsAt: document.getElementById('team-of-round-voting-end')?.value ? new Date(document.getElementById('team-of-round-voting-end').value).toISOString() : '',
      fieldImage: current.fieldImage || '',
      positions: normalizeFormationPositions(formation),
      candidates: document.querySelector('[data-candidate-active]') ? serializeCandidates(roundId) : current.candidates
    };
  }

  function renderAdminPanel(overrides = null) {
    const form = document.getElementById('team-of-round-form');
    const preview = document.getElementById('team-of-round-admin-preview');
    if (!form || !preview) return;

    const root = getRootState();
    const roundId = overrides?.roundId || document.getElementById('team-of-round-round')?.value || root.currentRoundId || appState.data.rounds?.[0]?.id || '';
    const config = { ...getConfig(roundId), ...(overrides || {}) };
    const result = root.results?.[roundId];

    const roundSelect = document.getElementById('team-of-round-round');
    if (roundSelect) roundSelect.innerHTML = getRoundOptions(roundId);

    const statusField = document.getElementById('team-of-round-enabled');
    if (statusField) statusField.value = config.status || 'draft';

    const formationField = document.getElementById('team-of-round-formation');
    if (formationField) formationField.value = config.formation;

    const formationLabel = document.getElementById('team-of-round-formation-label');
    if (formationLabel) formationLabel.textContent = config.formation || '2-3-1';

    const startField = document.getElementById('team-of-round-voting-start');
    if (startField) startField.value = formatDateTimeLocal(config.votingStartsAt);

    const endField = document.getElementById('team-of-round-voting-end');
    if (endField) endField.value = formatDateTimeLocal(config.votingEndsAt);

    document.getElementById('team-of-round-slot-groups').innerHTML = candidateMarkup(roundId, config);
    document.getElementById('team-of-round-vote-summary').innerHTML = `<strong>Resumo</strong><div class="muted">Rodada: ${escapeHtml(getRoundById(roundId)?.title || '—')} • Formação: ${escapeHtml(config.formation)} • Status: ${escapeHtml(config.status || 'draft')}</div>`;
    preview.innerHTML = result ? renderPitchFromResult(result) : '<div class="empty">Sem resultado apurado para esta rodada.</div>';
  }

  async function handleSave(event) {
    event.preventDefault();
    const root = getRootState();
    const roundId = document.getElementById('team-of-round-round').value;
    if (!roundId) {
      showAdminMessage('Selecione a rodada da votação.', 'error');
      return;
    }

    const current = getConfig(roundId);
    const file = document.getElementById('team-of-round-field-image')?.files?.[0];
    const removeFieldImage = document.getElementById('team-of-round-remove-field-image')?.value === 'true';

    const next = {
      ...current,
      roundId,
      status: document.getElementById('team-of-round-enabled').value,
      formation: document.getElementById('team-of-round-formation').value,
      votingStartsAt: document.getElementById('team-of-round-voting-start').value ? new Date(document.getElementById('team-of-round-voting-start').value).toISOString() : '',
      votingEndsAt: document.getElementById('team-of-round-voting-end').value ? new Date(document.getElementById('team-of-round-voting-end').value).toISOString() : '',
      fieldImage: removeFieldImage ? '' : (file ? await uploadImage(file, 'team-of-round-field') : current.fieldImage),
      positions: normalizeFormationPositions(document.getElementById('team-of-round-formation').value),
      candidates: serializeCandidates(roundId),
      updatedAt: new Date().toISOString()
    };

    root.votingConfigs = { ...(root.votingConfigs || {}), [roundId]: next };
    root.currentRoundId = roundId;
    await saveRootState(root);
    showAdminMessage('Configuração da votação salva.', 'success');
    rerenderAll();
  }

  async function handleResetSelection() {
    const roundId = document.getElementById('team-of-round-round').value;
    if (!roundId || !window.confirm('Zerar a configuração desta rodada?')) return;
    const root = getRootState();
    delete root.votingConfigs[roundId];
    delete root.results[roundId];
    await saveRootState(root);
    showAdminMessage('Configuração removida.', 'success');
    rerenderAll();
  }

  function handleRestoreFieldImage() {
    const removeFieldInput = document.getElementById('team-of-round-remove-field-image');
    const fieldInput = document.getElementById('team-of-round-field-image');
    if (removeFieldInput) removeFieldInput.value = 'true';
    if (fieldInput) fieldInput.value = '';
    showAdminMessage('Campo padrão selecionado. Salve para aplicar a restauração.', 'success');
  }

  function updatePreviewFromForm() {
    const overrides = getAdminFormOverrides();
    if (overrides) renderAdminPanel(overrides);
  }

  function bindAdminEnhancements() {
    if (adminBindingsReady || appState.page !== 'admin') return;
    adminBindingsReady = true;

    const form = document.getElementById('team-of-round-form');
    form?.addEventListener('submit', handleSave);
    document.getElementById('team-of-round-round')?.addEventListener('change', () => renderAdminPanel());
    document.getElementById('team-of-round-formation')?.addEventListener('change', updatePreviewFromForm);
    document.getElementById('team-of-round-enabled')?.addEventListener('change', updatePreviewFromForm);
    document.getElementById('team-of-round-voting-start')?.addEventListener('change', updatePreviewFromForm);
    document.getElementById('team-of-round-voting-end')?.addEventListener('change', updatePreviewFromForm);
    document.getElementById('team-of-round-reset')?.addEventListener('click', handleResetSelection);
    document.getElementById('team-of-round-restore-field')?.addEventListener('click', handleRestoreFieldImage);
    document.getElementById('team-of-round-finalize')?.addEventListener('click', async () => {
      const roundId = document.getElementById('team-of-round-round').value;
      if (roundId) await finalizeRound(roundId);
    });
  }

  function patchLifecycle() {
    const originalPopulatePublicPages = populatePublicPages;
    populatePublicPages = function patchedPopulatePublicPages() {
      originalPopulatePublicPages();
      renderDashboardSelection();
      renderDashboardVote();
      bindDashboardToggle();
    };

    const originalRefreshAdmin = refreshAdmin;
    refreshAdmin = function patchedRefreshAdmin() {
      originalRefreshAdmin();
      renderAdminPanel();
    };

    const originalBindAdminEvents = bindAdminEvents;
    bindAdminEvents = function patchedBindAdminEvents() {
      originalBindAdminEvents();
      bindAdminEnhancements();
    };
  }

  patchLifecycle();
  bindAdminEnhancements();
})();