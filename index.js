const pokedexContainer = document.getElementById('pokedex-container');
const pokemonIdEl = document.getElementById('pokemon-id');
const pokemonNameEl = document.getElementById('pokemon-name');
const pokemonHeightEl = document.getElementById('pokemon-height');
const pokemonWeightEl = document.getElementById('pokemon-weight');
const pokemonTypesEl = document.getElementById('pokemon-types');
const japaneseNameEl = document.getElementById('japanese-name');
const topNavEl = document.getElementById('top-nav');
const bgmAudio = document.getElementById('bgm-audio');
const muteButton = document.getElementById('mute-button');
const clickAudio = document.getElementById('click-audio');
const bodyEl = document.querySelector('body');

const upArrow = document.getElementById('up-arrow');
const downArrow = document.getElementById('down-arrow');
const numberListEl = document.getElementById('pokemon-number-list');
const searchForm = document.getElementById('search-form');
const nameInput = document.getElementById('name-input');
const teamBuilderButton = document.querySelector('.btn-team-builder');

const teamBuilderView = document.getElementById('team-builder-view');
const loaderOverlay = document.getElementById('loader-overlay');

// Custom Alert Elements
const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');

let isInitialLoad = true;
let currentPokemonId = 1;
let isAnimating = false;
let team = [];
let currentPokemonData = null;
const MAX_POKEMON = 1025;
const typeColors = { grass: '#78C850', fire: '#F08030', water: '#6890F0', electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0', ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820', rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC', normal: '#A8A878' };
const POKEMON_TYPE_ICONS = { normal: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/normal.svg', fire: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/fire.svg', water: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/water.svg', electric: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/electric.svg', grass: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/grass.svg', ice: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/ice.svg', fighting: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/fighting.svg', poison: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/poison.svg', ground: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/ground.svg', flying: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/flying.svg', psychic: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/psychic.svg', bug: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/bug.svg', rock: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/rock.svg', ghost: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/ghost.svg', dragon: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/dragon.svg', dark: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/dark.svg', steel: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/steel.svg', fairy: 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/fairy.svg' };
const bgmTracks = [ 'music/pokemonlofi.mp3' ];

// --- Custom Alert Logic ---
const showAlert = (message) => {
    customAlertMessage.textContent = message;
    customAlertOverlay.classList.add('active');
};

customAlertOkBtn.addEventListener('click', () => {
    customAlertOverlay.classList.remove('active');
    playClickSound();
});


function getBestSpriteUrl(pData) {
    const sprites = pData.sprites;
    const name = pData.name;
    const sources = [
        sprites.versions['generation-v']['black-white'].animated.front_default,
        `https://play.pokemonshowdown.com/sprites/gen5ani/${name}.gif`,
        sprites.front_default,
        sprites.other.home.front_default,
        sprites.other['official-artwork'].front_default,
        sprites.other.showdown.front_default,
    ];
    return sources.find(source => source);
}

const playClickSound = () => {
    clickAudio.currentTime = 0;
    clickAudio.volume = 0.5;
    clickAudio.play().catch(e => {});
}

const fetchPokemonData = async (identifier, direction = 'next', useAnimation = true) => {
    if (isAnimating || (!isInitialLoad && currentPokemonId == identifier)) return;

    if (isInitialLoad) {
        try {
            const [pokemonRes, speciesRes] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`),
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${identifier}`)
            ]);
            if (!pokemonRes.ok || !speciesRes.ok) throw new Error('Pokémon not found.');
            const pokemonData = await pokemonRes.json();
            const speciesData = await speciesRes.json();
            currentPokemonData = pokemonData;
            
            updateUI(pokemonData, speciesData, document.getElementById('pokemon-sprite'));

            document.getElementById('pokemon-sprite').onload = () => {
                 bodyEl.classList.add('app-ready');
                 isInitialLoad = false;
            };
            document.getElementById('pokemon-sprite').onerror = () => {
                bodyEl.classList.add('app-ready');
                isInitialLoad = false;
            }
        } catch (error) {
            showAlert(error.message);
        }
        return;
    }
    
    isAnimating = true;

    try {
        const [pokemonRes, speciesRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${identifier}`)
        ]);
        if (!pokemonRes.ok || !speciesRes.ok) throw new Error('Pokémon not found.');
        const pokemonData = await pokemonRes.json();
        const speciesData = await speciesRes.json();
        currentPokemonData = pokemonData;
        
        let currentSprite = document.getElementById('pokemon-sprite');
        let nextSprite = document.getElementById('pokemon-sprite-next');
        
        nextSprite.src = getBestSpriteUrl(pokemonData);

        nextSprite.onload = () => {
            const allSpriteClasses = ['anim-sprite-in-left', 'anim-sprite-out-right', 'anim-sprite-in-right', 'anim-sprite-out-left'];
            const allInfoClasses = ['anim-info-in-left', 'anim-info-out-right', 'anim-info-in-right', 'anim-info-out-left'];
            const allTextClasses = ['anim-text-in-left', 'anim-text-out-right', 'anim-text-in-right', 'anim-text-out-left'];
            
            let spriteOutClass, spriteInClass, textOutClass, textInClass, infoOutClass, infoInClass;
            
            if (direction === 'next') {
                spriteOutClass = 'anim-sprite-out-right'; spriteInClass = 'anim-sprite-in-left';
                textOutClass = 'anim-text-out-right'; textInClass = 'anim-text-in-left';
                infoOutClass = 'anim-info-out-right'; infoInClass = 'anim-info-in-left';
            } else { 
                spriteOutClass = 'anim-sprite-out-left'; spriteInClass = 'anim-sprite-in-right';
                textOutClass = 'anim-text-out-left'; textInClass = 'anim-text-in-right';
                infoOutClass = 'anim-info-out-left'; infoInClass = 'anim-info-in-right';
            }
            
            const infoPanel = document.querySelector('.info-panel');
            const textElements = [japaneseNameEl];
            
            infoPanel.classList.add(infoOutClass);
            textElements.forEach(el => el.classList.add(textOutClass));
            currentSprite.classList.add(spriteOutClass);
            nextSprite.classList.add(spriteInClass);

            setTimeout(() => {
                updateUI(pokemonData, speciesData);
                
                infoPanel.classList.remove(infoOutClass); infoPanel.classList.add(infoInClass);
                textElements.forEach(el => { el.classList.remove(textOutClass); el.classList.add(textInClass); });

                currentSprite.id = 'pokemon-sprite-next'; nextSprite.id = 'pokemon-sprite';
                currentSprite.classList.remove(...allSpriteClasses);
                nextSprite.classList.remove(...allSpriteClasses);
                
                setTimeout(() => {
                    infoPanel.classList.remove(infoInClass);
                    textElements.forEach(el => el.classList.remove(textInClass));
                    isAnimating = false;
                }, 250);

            }, 250);
        };
        nextSprite.onerror = () => { isAnimating = false; showAlert('Error loading sprite.'); };
    } catch (error) {
        showAlert(error.message);
        isAnimating = false;
    }
};

const updateUI = (pData, sData, spriteEl = null) => {
    currentPokemonId = pData.id;
    const primaryTypeName = pData.types[0].type.name;
    const primaryTypeColor = typeColors[primaryTypeName] || '#A8A878';
    
    pokedexContainer.style.setProperty('--bg-color', primaryTypeColor);
    
    pokemonIdEl.textContent = `#${String(pData.id).padStart(3, '0')}`;
    pokemonNameEl.textContent = pData.name;
    
    if (spriteEl) { spriteEl.src = getBestSpriteUrl(pData); }
    
    const japaneseNameObj = sData.names.find(name => name.language.name === 'ja-Hrkt');
    japaneseNameEl.textContent = japaneseNameObj ? japaneseNameObj.name : '';
    const heightM = pData.height / 10;
    const totalInches = heightM * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    pokemonHeightEl.textContent = `${heightM}m ( ${feet}' ${inches}" )`;
    const weightKg = pData.weight / 10;
    const weightLbs = (weightKg * 2.20462).toFixed(1);
    pokemonWeightEl.textContent = `${weightKg}kg ( ${weightLbs} lbs. )`;

    pokemonTypesEl.innerHTML = '';
    pData.types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        const tag = document.createElement('span');
        tag.className = 'tag type-tag';
        const icon = document.createElement('img');
        icon.src = POKEMON_TYPE_ICONS[typeName];
        icon.alt = typeName;
        tag.appendChild(icon);
        tag.append(typeName);
        pokemonTypesEl.appendChild(tag);
    });

    if(!isInitialLoad && pData.cries && pData.cries.latest) {
        const cry = new Audio(pData.cries.latest);
        cry.volume = 0.3; 
        cry.play().catch(e => {});
    }
    updateActiveNumberInList(pData.id);
};

const populateNumberList = () => {
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= MAX_POKEMON; i++) {
        const li = document.createElement('li');
        li.className = 'number-item';
        li.textContent = i;
        li.dataset.id = i;
        li.addEventListener('click', () => {
            playClickSound();
            if (currentPokemonId !== i) {
                const direction = i > currentPokemonId ? 'next' : 'prev';
                fetchPokemonData(i, direction);
            }
        });
        fragment.appendChild(li);
    }
    numberListEl.appendChild(fragment);
};

const updateActiveNumberInList = (id) => {
    const currentActive = numberListEl.querySelector('.active');
    if (currentActive) currentActive.classList.remove('active');
    const newActive = numberListEl.querySelector(`.number-item[data-id="${id}"]`);
    if (newActive) {
        newActive.classList.add('active');
        newActive.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    updateTopNavActiveState(id);
};

const populateTopNav = () => {
    let navHTML = '<span class="top-nav-arrow" id="prev-range"><</span>';
    for (let i = 0; i < MAX_POKEMON; i += 100) {
        const rangeStart = i + 1;
        navHTML += `<span class="top-nav-range" data-range="${rangeStart}">${rangeStart}</span>`;
    }
    navHTML += '<span class="top-nav-arrow" id="next-range">></span>';
    topNavEl.innerHTML = navHTML;
};

const updateTopNavActiveState = (id) => {
    const currentActive = topNavEl.querySelector('.active');
    if (currentActive) currentActive.classList.remove('active');
    const rangeStart = Math.floor((id - 1) / 100) * 100 + 1;
    const newActive = topNavEl.querySelector(`.top-nav-range[data-range="${rangeStart}"]`);
    if (newActive) newActive.classList.add('active');
};

const setupAudio = () => {
    const randomIndex = Math.floor(Math.random() * bgmTracks.length);
    bgmAudio.src = bgmTracks[randomIndex];
    bgmAudio.volume = 0.2;
    bgmAudio.play().catch(e => console.error("Audio play failed:", e));
};

loaderOverlay.addEventListener('click', () => {
    setupAudio();
    populateTopNav();
    populateNumberList();
    fetchPokemonData(currentPokemonId);
}, { once: true });

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = nameInput.value.toLowerCase().trim();
    if (!searchTerm || isAnimating) return;
    playClickSound();
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
        if (!res.ok) throw new Error('Pokémon not found.');
        const data = await res.json();
        const newId = data.id;
        if (newId === currentPokemonId) return;
        const direction = newId > currentPokemonId ? 'next' : 'prev';
        fetchPokemonData(newId, direction, true);
        nameInput.value = '';
    } catch (error) {
        showAlert(error.message);
    }
});

upArrow.addEventListener('click', () => { 
    playClickSound();
    if (currentPokemonId > 1) fetchPokemonData(currentPokemonId - 1, 'prev'); 
});

downArrow.addEventListener('click', () => { 
    playClickSound();
    if (currentPokemonId < MAX_POKEMON) fetchPokemonData(currentPokemonId + 1, 'next'); 
});

topNavEl.addEventListener('click', (e) => {
    const target = e.target.closest('.top-nav-range, .top-nav-arrow');
    if (!target) return;
    playClickSound();
    let newId = currentPokemonId;
    if (target.matches('.top-nav-range')) {
        newId = parseInt(target.dataset.range, 10);
    } else if (target.id === 'prev-range') {
        newId = Math.max(1, currentPokemonId - 100);
    } else if (target.id === 'next-range') {
        newId = Math.min(MAX_POKEMON, currentPokemonId + 100);
    }
    if (newId !== currentPokemonId) {
        const direction = newId > currentPokemonId ? 'next' : 'prev';
        fetchPokemonData(newId, direction);
    }
});

muteButton.addEventListener('click', () => {
    playClickSound();
    bgmAudio.muted = !bgmAudio.muted;
    muteButton.innerHTML = bgmAudio.muted ? '<i class="fas fa-volume-off"></i>' : '<i class="fas fa-volume-up"></i>';
});


// --- Team Builder Logic ---
const addTeamButton = document.querySelector('.btn-add');
const teamSlotElements = document.querySelectorAll('.team-slot');

const updateTeamSlotsUI = () => {
    teamSlotElements.forEach((slot, index) => {
        slot.innerHTML = '';
        slot.classList.remove('occupied');
        const member = team[index];
        if (member) {
            slot.classList.add('occupied');
            const teamSprite = document.createElement('img');
            teamSprite.src = member.spriteUrl;
            teamSprite.className = 'team-slot-sprite';
            teamSprite.alt = member.name;
            slot.appendChild(teamSprite);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-team-member-btn';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                playClickSound();
                team.splice(index, 1);
                updateTeamSlotsUI();
            };
            slot.appendChild(removeBtn);
        }
    });
};

addTeamButton.addEventListener('click', () => {
    playClickSound();
    if (!currentPokemonData) return;
    if (team.length >= 6) { showAlert('Your team is already full!'); return; }
    const isAlreadyInTeam = team.some(member => member.id === currentPokemonData.id);
    if (isAlreadyInTeam) { showAlert(`${currentPokemonData.name} is already on your team.`); return; }
    team.push({
        id: currentPokemonData.id,
        name: currentPokemonData.name,
        spriteUrl: getBestSpriteUrl(currentPokemonData),
        types: currentPokemonData.types.map(t => t.type)
    });
    updateTeamSlotsUI();
});

teamBuilderButton.addEventListener('click', () => {
    playClickSound();
    pokedexContainer.classList.add('hidden');
    teamBuilderView.classList.add('active');
    displayTeam();
});

async function displayTeam() {
    teamBuilderView.innerHTML = ''; // Clear previous content
    
    // Create the main layout for the new design
    const layoutContainer = document.createElement('div');
    layoutContainer.className = 'team-builder-layout';
    layoutContainer.innerHTML = `
        <div class="team-builder-header">
            <button id="back-to-pokedex-btn" class="btn">← Back To Pokédex</button>
            <h1>Team Builder</h1>
        </div>
        <div id="team-roster-column" class="team-roster-column"></div>
        <div id="team-details-column" class="team-details-column"></div>
        <div id="team-weakness-column" class="team-weakness-column"></div>
    `;
    teamBuilderView.appendChild(layoutContainer);

    // Add back button functionality
    layoutContainer.querySelector('#back-to-pokedex-btn').addEventListener('click', () => {
        playClickSound();
        pokedexContainer.classList.remove('hidden');
        teamBuilderView.classList.remove('active');
        teamBuilderView.style.setProperty('--bg-color', '#F08030'); // Reset bg
    });
    
    const rosterCol = layoutContainer.querySelector('#team-roster-column');
    const detailsCol = layoutContainer.querySelector('#team-details-column');
    const weaknessCol = layoutContainer.querySelector('#team-weakness-column');

    if (team.length === 0) {
        detailsCol.innerHTML = '<p class="empty-team-message">Your team is empty. Go back and add some Pokémon!</p>';
        rosterCol.innerHTML = '<p class="empty-roster-message">No Pokémon</p>';
        return;
    }

    // Populate the roster column
    team.forEach((member, index) => {
        const rosterItem = document.createElement('div');
        rosterItem.className = 'roster-item';
        rosterItem.dataset.id = member.id;
        rosterItem.innerHTML = `
            <img src="${member.spriteUrl}" alt="${member.name}" class="roster-sprite">
            <span class="roster-name">${member.name}</span>
            <div class="roster-types">
                ${member.types.map(type => `<img src="${POKEMON_TYPE_ICONS[type.name]}" alt="${type.name}" class="roster-type-icon">`).join('')}
            </div>
        `;
        rosterItem.onclick = () => {
            playClickSound();
            document.querySelectorAll('.roster-item.active').forEach(el => el.classList.remove('active'));
            rosterItem.classList.add('active');
            createTeambuilderCard(member, detailsCol, weaknessCol);
        };
        rosterCol.appendChild(rosterItem);
    });

    // Automatically select and display the first Pokémon in the team
    if (rosterCol.querySelector('.roster-item')) {
        rosterCol.querySelector('.roster-item').click();
    }
}

async function createTeambuilderCard(member, detailsContainer, weaknessContainer) {
    detailsContainer.innerHTML = '<div class="loader">Loading...</div>';
    weaknessContainer.innerHTML = '<div class="loader">Loading...</div>';
    
    try {
        const pDataRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${member.id}`);
        if (!pDataRes.ok) throw new Error('Failed to fetch Pokémon data.');
        const pData = await pDataRes.json();

        // Update background color based on selected Pokémon
        const primaryTypeName = pData.types[0].type.name;
        const primaryTypeColor = typeColors[primaryTypeName] || '#A8A878';
        teamBuilderView.style.setProperty('--bg-color', primaryTypeColor);

        const moveFetchPromises = pData.moves.slice(0, 4).map(moveInfo =>
            fetch(moveInfo.move.url).then(res => res.json())
        );
        const moveDetailsList = await Promise.all(moveFetchPromises);

        // --- DETAILS COLUMN ---
        let detailsHTML = `
            <div class="details-identity">
                <img src="${getBestSpriteUrl(pData)}" alt="${pData.name}" class="details-sprite">
                <h2 class="details-name">${pData.name}</h2>
                <div class="tag-container">
                    ${pData.types.map(typeInfo => `
                        <span class="tag type-tag">
                            <img src="${POKEMON_TYPE_ICONS[typeInfo.type.name]}" alt="${typeInfo.type.name}">
                            ${typeInfo.type.name}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="details-stats">
                <h3>Base Statistics</h3>
                <div class="stats-grid">
                    ${pData.stats.map(stat => `
                        <span class="stat-label">${stat.stat.name.replace('special-','Sp. ').replace(/-/g,' ')}</span>
                        <div class="bar-container"><div class="stat-bar" style="width: ${Math.min(100, (stat.base_stat / 200) * 100)}%; background-color: ${getStatColor(stat.base_stat)};"></div></div>
                        <span class="stat-value">${stat.base_stat}</span>
                    `).join('')}
                </div>
            </div>
            <div class="details-moves">
                <h3>Sample Moveset</h3>
                <div class="moves-grid">
                    ${moveDetailsList.map(move => `
                        <div class="move-slot">
                            <span class="move-type" style="background-color:${typeColors[move.type.name] || '#A8A878'}">${move.type.name}</span>
                            <span class="move-name">${move.name.replace(/-/g, ' ')}</span>
                            <span class="move-power">Pow: ${move.power || '---'}</span>
                            <span class="move-accuracy">Acc: ${move.accuracy || '---'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        detailsContainer.innerHTML = detailsHTML;
        
        // --- WEAKNESS COLUMN ---
        const typeChart = await calculateTypeEffectiveness(pData.types.map(t => t.type.url));
        let weaknessHTML = `<h3>Type Matchups</h3><div class="types-grid">`;
        for (const typeName in typeChart) {
            const multiplier = typeChart[typeName];
            let effectClass = 'normal';
            if (multiplier > 1) effectClass = 'super';
            if (multiplier < 1) effectClass = 'resist';
            if (multiplier === 0) effectClass = 'immune';

            weaknessHTML += `
                <div class="type-cell ${effectClass}">
                    <div class="type-cell-tag" style="background-color: ${typeColors[typeName] || '#A8A878'}">${typeName}</div>
                    <span class="type-cell-multiplier">x${multiplier}</span>
                </div>`;
        }
        weaknessHTML += `</div>`;
        weaknessContainer.innerHTML = weaknessHTML;

    } catch (error) {
        showAlert(`Error: ${error.message}`);
        detailsContainer.innerHTML = `<p class="empty-team-message">Could not load Pokémon details.</p>`;
        weaknessContainer.innerHTML = '';
    }
}

const getStatColor = (value) => {
    if (value >= 150) return '#e52121'; 
    if (value >= 110) return '#ff7d2e'; 
    if (value >= 90) return '#ffdd57';  
    if (value >= 60) return '#a0e515';  
    return '#22b937';                  
};

async function calculateTypeEffectiveness(typeUrls) {
    const allTypes = Object.keys(typeColors);
    let effectiveness = {};
    allTypes.forEach(t => effectiveness[t] = 1);
    const typeResponses = await Promise.all(typeUrls.map(url => fetch(url).then(res => res.json())));
    for (const typeData of typeResponses) {
        typeData.damage_relations.double_damage_from.forEach(t => { if(effectiveness[t.name] !== undefined) effectiveness[t.name] *= 2 });
        typeData.damage_relations.half_damage_from.forEach(t => { if(effectiveness[t.name] !== undefined) effectiveness[t.name] *= 0.5 });
        typeData.damage_relations.no_damage_from.forEach(t => { if(effectiveness[t.name] !== undefined) effectiveness[t.name] *= 0 });
    }
    return effectiveness;
}