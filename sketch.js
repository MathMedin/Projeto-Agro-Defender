
    // Começo
    let gameState = {
        current: 'menu', 
        loadingStartTime: 0,
        loadingDuration: 4000,
        // Cutscene 1
        cutscenePhase: 0,
        cutsceneProgress: 0,
        cutsceneTextProgress: 0,
        cs_planet: {}, 
        cs_ship: {}, 
        cs_lightSpeed: 0,
        cs_milkyWayAlpha: 0,
        
        finalBossCutscenePhase: 0,
        finalBossCutsceneProgress: 0,
        finalWinCutscenePhase: 0,
        finalWinCutsceneProgress: 0,
        score: 0,
        level: 1,
        cameraShake: 0,
        cameraShakeDuration: 0,
        soundInitialized: false,
        introCutscenePlayed: false,
        finalBossIntroPlayed: false,
        screenDistortion: { amount: 0, duration: 0, time: 0, type: 'none' },
    };

    // as estrelas da cutscene
    let cutsceneStars = [];

    // Debug
    let debugMode = false;
    let debugKeyPressCount = 0;
    let lastDebugKeyPressTime = 0;

    // Opções de DEV
    let debugOptions = {
        infiniteLife: false,
        infiniteAmmo: false,
        showHitboxes: false,
        disableAI: false,
        noclip: false, // Permite atravessar cenário 
        godModeDamage: false, // Mata inimigos com um tiro
    };


    // Dados do Player
    let playerData = {
        totalScore: 0,
        equippedWeapon: 'default_weapon',
        unlockedWeapons: ['default_weapon'],
        equippedSkin: 'default_skin',
        unlockedSkins: ['default_skin'],
        upgrades: {
            maxHealth: 0,
            moveSpeed: 0,
            maxAmmo: 0,
        }
    };

    // Upgrades da Loja
    const UPGRADE_ITEMS = [
        { id: 'maxHealth', name: 'Vitalidade Aumentada', description: 'Aumenta a vida máxima do herói em 10%.', cost: 1200, maxLevel: 5, icon: '❤️' },
        { id: 'moveSpeed', name: 'Botas Velozes', description: 'Aumenta a velocidade de movimento em 5%.', cost: 800, maxLevel: 5, icon: '👟' },
        { id: 'maxAmmo', name: 'Mochila de Munição', description: 'Aumenta a munição máxima em 15%.', cost: 1000, maxLevel: 5, icon: '💣' },
    ];

    // Itens da Lojinha
    const SHOP_ITEMS = {
        weapons: [
            { id: 'default_weapon', name: 'Tiro Padrão', cost: 0, description: 'Disparo básico confiável.', purchased: true, type: 'weapon', icon: '🔫' },
            { id: 'ray_gun', name: 'Arma de Raio', cost: 1500, description: 'Raio de energia concentrado.', purchased: false, type: 'weapon', icon: '⚡' },
            { id: 'fire_thrower', name: 'Lança-Chamas', cost: 2500, description: 'Queima inimigos com fogo contínuo.', purchased: false, type: 'weapon', icon: '🔥' },
            { id: 'ice_beam', name: 'Feixe Congelante', cost: 2500, description: 'Congela e retarda inimigos.', purchased: false, type: 'weapon', icon: '❄️' },
            { id: 'grenade_launcher', name: 'Lança-Granadas', cost: 3500, description: 'Dispara granadas explosivas.', purchased: false, type: 'weapon', icon: '💣' }
        ],
        skins: [
            { id: 'default_skin', name: 'Agrinho Clássico', cost: 0, description: 'O visual padrão do herói.', purchased: true, type: 'skin', icon: '🧑‍🌾' },
            { id: 'farmer_skin', name: 'Fazendeiro Estiloso', cost: 1000, description: 'Chapéu de palha e suspensórios!', purchased: false, type: 'skin', icon: '🤠' },
            { id: 'vaqueiro_skin', name: 'Vaqueiro Valente', cost: 1200, description: 'Traje de couro e bota.', purchased: false, type: 'skin', icon: '🐄' },
            { id: 'astro_skin', name: 'Astro-Fazendeiro', cost: 2000, description: 'Pronto para cultivar em gravidade zero.', purchased: false, type: 'skin', icon: '🧑‍🚀' }
        ],
    };
    let shopScrollOffsetWeapons = 0;
    let shopScrollOffsetSkins = 0;
    let shopScrollOffsetUpgrades = 0;
    let currentShopTab = 'weapons'; // 
    const SHOP_ITEM_HEIGHT = 80; // 
    const SHOP_VISIBLE_ITEMS = 4;


    // Tipos de Boss
    const BOSS_TYPES = {
        1: {
            name: "Gosma Primordial", type: "default", color: () => color(80, 220, 80, 220),
            baseHealth: 150, healthMultiplier: 30, baseSize: 40, sizeMultiplier: 4, targetSizeBase: 100, targetSizeMultiplier: 8,
            shieldMaxHealthBase: 80, shieldMaxHealthMultiplier: 20, attackFunctions: ['defaultSlimeAttack', 'defaultSkyAttack'], abilities: [],
            description: "A gosma original, gosmenta e verde."
        },
        2: {
            name: "Gosma Vulcânica", type: "fire", color: () => color(255, 100, 0, 230),
            baseHealth: 220, healthMultiplier: 35, baseSize: 45, sizeMultiplier: 4.5, targetSizeBase: 110, targetSizeMultiplier: 8.5,
            shieldMaxHealthBase: 100, shieldMaxHealthMultiplier: 25, attackFunctions: ['fireSlimeAttack', 'meteorRainAttack'], abilities: ['fire_aura'],
            description: "Uma gosma incandescente que adora o calor!"
        },
        3: {
            name: "Gosma Elétrica", type: "electric", color: () => color(255, 255, 0, 230),
            baseHealth: 320, healthMultiplier: 45, baseSize: 48, sizeMultiplier: 5.2, targetSizeBase: 125, targetSizeMultiplier: 9.2,
            shieldMaxHealthBase: 130, shieldMaxHealthMultiplier: 32, attackFunctions: ['electricShockAttack', 'lightningCloudAttack', 'lightningStormAttack'], abilities: ['static_field', 'storm_caller'],
            description: "Carregada e perigosa, cuidado com os choques e raios!"
        },
        4: {
            name: "Gosma Tóxica", type: "toxic", color: () => color(150, 0, 150, 220),
            baseHealth: 350, healthMultiplier: 50, baseSize: 52, sizeMultiplier: 5.5, targetSizeBase: 130, targetSizeMultiplier: 9.5,
            shieldMaxHealthBase: 140, shieldMaxHealthMultiplier: 35, attackFunctions: ['toxicSpitAttack', 'poisonCloudAttack'], abilities: ['toxic_pool'],
            description: "Deixa um rastro venenoso por onde passa."
        },
        5: { 
            name: "Gosma Fantasma", type: "phantom", color: () => color(200, 200, 220, 180),
            baseHealth: 300, healthMultiplier: 48, baseSize: 45, sizeMultiplier: 5, targetSizeBase: 120, targetSizeMultiplier: 9,
            shieldMaxHealthBase: 110, shieldMaxHealthMultiplier: 28,
            attackFunctions: ['phantomDashAttack', 'fearInducingScream', 'cloneFantasmaAttack', 'drenarVidaAttack', 'projeteisEspectraisAttack'],
            abilities: ['invisibility_short'],
            description: "Espectral e evasiva, aparece e desaparece."
        },
        6: {
            name: "Gosma Cristalina", type: "crystal", color: () => color(0, 255, 255, 210),
            baseHealth: 380, healthMultiplier: 52, baseSize: 55, sizeMultiplier: 5.8, targetSizeBase: 135, targetSizeMultiplier: 9.8,
            shieldMaxHealthBase: 150, shieldMaxHealthMultiplier: 38, attackFunctions: ['crystalShardVolley', 'reflectiveShieldPulse'], abilities: ['shard_armor_passive'],
            description: "Reflete ataques e dispara lascas afiadas."
        },
        7: {
            name: "Nave Colossal 'Ceifadora'", type: "nave_colossal", isSlime: false,
            drawFunction: 'drawNaveColossal',
            color: () => color(100, 100, 120),
            baseHealth: 1000, healthMultiplier: 100, baseSize: 200, sizeMultiplier: 10,
            shieldMaxHealthBase: 300, shieldMaxHealthMultiplier: 50,
            attackFunctions: ['naveLaserAttack', 'naveMissileAttack', 'naveMinionSpawn'], abilities: ['reinforced_plating'],
            description: "Uma fortaleza voadora com um arsenal pesado."
        },
        8: {
            name: "Zy'Glar, o Devorador Cósmico", type: "intergalactic_slime", isSlime: true,
            color: () => color(random(50,150), random(0,50), random(100,200), 240),
            baseHealth: 2000, healthMultiplier: 150, baseSize: 100, sizeMultiplier: 10, targetSizeBase: 200, targetSizeMultiplier: 15,
            shieldMaxHealthBase: 500, shieldMaxHealthMultiplier: 80,
            attackFunctions: ['blackHoleAttack', 'galacticBlastAttack', 'realityWarpAttack', 'cosmicRayBarrageAttack', 'purpleEnergyVolleyAttack', 'spawnHelperShipsAttack'],
            abilities: ['cosmic_regeneration', 'gravity_aura_strong'],
            description: "Uma entidade que consome mundos. Distorce a realidade.",
        }
    };


    // Elementos do Jogo
    let hero, slime, crops = [], particles = [], rays = [], skyRays = [];
    let enemyShips = [], ammoPacks = [], powerUpItems = [], miniSlimes = [];
    let electricClouds = [];

    // Tempo
    let lastSlimeAttackTime = 0;
    let slimeAttackCooldown = 0;
    let lastMiniSlimeSpawn = 0;

    // Constantes
    const BOSS_LOW_HEALTH_THRESHOLD = 0.5;
    const MAX_ENEMY_SHIPS = 4;
    const MAX_MINI_SLIMES = 8;
    const MINI_SLIME_SPAWN_INTERVAL = 8000;
    const AMMO_PACK_VALUE = 8;
    const SILO_RELOAD_COOLDOWN = 15000;
    const HERO_MAX_AMMO_BASE = 20;
    const HERO_POWERUP_SHIELD_DURATION = 5000;
    const HERO_MANUAL_SHIELD_DURATION = 10000;
    const HERO_MANUAL_SHIELD_COOLDOWN = 25000;
    const POWERUP_DROP_CHANCE = 0.15;
    const FINAL_BOSS_LEVEL = 8;

    // Cenário
    let farmSilo = {};
    let barn = {};

    // Controles de Escudo
    let slimeShieldActivated75 = false;
    let slimeShieldActivated40 = false;


    // SISTEMA DE QUIZZ
    let quizState = {
        currentQuestion: 0,
        score: 0,
        showResult: false,
        questions: [
            {
                question: "Qual destes é um pilar da agricultura sustentável?",
                options: ["Uso intensivo de pesticidas", "Monocultura em larga escala", "Rotação de culturas", "Desmatamento para pasto"],
                answer: 2
            },
            {
                question: "O que é 'agricultura de precisão'?",
                options: ["Plantar sementes com as mãos", "Usar tecnologia para otimizar o plantio", "Colher apenas em dias de sol", "Plantar somente um tipo de grão"],
                answer: 1
            },
            {
                question: "Qual o principal benefício da irrigação por gotejamento?",
                options: ["Gasta mais água", "Economia de água", "Esfria as plantas", "Atrai mais insetos"],
                answer: 1
            },
            {
                question: "O que significa o termo 'orgânico' na agricultura?",
                options: ["Cultivo sem agrotóxicos sintéticos", "Plantado apenas por robôs", "Alimento que vem de outro país", "Produto geneticamente modificado"],
                answer: 0
            },
            {
                question: "Qual a importância das abelhas para o agronegócio?",
                options: ["Elas comem as pragas", "Produzem mel para os agricultores", "São essenciais para a polinização", "Não possuem importância"],
                answer: 2
            },
           {
                question: "O que é o 'plantio direto'?",
                options: ["Plantar sem arar o solo", "Plantar apenas durante o dia", "Plantar em linha reta", "Plantar usando um drone"],
                answer: 0
            },
            {
                question: "Qual destes é considerado um 'superalimento' do agro brasileiro?",
                options: ["Batata Frita", "Açaí", "Refrigerante", "Trigo"],
                answer: 1
            },
        ]
    };


    // Som com Pooling
    const soundManager = {
        sounds: {},
        registerSound(name, path, options = {}) {
            const poolSize = options.pool || 1;
            const soundPool = [];
            for (let i = 0; i < poolSize; i++) {
                soundPool.push(loadSound(path, null, (err) => {
                    console.error(`Erro ao carregar o som: ${name} (${path})`, err);
                }));
            }
            this.sounds[name] = {
                pool: soundPool,
                volume: options.volume || 0.5,
                rate: options.rate || 1,
                loop: options.loop || false,
                poolIndex: 0,
                poolSize: poolSize,
            };
        },

        playSound(name, volOverride, rateOverride) {
            if (!gameState.soundInitialized) return;

            const soundData = this.sounds[name];
            if (!soundData) {
                console.warn(`Sound not found: ${name}`);
                return;
            }

            if (soundData.loop) {
                const soundFile = soundData.pool[0];
                if (soundFile && soundFile.isLoaded() && !soundFile.isPlaying()) {
                    soundFile.setVolume(volOverride || soundData.volume);
                    soundFile.loop();
                }
            } else {
                const soundFile = soundData.pool[soundData.poolIndex];
                if (soundFile && soundFile.isLoaded()) {
                    soundFile.setVolume(volOverride || soundData.volume);
                    soundFile.rate(rateOverride || soundData.rate);
                    soundFile.play();
                }
                soundData.poolIndex = (soundData.poolIndex + 1) % soundData.poolSize;
            }
        },

        stopSound(name) {
            const soundData = this.sounds[name];
            if (soundData && soundData.pool[0] && soundData.pool[0].isLoaded()) {
                soundData.pool.forEach(sf => sf.stop());
            }
        },

        stopAllSounds() {
            for (const name in this.sounds) {
                this.stopSound(name);
            }
        }
    };

    // Pré-carregamento dos assets
    function preload() {
        print("Iniciando preload...");
       // Sons Gerais
    soundManager.registerSound('buttonClick', 'achive-sound-132273.mp3', { volume: 0.3, pool: 5 });
    soundManager.registerSound('powerUpCollect', 'collect-points-190037.mp3', { volume: 0.7, pool: 3 });
    //soundManager.registerSound('shieldHit', 'sword-slash-with-metal-shield-impact-185433.mp3', { volume: 0.2, pool: 2 });

    // Músicas
    soundManager.registerSound('menuMusic', "loop-menu-preview-109594.mp3", { volume: 0.3, loop: true });
    soundManager.registerSound('gameMusic', '8bit-music-for-game-68698.mp3', { volume: 0.3, loop: true });
    soundManager.registerSound('finalBossMusic', 'dark.mp3', { volume: 0.3, loop: true });

    // Sons de Combate
    soundManager.registerSound('heroShoot', 'tiro.mp3', { volume: 0.25, pool: 10 });
    //soundManager.registerSound('slimeHit', 'sfx12-boss_damage1-324520.mp3', { volume: 0.15, pool: 2 });
    soundManager.registerSound('explosionSmall', 'explosion-312361.mp3', { volume: 0.5, pool: 5 });
    soundManager.registerSound('electricZap', 'electric_zap_001-6374.mp3', { volume: 0.4, pool: 6 });
    soundManager.registerSound('rockSmash', 'small-rock-break-194553.mp3', { volume: 0.6, pool: 3 });
    soundManager.registerSound('phantomWhoosh', 'classic-ghost-sound-95773.mp3', { volume: 0.3, pool: 1 });
    //Remvido por bug soundManager.registerSound('crystalShatter', 'glass-breaking-sound-effect-240679.mp3', { volume: 0.2, pool: 2});
    soundManager.registerSound('laserFire', 'laser-gun-81720.mp3', { volume: 0.3, pool: 1 });
    soundManager.registerSound('blackholeSound', 'space-hole-test-23665.mp3', { volume: 0.5 });
    soundManager.registerSound('grenadeExplode', 'grenade-explosion-14-190266.mp3', { volume: 0.5, pool: 3 });
    //soundManager.registerSound('bossExplosion', 'large-explosion-with-rocks-and-debris-99042.mp3', {volume: 1.0});
    
   //CUTSCENE INICIAL(depois de clicar em jogar)
   // soundManager.registerSound('textBeep', 'typewriter-carriage-return-103750.mp3', { volume: 0.3, rate: 1.0, pool: 5 });
    soundManager.registerSound('cutsceneMusic', '2025-06-15 14-22-35.mp3', { volume: 0.7, loop: true });
   // soundManager.registerSound('cutsceneRumble', 'sci-fi-drone-1-88823.mp3', { volume: 0.7, loop: true });
    soundManager.registerSound('cutsceneShipEmerge', 'evacuation-alarm-189740.mp3', { volume: 0.8 }); 
    soundManager.registerSound('cutsceneWarp', 'spaceship-whoosh-video-game-sound-320171.mp3', { volume: 0.9 });  
   // soundManager.registerSound('cutsceneAlarm', 'red-alert_nuclear_buzzer-99741.mp3', { volume: 0.4, pool: 2 });
   // soundManager.registerSound('cutsceneReentry', 'path/to/your/reentry_sound.mp3', { volume: 0.8, loop: true }); // Ex: Som de fogo e vento
    soundManager.registerSound('cutsceneImpact', 'explosions-sound-effect-337381.mp3', { volume: 0.9 });
    //soundManager.registerSound('cutsceneHiss', 'path/to/your/gas_hiss_sound.mp3', { volume: 0.5 }); // Ex: Som de gás vazando
    soundManager.registerSound('cutscenePlanetExplosion', 'large-underwater-explosion-190270.mp3', {volume: 1.0});



        print("Preload concluído.");
    }

    function initializeAudio() {
        if (!gameState.soundInitialized) {
            if (getAudioContext().state !== 'running') {
                getAudioContext().resume().then(() => {
                    console.log("Contexto de áudio resumido com sucesso!");
                    gameState.soundInitialized = true;
                    if (['menu', 'shop', 'debug_menu', 'quiz'].includes(gameState.current)) {
                        soundManager.playSound('menuMusic');
                    }
                }).catch(e => console.error("Erro ao resumir contexto de áudio:", e));
            } else {
                gameState.soundInitialized = true;
                if (['menu', 'shop', 'debug_menu', 'quiz'].includes(gameState.current)) {
                    soundManager.playSound('menuMusic');
                }
            }
        }
    }

    function setup() {
        createCanvas(800, 600);
        initGameValues();
        noStroke();
        textAlign(CENTER, CENTER);
        textFont('Arial');
        frameRate(60);
        updateShopItemStatus();
        console.log("Jogo iniciado. Estado atual: " + gameState.current);
    }

    function updateShopItemStatus() {
        SHOP_ITEMS.weapons.forEach(item => {
            if (playerData.unlockedWeapons.includes(item.id)) item.purchased = true;
        });
        SHOP_ITEMS.skins.forEach(item => {
            if (playerData.unlockedSkins.includes(item.id)) item.purchased = true;
        });
    }


    function initGameValues() {
        barn = {
            x: 80, y: height - 250, w: 150, h: 120, health: 100
        };
        farmSilo = {
            x: width - 120, y: height - 280, baseWidth: 70, baseHeight: 120, topHeight: 50,
            interactionRadius: 60, colorBase: color(180, 180, 170), colorTop: color(200, 50, 50),
            lastUsedTime: -SILO_RELOAD_COOLDOWN, health: 100
        };
    }

    function initGame() {
        console.log("Inicializando Nível: " + gameState.level);
        gameState.score = 0;
        initGameValues(); // Reseta a vida do silo e celeiro
        // Reseta o baulho do boss final se não for o nível dele
        if (gameState.level !== FINAL_BOSS_LEVEL) {
            gameState.finalBossIntroPlayed = false;
        }

        const maxHealthUpgrade = 1 + (playerData.upgrades.maxHealth * 0.1);
        const moveSpeedUpgrade = 1 + (playerData.upgrades.moveSpeed * 0.05);
        const maxAmmoUpgrade = 1 + (playerData.upgrades.maxAmmo * 0.15);

        const heroMaxAmmo = floor((HERO_MAX_AMMO_BASE + gameState.level * 5) * maxAmmoUpgrade);
        let heroInitialSpeed = 4.5 * moveSpeedUpgrade;
        let heroMaxHealth = floor(100 * maxHealthUpgrade);

        hero = {
            x: 100, y: height - 150, baseSize: 55, currentSize: 55, speed: heroInitialSpeed,
            ammo: heroMaxAmmo, maxAmmo: heroMaxAmmo, health: heroMaxHealth, maxHealth: heroMaxHealth,
            color: color(0, 120, 255), lastShot: 0, shootCooldown: 280,
            vx: 0, vy: 0, isMoving: false, moveTime: 0, canReloadAtSilo: true,
            shieldActive: false, shieldTime: 0, shieldMaxTime: HERO_POWERUP_SHIELD_DURATION,
            shieldColor: color(100, 200, 255, 150), hitTimer: 0,
            lastManualShieldTime: -HERO_MANUAL_SHIELD_COOLDOWN,
            weapon: playerData.equippedWeapon, skin: playerData.equippedSkin,
        };
        hero.currentSize = hero.baseSize;


        const currentLevelBossKey = gameState.level <= FINAL_BOSS_LEVEL ? gameState.level : FINAL_BOSS_LEVEL;
        const bossConfig = { ...BOSS_TYPES[currentLevelBossKey] } || { ...BOSS_TYPES[1] }; 
        slime = {
            ...bossConfig,
            isSlime: bossConfig.isSlime !== false,
            x: width / 2, y: bossConfig.type === 'nave_colossal' ? 100 : 150,
            size: bossConfig.baseSize + gameState.level * bossConfig.sizeMultiplier,
            targetSize: bossConfig.targetSizeBase + gameState.level * bossConfig.targetSizeMultiplier,
            maxHealth: bossConfig.baseHealth + gameState.level * bossConfig.healthMultiplier,
            health: bossConfig.baseHealth + gameState.level * bossConfig.healthMultiplier,
            infectedCrops: [], color: bossConfig.color(),
            pulse: 0, pulseSpeed: 0.04, distortion: 0,
            lastSkyAttack: 0, skyAttackCooldown: 4000 - gameState.level * 100, isSpawningEnemies: false,
            shieldActive: false, shieldMaxHealth: bossConfig.shieldMaxHealthBase + gameState.level * bossConfig.shieldMaxHealthMultiplier,
            shieldHealth: 0, shieldColor: color(150, 100, 255, 180), hitTimer: 0,
            abilityTimers: {},
            isInvisible: false,
            activeEffects: [],
            clones: [], // negocio dos clones da Gosma Fantasma
        };
        if (slime.type === 'fire') slime.shieldColor = color(255, 180, 100, 180);
        if (slime.type === 'ice') slime.shieldColor = color(180, 220, 255, 180);
        if (slime.type === 'nave_colossal') slime.shieldColor = color(200, 200, 255, 200);
        if (slime.type === 'intergalactic_slime') slime.shieldColor = color(220, 180, 255, 220);


        slimeAttackCooldown = 3000 - gameState.level * 150;
        slimeShieldActivated75 = false; slimeShieldActivated40 = false;
        electricClouds = [];

        crops = [];
        let cropRows = 3 + Math.floor(gameState.level / 2); let cropsPerRow = 5;
        let cropSpacingX = 70; let cropSpacingY = 50;
        let startX = barn.x + barn.w + 60;
        let startY = height - 230;
        for (let i = 0; i < cropRows; i++) {
            for (let j = 0; j < cropsPerRow; j++) {
                let cropX = startX + j * cropSpacingX + random(-8, 8);
                if (cropX + 30 > farmSilo.x) continue; // Não planta em cima do silo
                crops.push({
                    x: cropX, y: startY + i * cropSpacingY + random(-8, 8),
                    size: 28 + random(-4, 4), infected: false,
                    originalColor: color(random(80, 120), random(180, 220), random(80, 120)),
                    infectionProgress: 0, sway: random(TWO_PI), type: random(['corn', 'wheat', 'tomato'])
                });
            }
        }
        crops.forEach(crop => crop.color = crop.originalColor);

        particles = []; rays = []; skyRays = []; enemyShips = []; ammoPacks = []; powerUpItems = []; miniSlimes = [];
        lastSlimeAttackTime = millis(); slime.lastSkyAttack = millis();
        lastMiniSlimeSpawn = millis();

        soundManager.stopAllSounds(); // Garante que nenhum som antigo continue
        if (gameState.level === FINAL_BOSS_LEVEL) {
            soundManager.playSound('finalBossMusic');
        } else {
            soundManager.playSound('gameMusic');
        }
    }

    // Função de distorção
   
    function applyCosmicDistortionTransforms() {
        let d = gameState.screenDistortion;
        let effectAmt = sin((d.time / d.duration) * PI);

        let skewAmount = effectAmt * 0.08; 
        applyMatrix(1, 0, skewAmount, 1, 0, 0);

      
        translate(width / 2, height / 2);
        rotate(sin(frameCount * 0.5) * effectAmt * 0.03);
        translate(-width / 2, -height / 2);
    }

    
    function drawCosmicDistortionOverlay() {
        let d = gameState.screenDistortion;
        let progress = d.time / d.duration;
        let effectAmt = sin(progress * PI); 

        
        for (let i = 0; i < 3; i++) {
            let y = random(height);
            let h = random(15, 40);
            let c;
            if (i === 0) c = color(255, 0, 0, 40); // Vermelho
            else if (i === 1) c = color(0, 255, 0, 40); // Verde
            else c = color(0, 0, 255, 40); // Azul
            
            fill(c);
            rect(0, y, width, h);
        }

      
        let vignetteAlpha = effectAmt * 180;
        
        
        let grad = drawingContext.createRadialGradient(width / 2, height / 2, width / 4, width / 2, height / 2, width / 1.5);
        grad.addColorStop(0, 'rgba(0,0,0,0)'); // Centro transparente
        grad.addColorStop(1, `rgba(50, 0, 80, ${vignetteAlpha / 255})`); // Borda escura e roxa
        
        drawingContext.fillStyle = grad;
        rect(0, 0, width, height);
    }


    function draw() {
        background(50, 50, 70);
        let shakeX = 0; let shakeY = 0;
        if (gameState.cameraShake > 0) {
            shakeX = random(-gameState.cameraShake, gameState.cameraShake);
            shakeY = random(-gameState.cameraShake, gameState.cameraShake);
            gameState.cameraShake -= 0.5; if (gameState.cameraShake < 0) gameState.cameraShake = 0;
        }

      
        push();

        
        translate(shakeX, shakeY);

        
        if (gameState.screenDistortion.type === 'cosmic_distortion' && gameState.screenDistortion.duration > 0) {
            applyCosmicDistortionTransforms();
        }
        
        // Lógica principal dos movimento e botões
        if (gameState.current === 'game') {
            handleMovement();
        }
        buttonActions = [];

        // 3. Desenha o estado atual do jogo (menu, jogo, e os outros negocio)
        switch (gameState.current) {
            case 'menu': drawMenu(); break;
            case 'shop': drawShop(); break;
            case 'loading': drawLoadingScreen(); updateLoadingScreen(); break;
            case 'cutscene': updateCutscene(); drawCutscene(); break;
            case 'final_boss_cutscene': updateFinalBossCutscene(); drawFinalBossCutscene(); break;
            case 'game': drawGame(); updateGame(); break;
            case 'win': drawWinScreen(); break;
            case 'final_win_cutscene': updateFinalWinCutscene(); drawFinalWinCutscene(); break;
            case 'lose': drawLoseScreen(); break;
            case 'instructions': drawInstructions(); break;
            case 'credits': drawCredits(); break;
            case 'debug_menu': drawDebugMenu(); break;
            case 'debug_options_menu': drawDebugOptionsMenu(); break;
            case 'quiz': drawQuiz(); break;
        }

        pop(); 
        
  
        if (debugMode && gameState.current === 'game') {
            drawDebugOverlay();
        }

      
        if (gameState.screenDistortion.type === 'cosmic_distortion' && gameState.screenDistortion.duration > 0) {
            drawCosmicDistortionOverlay();
        }


        if (gameState.screenDistortion.duration > 0) {
            gameState.screenDistortion.time++;
            if (gameState.screenDistortion.time > gameState.screenDistortion.duration) {
                gameState.screenDistortion.duration = 0;
                gameState.screenDistortion.time = 0;
                gameState.screenDistortion.type = 'none';
            }
        }
    }


    function drawLoadingScreen() {
        drawAnimatedMenuBackground();
        fill(0,0,0,150);
        rect(0,0,width,height);
        fill(220, 220, 255);
        textSize(48);
        textStyle(BOLD);
        text("CARREGANDO AVENTURA...", width / 2, height / 2 - 40);
        textStyle(NORMAL);

        let progress = (millis() - gameState.loadingStartTime) / gameState.loadingDuration;
        progress = constrain(progress, 0, 1);
        let barWidth = width * 0.6;
        let barHeight = 30;
        let barX = width / 2 - barWidth / 2;
        let barY = height / 2 + 20;
        fill(50, 50, 80, 200);
        rect(barX, barY, barWidth, barHeight, 10);
        fill(100, 200, 255, 220);
        rect(barX + 5, barY + 5, (barWidth - 10) * progress, barHeight - 10, 5);

        if (progress > 0.5) {
            textSize(20);
            fill(200,200,255, map(progress, 0.5, 1, 0, 255));
            const nextLevel = gameState.level;
            const bossConf = BOSS_TYPES[nextLevel] || BOSS_TYPES[1];
            if (nextLevel === FINAL_BOSS_LEVEL && !gameState.finalBossIntroPlayed) {
                text(`PREPARE-SE PARA O DESAFIO FINAL...`, width/2, barY + barHeight + 30);
            } else {
                text(`Próximo Desafio: ${bossConf.name}`, width/2, barY + barHeight + 30);
            }
        }
    }

    function updateLoadingScreen() {
        if (millis() - gameState.loadingStartTime >= gameState.loadingDuration) {
            if (gameState.level === FINAL_BOSS_LEVEL && !gameState.finalBossIntroPlayed) {
                gameState.current = 'final_boss_cutscene';
                gameState.finalBossCutscenePhase = 0;
                gameState.finalBossCutsceneProgress = 0;
                soundManager.stopSound('gameMusic');
                soundManager.playSound('cutsceneMusic');
            } else if (!gameState.introCutscenePlayed && gameState.level === 1) {
                initCutscene(); 
            } else {
                initGame();
                gameState.current = 'game';
            }
        }
    }

    function triggerCameraShake(intensity, duration) { gameState.cameraShake = intensity; }


    // CUTSCENE INICIAL


    // ligar a cutscene
    function initCutscene() {
        gameState.current = 'cutscene';
        gameState.cutscenePhase = 0;
        gameState.cutsceneProgress = 0;
        gameState.cutsceneTextProgress = 0;

        gameState.cs_planet = {
            rot: 0,
            explosions: [],
            cracks: [],
            isExploding: false,
            explosionRadius: 0,
            pos: createVector(width / 2, height / 2)
        };
        gameState.cs_ship = {
            pos: createVector(width / 2, height / 2),
            rot: 0,
            scale: 0.05,
            damage: 0,
            visible: false,
            speed: createVector(0,0),
        };
        gameState.cs_lightSpeed = 0; // 0 to 1
        gameState.cs_milkyWayAlpha = 0;
        gameState.cs_craters = [];

        cutsceneStars = [];
        for (let i = 0; i < 400; i++) {
            cutsceneStars.push({
                x: random(-width, width * 2),
                y: random(-height, height * 2),
                z: random(1, width) 
            });
        }

        soundManager.stopAllSounds();
        soundManager.playSound('cutsceneMusic');
    }


    function updateCutscene() {
        const phaseDurations = [0.003, 0.005, 0.003, 0.002, 0.004, 0.004, 0.003, 0.003, 0.005, 0.004, 0.003];
        gameState.cutsceneProgress += phaseDurations[gameState.cutscenePhase] || 0.003;
        gameState.cutsceneTextProgress += 1; 
        // Transição de fase
        if (gameState.cutsceneProgress >= 1) {
            gameState.cutscenePhase++;
            gameState.cutsceneProgress = 0;
            gameState.cutsceneTextProgress = 0;

            switch (gameState.cutscenePhase) {
                case 1: // Explosões começam
                    soundManager.playSound('cutsceneRumble');
                    break;
                case 2: // Nave 
                    gameState.cs_ship.visible = true;
                    soundManager.playSound('cutsceneShipEmerge');
                    break;
                case 3: // Planeta explode, nave entra em lightspeed
                    gameState.cs_planet.isExploding = true;
                    soundManager.stopSound('cutsceneRumble');
                    soundManager.playSound('cutscenePlanetExplosion');
                    soundManager.playSound('cutsceneWarp');
                    triggerCameraShake(20, 120);
                    break;
                case 4: // Falha na nave
                    soundManager.playSound('cutsceneAlarm');
                    break;
                case 5: // Sai do lightspeed
                    soundManager.stopSound('cutsceneWarp');
                    // soundManager.playSound('cutsceneReentry'); // Som removido por bug
                    break;
                case 7: // Impacto
                    // soundManager.stopSound('cutsceneReentry'); // Som removido por bug
                    soundManager.playSound('cutsceneImpact');
                    triggerCameraShake(35, 180);
                    gameState.cs_ship.visible = false;
                    for(let i=0; i<3; i++) {
                       gameState.cs_craters.push({x: width/2 + random(-50,50), y: height-100+random(-20,20), size: random(80,150)});
                    }
                    break;
                case 8: // Libera a praga
                    // soundManager.playSound('cutsceneHiss'); // Som removido por bug
                    break;
                case 10: // Fim da cutscene
                    gameState.introCutscenePlayed = true;
                    soundManager.stopAllSounds();
                    gameState.current = 'game';
                    initGame();
                    break;
            }
        }

        // Lógica de animação por fase
        gameState.cs_planet.rot += 0.0005;

        if (gameState.cutscenePhase === 1) { // Pequenas explosões
            if (frameCount % 10 === 0) {
                let angle = random(TWO_PI);
                let radius = 150 * 0.45;
                gameState.cs_planet.explosions.push({
                    x: cos(angle) * radius, y: sin(angle) * radius,
                    size: random(10, 25), life: 30
                });
            }
        } else if (gameState.cutscenePhase === 2) { // Nave emerge
            gameState.cs_ship.scale = lerp(0.05, 0.4, gameState.cutsceneProgress);
            gameState.cs_ship.pos.x = lerp(width/2, width*0.7, gameState.cutsceneProgress);
            gameState.cs_ship.pos.y = lerp(height/2, height*0.4, gameState.cutsceneProgress);
            if(frameCount % 15 === 0) gameState.cs_planet.cracks.push({ a1: random(TWO_PI), r1: 0, a2: random(TWO_PI), r2: 140, life: 100});
        } else if (gameState.cutscenePhase === 3) { // Lightspeed
            gameState.cs_lightSpeed = lerp(0, 1, gameState.cutsceneProgress);
            gameState.cs_ship.pos.x += 15;
            gameState.cs_planet.explosionRadius = lerp(0, width * 2, gameState.cutsceneProgress);
        } else if (gameState.cutscenePhase === 4) { // Malfunction
            gameState.cs_ship.rot += random(-0.05, 0.05);
            if(frameCount % 5 === 0) gameState.cs_ship.damage = 1; else gameState.cs_ship.damage = 0;
        } else if (gameState.cutscenePhase === 5) { // Crash course
            gameState.cs_lightSpeed = lerp(1, 0, gameState.cutsceneProgress);
            gameState.cs_milkyWayAlpha = lerp(0, 255, gameState.cutsceneProgress);
            gameState.cs_ship.rot += 0.02;
            gameState.cs_ship.pos.x = lerp(width/2, -100, gameState.cutsceneProgress);
            gameState.cs_ship.pos.y = lerp(height*0.4, height, gameState.cutsceneProgress);
        } else if (gameState.cutscenePhase === 6) { // Streaking across sky
            gameState.cs_milkyWayAlpha = lerp(255, 0, gameState.cutsceneProgress);
            gameState.cs_ship.pos.x = lerp(-100, width + 100, gameState.cutsceneProgress);
            gameState.cs_ship.pos.y = lerp(height*0.2, height*0.6, gameState.cutsceneProgress);
            gameState.cs_ship.scale = lerp(0.4, 0.8, gameState.cutsceneProgress);
            gameState.cs_ship.damage = 2; // On fire
        }

        // Atualiza explosões
        gameState.cs_planet.explosions.forEach(e => e.life--);
        gameState.cs_planet.explosions = gameState.cs_planet.explosions.filter(e => e.life > 0);
        // Atualiza rachaduras
        gameState.cs_planet.cracks.forEach(c => c.life--);
        gameState.cs_planet.cracks = gameState.cs_planet.cracks.filter(c => c.life > 0);
    }


    function drawCutscene() {
        background(5, 3, 15);
        // Gerencia as estrelas
        push();
        translate(width/2, height/2);
        // Desenha estrelas com efeito de paralaxe e lightspeed
        cutsceneStars.forEach(star => {
            let sx = map(star.x / (star.z - gameState.cs_lightSpeed * star.z), 0, 1, 0, width);
            let sy = map(star.y / (star.z - gameState.cs_lightSpeed * star.z), 0, 1, 0, height);
            let r = map(star.z, 0, width, 5, 0);

            let px = map(star.x / star.z, 0, 1, 0, width);
            let py = map(star.y / star.z, 0, 1, 0, height);

            if (gameState.cs_lightSpeed > 0.01) {
                stroke(255, 255, 220, 200);
                strokeWeight(r * 0.5);
                line(px, py, sx, sy);
            } else {
                fill(255, 255, 220, 200);
                noStroke();
                ellipse(sx, sy, r, r);
            }
        });
        pop();


        // Textos da Cutscene
        const scenesText = [
            "Em um canto esquecido do universo, o planeta Zygonia vivia seus últimos momentos de paz.",
            "Uma instabilidade interna, catastrófica e inevitável, começou a consumir seu núcleo.",
            "Em desespero, a arca 'Ceifadora' é lançada, carregando os últimos vestígios... e suas pragas.",
            "Deixando para trás um túmulo estelar, a nave rasga o tecido do espaço-tempo.",
            "Mas a fuga apressada cobrou seu preço. Sistemas críticos começam a falhar catastroficamente.",
            "À deriva, a arca é capturada pela gravidade de uma galáxia desconhecida: a Via Láctea.",
            "Seu destino: um pequeno e pacífico planeta azul... e uma fazenda desavisada.",
            "IMPACTO. O silêncio da noite rural é quebrado pela fúria metálica.",
            "Das ferragens, a carga mortal é liberada. As pragas agora têm um novo lar para consumir.",
            "AGRINHO! Herói dos Cultivos! Sua hora chegou! DEFENDA A COLHEITA!",
            ""
        ];

        // Desenha elementos da cena
        if (gameState.cutscenePhase <= 4) {
            drawAlienPlanet(gameState.cs_planet);
        } else if (gameState.cutscenePhase === 5) {
            drawMilkyWay(gameState.cs_milkyWayAlpha);
        } else if (gameState.cutscenePhase >= 6) {
            drawSimpleFarmSilhouettes(height - 80, 1);
        }
        
        if (gameState.cs_ship.visible) {
           drawArcaCeifadora(gameState.cs_ship);
        }

        if (gameState.cutscenePhase === 7) { // Impacto
            let explosionProgress = gameState.cutsceneProgress;
            let explosionSize = lerp(0, width * 2, explosionProgress);
            let explosionAlpha = lerp(255, 0, explosionProgress);
            fill(255, 255, 200, explosionAlpha);
            ellipse(width / 2, height, explosionSize, explosionSize * 0.8);
        } else if (gameState.cutscenePhase >= 8) { // Cratera e praga
            drawCraterAndWreckage(gameState.cs_craters);
            if (gameState.cutscenePhase === 8) {
                drawReleasedPlague(gameState.cutsceneProgress);
            }
        }
         if (gameState.cutscenePhase === 9) {
            let heroAppearProgress = gameState.cutsceneProgress;
            let heroY = lerp(height + 100, height - 150, heroAppearProgress);
            drawHero(width/2, heroY, 55, {idle: true}, {skin: 'default_skin', currentSize: 55});
        }


        // Caixa de texto
        if (gameState.cutscenePhase < scenesText.length && scenesText[gameState.cutscenePhase] !== "") {
            const currentText = scenesText[gameState.cutscenePhase];
            const textToShow = currentText.substring(0, floor(gameState.cutsceneTextProgress));
            if (textToShow.length < currentText.length && frameCount % 3 === 0) {
                soundManager.playSound('textBeep');
            }

            fill(0, 0, 0, 180);
            rect(0, height - 130, width, 100);
            fill(200, 255, 220);
            textSize(24);
            textStyle(BOLD);
            text(textToShow, width /15,height -100,width- 40, 80);
            textStyle(NORMAL);
        }
        
        // Barra de progresso / Pular
        fill(255, 220, 100, 150);
        textSize(16);
        text(`Clique ou aperte ESPAÇO para avançar`, width / 2, 30);
    }

    // Funções de desenho para a nova cutscene
    function drawAlienPlanet(planet) {
        if (planet.isExploding) {
            let p = map(planet.explosionRadius, 0, width*2, 0, 1);
            let c1 = color(255, 255, 200);
            let c2 = color(255, 100, 0);
            let finalColor = lerpColor(c1, c2, p);
            finalColor.setAlpha(lerp(255, 0, p));
            fill(finalColor);
            ellipse(planet.pos.x, planet.pos.y, planet.explosionRadius);
            return;
        }

        push();
        translate(planet.pos.x, planet.pos.y);
        rotate(planet.rot);

        // Planeta
        let c1 = color(150, 80, 200);
        let c2 = color(50, 20, 80);
        let grad = drawingContext.createRadialGradient(0, 0, 0, 0, 0, 150);
        grad.addColorStop(0, c1.toString());
        grad.addColorStop(1, c2.toString());
        drawingContext.fillStyle = grad;
        ellipse(0, 0, 300, 300);

        // Continentes
        fill(90, 180, 120, 150);
        beginShape();
        for (let i = 0; i < TWO_PI; i += 0.5) {
            let r = 150 * (0.8 + noise(i, frameCount * 0.1) * 0.2);
            vertex(cos(i) * r, sin(i) * r);
        }
        endShape(CLOSE);
        
        // Rachaduras
        strokeWeight(2);
        planet.cracks.forEach(crack => {
            stroke(255, 150, 100, crack.life * 2);
            line(cos(crack.a1)*crack.r1, sin(crack.a1)*crack.r1, cos(crack.a2)*crack.r2, sin(crack.a2)*crack.r2);
        });

        // Explosões na superfície
        noStroke();
        planet.explosions.forEach(e => {
            let p = e.life / 30;
            fill(255, 200, 100, p * 255);
            ellipse(e.x, e.y, e.size * (1-p));
        });

        pop();
    }

    function drawArcaCeifadora(ship) {
        push();
        translate(ship.pos.x, ship.pos.y);
        scale(ship.scale);
        rotate(ship.rot);

        // Rastro de dano/fogo
        if (ship.damage === 2) {
          for(let i=0; i<10; i++) {
            fill(255, random(100,200), 0, random(50,150));
            ellipse(random(-100,100), random(-100, 100), random(20,60), random(20,60));
          }
        }
        
        // Corpo da Nave
        fill(80, 80, 90);
        beginShape();
        vertex(0, -200); // Ponta
        vertex(-100, 50); // Asa traseira esquerda
        vertex(-50, 150); // Motor esquerdo
        vertex(50, 150);  // Motor direito
        vertex(100, 50);  // Asa traseira direita
        endShape(CLOSE);

        // Detalhes
        fill(120, 120, 130);
        rect(-40, -100, 80, 150); // Corpo central
        triangle(0, -200, -40, -100, 40, -100); // Ponta cockpit

        // Motores
        let thrust = 1 + sin(frameCount * 0.5) * 0.2;
        fill(100, 200, 255);
        ellipse(-50, 160, 40, 80 * thrust);
        ellipse(50, 160, 40, 80 * thrust);
        
        // Dano de faísca
        if (ship.damage === 1) {
            fill(255,255,0);
            for(let i=0; i<3; i++) {
                let sparkX = random(-80, 80);
                let sparkY = random(-150, 150);
                ellipse(sparkX, sparkY, 5, 5);
            }
        }

        pop();
    }


    function drawMilkyWay(alphaValue) {
        push();
        translate(width/2, height/2);
        rotate(frameCount * 0.001);
        for(let i=0; i<300; i++) {
            let angle = i * 0.1 + log(i)*5;
            let dist = i * 1.5;
            let x = cos(angle) * dist;
            let y = sin(angle) * dist;
            let c = lerpColor(color(100,100,255), color(255,200,255), i/300.0);
            c.setAlpha(alphaValue * (1 - i/350.0) * 0.8);
            fill(c);
            ellipse(x, y, 2 + i*0.02, 2+i*0.02);
        }
        pop();
    }

    function drawCraterAndWreckage(craters) {
        fill(30,20,10);
        craters.forEach(c => {
            ellipse(c.x, c.y + 20, c.size, c.size/2);
        });
        // Pedaços da nave
        fill(50,50,60);
        rect(width*0.4, height-120, 80, 30);
        rect(width*0.6, height-140, 50, 50);
        if(frameCount % 10 < 5) {
            fill(255,100,0,150);
            ellipse(width*0.45, height-110, 20,20);
        }
    }

    function drawReleasedPlague(progress) {
        for(let i=0; i < 10; i++) {
            let p = progress * (i + 1) / 10;
            // Cápsulas
            fill(100,120,100, lerp(0, 200, p));
            ellipse(width*0.5 + i*20 - 100, height-120, 10, 20);
            // Gás
            fill(80,200,80, lerp(0, 80, p));
            ellipse(width*0.5 + random(-100,100), height-120 + random(-20,20), random(20,50), random(20,50));
        }
        // A primeira gosma se formando
        let slimeSize = lerp(0, 40, progress);
        let tempSlimeForCutscene = { pulse: frameCount * 0.1, color: BOSS_TYPES[1].color(), type: 'default', distortion: 0, shieldActive: false };
        drawSlime(width / 2, height - 120, slimeSize, true, progress, tempSlimeForCutscene.color, tempSlimeForCutscene);
    }


  
    // FIM CUTSCENE



    function updateFinalBossCutscene() {
        gameState.finalBossCutsceneProgress += 0.002;
        if (gameState.finalBossCutsceneProgress >= 1) {
            gameState.finalBossCutscenePhase++;
            gameState.finalBossCutsceneProgress = 0;
            if (gameState.finalBossCutscenePhase === 1) {
                soundManager.playSound('blackholeSound');
            }
            if (gameState.finalBossCutscenePhase === 2) {
                triggerCameraShake(20, 120);
            }
            if (gameState.finalBossCutscenePhase >= 4) {
                gameState.finalBossIntroPlayed = true;
                gameState.current = 'game';
                initGame();
            }
        }
    }

    function drawFinalBossCutscene() {
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let s = random(1, 3);
            let starColor = color(random(150, 255), random(150, 255), random(200, 255), random(100, 200));
            fill(starColor);
            ellipse(x + sin(frameCount * 0.01 + y * 0.05) * 20 * gameState.finalBossCutsceneProgress,
                    y + cos(frameCount * 0.01 + x * 0.05) * 20 * gameState.finalBossCutsceneProgress,
                    s, s);
        }

        const bossFinalCutsceneTexts = [
            "O tecido da realidade se rasga...",
            "Das profundezas insondáveis do cosmos, ELE surge...",
            "Zy'Glar, o Devorador Cósmico, chegou para consumir tudo!",
            "AGRINHO! ESTA É SUA BATALHA FINAL! SALVE O UNIVERSO!"
        ];

        if (gameState.finalBossCutscenePhase < bossFinalCutsceneTexts.length) {
            if (gameState.finalBossCutscenePhase === 0 || gameState.finalBossCutscenePhase === 1) {
                let portalSize = lerp(0, width * 0.8, gameState.finalBossCutsceneProgress);
                let portalX = width/2;
                let portalY = height/2;
                for(let i=0; i<10; i++){
                    let inter = i/10;
                    let ringColor = color(lerp(50,150,inter) + random(-20,20) , lerp(0,50,inter), lerp(100,200,inter) + random(-20,20), 150 - inter*100);
                    strokeWeight(lerp(20,2,inter) * (1 + sin(frameCount*0.1 + i)*0.2));
                    noFill();
                    stroke(ringColor);
                    ellipse(portalX, portalY, portalSize * (1-inter*0.5) + sin(frameCount*0.05 + i)*20, portalSize*0.7 * (1-inter*0.5) + cos(frameCount*0.05+i)*20);
                }
                noStroke();
            }

            if (gameState.finalBossCutscenePhase >= 1) {
                 let bossData = BOSS_TYPES[FINAL_BOSS_LEVEL];
                 let appearProgress = (gameState.finalBossCutscenePhase === 1) ? gameState.finalBossCutsceneProgress : 1;
                 if (gameState.finalBossCutscenePhase > 1) appearProgress = min(1, gameState.finalBossCutsceneProgress * 2 + (gameState.finalBossCutscenePhase-2));

                 let bossSize = lerp(0, bossData.baseSize * 1.5, appearProgress);
                 let tempFinalBoss = {
                      type: bossData.type, name: bossData.name, color: bossData.color(),
                      distortion: 10 * appearProgress, pulse: frameCount * 0.1, pulseSpeed: 0.1,
                      shieldActive: false, health: 1, maxHealth: 1
                 };
                 drawSlime(width/2, height/2, bossSize, true, appearProgress, tempFinalBoss.color, tempFinalBoss);
            }


            let textAlpha = lerp(0, 255, min(1, gameState.finalBossCutsceneProgress * 3));
            if (gameState.finalBossCutsceneProgress > 0.9) textAlpha = lerp(255, 0, (gameState.finalBossCutsceneProgress - 0.9) / 0.1);

            fill(0, 0, 0, min(180, textAlpha * 0.7));
            rect(width / 2 - 350, height - 120, 700, 80, 15);
            fill(220, 200, 255, textAlpha);
            textSize(20); textStyle(BOLD);
            text(bossFinalCutsceneTexts[gameState.finalBossCutscenePhase], width / 2, height - 85);
            textStyle(NORMAL);
        }

        fill(255, 220); textSize(16);
        text(`A AMEAÇA FINAL SE APROXIMA... (Clique para Acelerar)`, width / 2, 30);
    }
    

    // Função updateFinalWinCutscene
    
    function updateFinalWinCutscene() {
        gameState.finalWinCutsceneProgress += 0.005;
    
        if (gameState.finalWinCutscenePhase === 0) { // Explosão
            if (gameState.finalWinCutsceneProgress > 0.1 && gameState.finalWinCutsceneProgress < 0.11) {
                soundManager.playSound('bossExplosion');
                triggerCameraShake(30, 150);
            }
            if (frameCount % 2 === 0 && slime) { // Adicionado '&& slime' para segurança
                let pColor = color(random(200,255), random(100,255), 100);
                createParticles(slime.x, slime.y, 5, pColor, {spread: slime.size/2, speed: random(5, 15), life: 80});
            }
            if (gameState.finalWinCutsceneProgress >= 1) {
                gameState.finalWinCutscenePhase = 1;
                gameState.finalWinCutsceneProgress = 0;
                slime = null; // Remove o boss da tela
            }
        } else if (gameState.finalWinCutscenePhase === 1) { // Chuva de Adubo
            if(frameCount % 4 === 0) {
                createParticles(random(width), -20, 2, color(100, 255, 100, 150), {vy: 2, gravity: 0.05, life: 200});
            }
            if(gameState.finalWinCutsceneProgress >= 1) {
                gameState.finalWinCutscenePhase = 2;
                gameState.finalWinCutsceneProgress = 0;
                crops.forEach(c => c.infected = false); // Cura as plantações
            }
        } else if (gameState.finalWinCutscenePhase === 2) { // Finalização
            if(gameState.finalWinCutsceneProgress >= 1.5) { // Espera um pouco e volta pro menu
                soundManager.stopAllSounds();
                soundManager.playSound('menuMusic');
                
                // PRINCIPAL
                // Reseta o estado do jogo pra proxima play.
                gameState.level = 1;
                gameState.introCutscenePlayed = false;
                gameState.finalBossIntroPlayed = false;
                gameState.current = 'menu';
              
            }
        }
    }

    function drawFinalWinCutscene() {
        drawDefaultFarmBackground();
        if (hero) drawHero(hero.x, hero.y, hero.currentSize, {idle: true}, hero);

        if (gameState.finalWinCutscenePhase < 2) {
            if(slime) drawSlime(slime.x, slime.y, slime.size * (1 - gameState.finalWinCutsceneProgress), false, 1, slime.color, slime);
        } else { // Desenha o brilho nas plantações curadas
            for(let crop of crops) {
                if(frameCount % 15 < 5) {
                    fill(255, 255, 150, 100);
                    ellipse(crop.x, crop.y, crop.size*1.5, crop.size*1.5);
                }
            }
        }
        updateParticles(); // Garante que as partículas da explosão e da chuva sejam atualizadas
        drawParticles();

        if(gameState.finalWinCutscenePhase === 2) {
            let textAlpha = lerp(0, 255, gameState.finalWinCutsceneProgress / 0.5);
            fill(0,0,0, textAlpha * 0.7);
            rect(0, height/2 - 50, width, 100);
            fill(150, 255, 150, textAlpha);
            textSize(40);
            textStyle(BOLD);
            text("A FAZENDA FOI SALVA!", width/2, height/2);
            textStyle(NORMAL);
        }
    }


    function drawSimpleFarmSilhouettes(yPos, progress) {
        fill(20,10,0, lerp(0, 200, progress));
        rect(width*0.1 - 50, yPos - 80, 100, 80);
        triangle(width*0.1-50, yPos-80, width*0.1+50, yPos-80, width*0.1, yPos-120);
        rect(width*0.8 - 40, yPos - 120, 80, 120);
        ellipse(width*0.8, yPos - 120, 80, 30);
    }

    function drawMenu() {
        drawAnimatedMenuBackground();
        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = color(50, 200, 50, 150).toString();
        fill(230, 255, 230); textSize(68); textStyle(BOLD);
        text("AGRO DEFENDER", width / 2, 100);
        drawingContext.shadowBlur = 0;

        let btnWidth = 220; let btnHeight = 55; let spacing = 65;
        let btnY = 180;
        drawButton(width / 2 - btnWidth / 2, btnY, btnWidth, btnHeight, "JOGAR", color(60, 180, 60), () => {
            gameState.current = 'loading';
            gameState.loadingStartTime = millis();
            soundManager.stopSound('menuMusic');
        });
        btnY += spacing;
        drawButton(width / 2 - btnWidth / 2, btnY, btnWidth, btnHeight, "LOJA", color(60, 120, 180), () => {
            gameState.current = 'shop'; soundManager.playSound('buttonClick');
        });
        btnY += spacing;
        drawButton(width / 2 - btnWidth / 2, btnY, btnWidth, btnHeight, "INSTRUÇÕES", color(160, 60, 160), () => {
            gameState.current = 'instructions'; soundManager.playSound('buttonClick');
        });
        btnY += spacing;
        drawButton(width / 2 - btnWidth / 2, btnY, btnWidth, btnHeight, "QUIZZ", color(180, 140, 60), () => {
            gameState.current = 'quiz';
            quizState.currentQuestion = 0;
            quizState.score = 0;
            quizState.showResult = false;
            soundManager.playSound('buttonClick');
        });

        // Botão de DEBUG
        if (debugMode) {
            btnY += spacing;
            drawButton(width / 2 - btnWidth / 2, btnY, btnWidth, btnHeight, "SELEC. FASE", color(200, 180, 50), () => {
                gameState.current = 'debug_menu'; soundManager.playSound('buttonClick');
            });
        }

        drawButton(width - 120, height - 60, 100, 40, "CRÉDITOS", color(180, 60, 60), () => {
            gameState.current = 'credits'; soundManager.playSound('buttonClick');
        });


        let menuHero = { skin: playerData.equippedSkin, weapon: playerData.equippedWeapon, isMoving: false, currentSize: 55, baseSize: 55, color: color(0,120,255), shieldActive: false, hitTimer: 0 };
        drawHero(width - 100, height - 100, menuHero.currentSize, {idle: true, facingLeft: true}, menuHero);

        let menuSlimeBossData = BOSS_TYPES[1];
        drawSlime(100, height - 100, 60 * (1 + sin(frameCount*0.05)*0.1), false, 1, menuSlimeBossData.color(), menuSlimeBossData);
    }

 
    // Menus e Overlays de Debug
    function drawDebugMenu() {
        drawAnimatedMenuBackground();
        fill(255, 220, 100);
        textSize(48);
        textStyle(BOLD);
        text("MENU DE DEBUG", width / 2, 80);
        textStyle(NORMAL);
    
        const levels = Object.keys(BOSS_TYPES);
        const btnWidth = 250;
        const btnHeight = 40;
        const columns = 3;
        const colWidth = width / columns;
        const startX = colWidth / 2 - btnWidth / 2;
        const startY = 150;
    
        for (let i = 0; i < levels.length; i++) {
            const levelKey = levels[i];
            const bossInfo = BOSS_TYPES[levelKey];
            const col = i % columns;
            const row = Math.floor(i / columns);
            const x = startX + col * colWidth;
            const y = startY + row * (btnHeight + 15);
    
            drawButton(x, y, btnWidth, btnHeight, `Nível ${levelKey}: ${bossInfo.name}`, color(80, 80, 150), () => {
                gameState.level = parseInt(levelKey);
                gameState.current = 'loading';
                gameState.loadingStartTime = millis();
                gameState.introCutscenePlayed = true;
                gameState.finalBossIntroPlayed = true;
                soundManager.stopSound('menuMusic');
            });
        }
    
        drawButton(width / 2 - 150, height - 130, 300, 50, "OPÇÕES DE CHEAT", color(210, 80, 210), () => {
            gameState.current = 'debug_options_menu';
            soundManager.playSound('buttonClick');
        });
    
        drawButton(width / 2 - 100, height - 70, 200, 50, "VOLTAR AO MENU", color(100, 120, 200), () => {
            gameState.current = 'menu';
            soundManager.playSound('buttonClick');
        });
    }

    function drawDebugOptionsMenu() {
        drawAnimatedMenuBackground();
        fill(255, 220, 100);
        textSize(48);
        textStyle(BOLD);
        text("OPÇÕES DEV", width / 2, 80);
        textStyle(NORMAL);

        const options = [
            { label: "Vida Infinita", key: 'infiniteLife' },
            { label: "Munição Infinita", key: 'infiniteAmmo' },
            { label: "Dano Massivo", key: 'godModeDamage' },
            { label: "Mostrar Hitboxes", key: 'showHitboxes' },
            { label: "Desativar IA Inimiga", key: 'disableAI' },
            { label: "Atravessar Paredes", key: 'noclip' },
        ];

        let btnY = 150;
        const btnWidth = 300;
        const btnHeight = 45;
        const spacing = 55;

        options.forEach(opt => {
            const isEnabled = debugOptions[opt.key];
            const btnLabel = `${opt.label}: ${isEnabled ? 'LIGADO' : 'DESLIGADO'}`;
            const btnColor = isEnabled ? color(60, 180, 60) : color(180, 60, 60);
            drawButton(width / 2 - btnWidth / 2, btnY, btnWidth, btnHeight, btnLabel, btnColor, () => {
                debugOptions[opt.key] = !debugOptions[opt.key];
            });
            btnY += spacing;
        });

        // Botões de ação 
        drawButton(width / 2 - 310 / 2, btnY, 150, 40, "Adicionar 10k Pontos", color(200, 180, 50), () => {
            playerData.totalScore += 10000;
        });
         drawButton(width / 2 + 10, btnY, 150, 40, "Desbloquear Tudo", color(80, 150, 220), () => {
            SHOP_ITEMS.weapons.forEach(item => {
                if(!playerData.unlockedWeapons.includes(item.id)) playerData.unlockedWeapons.push(item.id);
            });
            SHOP_ITEMS.skins.forEach(item => {
                 if(!playerData.unlockedSkins.includes(item.id)) playerData.unlockedSkins.push(item.id);
            });
            updateShopItemStatus(); // Atualiza a loja para refletir as compras
        });
        btnY += spacing;

        drawButton(width / 2 - 100, height - 70, 200, 50, "VOLTAR AO MENU", color(100, 120, 200), () => {
            gameState.current = 'menu';
            soundManager.playSound('buttonClick');
        });
    }

    function drawDebugOverlay() {
        if (!debugOptions.showHitboxes) return;

        noFill();
        strokeWeight(2);

        // Hitbox do Herói
        if (hero) {
            stroke(0, 255, 255); // Ciano
            ellipse(hero.x, hero.y, hero.currentSize, hero.currentSize);
        }

        // Hitbox do Boss
        if (slime && slime.health > 0) {
            stroke(255, 0, 255); // Magenta
            let hitDist = slime.type === 'nave_colossal' ? slime.size * 0.5 : slime.size / 2;
            ellipse(slime.x, slime.y, hitDist * 2, hitDist * 2);
        }
        
        // Hitbox dos Clones do Boss
        if (slime && slime.clones.length > 0) {
            stroke(255, 128, 255); // Rosa claro
            slime.clones.forEach(clone => {
                ellipse(clone.x, clone.y, clone.size, clone.size);
            });
        }

        // Hitbox das Naves Inimigas
        enemyShips.forEach(ship => {
            stroke(255, 128, 0); // Laranja
            ellipse(ship.x, ship.y, ship.size, ship.size);
        });

        // Hitbox dos Mini Slimes
        miniSlimes.forEach(ms => {
            stroke(255, 255, 0); // Amarelo
            ellipse(ms.x, ms.y, ms.size, ms.size);
        });
        
        // Hitbox dos Projéteis 
        particles.forEach(p => {
            if(p.isProjectile) {
                stroke(p.isEnemyProjectile ? 'red' : 'lime');
                ellipse(p.x, p.y, p.size, p.size);
            }
        });

        noStroke();
    }
    
    function drawQuiz() {
        drawAnimatedMenuBackground();
        fill(220, 240, 255);
        textSize(48);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text("QUIZZ DO AGRO", width / 2, 80);
        textStyle(NORMAL);

        if (quizState.showResult) {
            textSize(32);
            text(`Você acertou ${quizState.score} de ${quizState.questions.length} perguntas!`, width / 2, height / 2 - 40);
            drawButton(width / 2 - 100, height / 2 + 40, 200, 50, "VOLTAR", color(100, 120, 200), () => {
                gameState.current = 'menu';
            });
            return;
        }

        const q = quizState.questions[quizState.currentQuestion];
        fill(255);
        textSize(24);
        textAlign(CENTER, TOP); // Alinha o texto da pergunta no topo e centralizado
        text(q.question, width / 9, 180, width * 0.8, 100);

        textAlign(CENTER, CENTER); // Reseta o alinhamento para os botões

        const btnWidth = 350;
        const btnHeight = 50;
        let startY = 280;
        for (let i = 0; i < q.options.length; i++) {
            drawButton(width / 2 - btnWidth / 2, startY + i * (btnHeight + 15), btnWidth, btnHeight, q.options[i], color(80, 100, 150), () => {
                if (i === q.answer) {
                    quizState.score++;
                    soundManager.playSound('powerUpCollect');
                }
                
                quizState.currentQuestion++;
                if (quizState.currentQuestion >= quizState.questions.length) {
                    quizState.showResult = true;
                }
            });
        }
    }
   

    function drawShop() {
        drawAnimatedMenuBackground();
        fill(230, 255, 230); textSize(48); textStyle(BOLD);
        text("LOJA DO FAZENDEIRO", width / 2, 60);
        textStyle(NORMAL);

        textSize(20); fill(255, 220, 150);
        text(`Pontos Totais: ${playerData.totalScore}`, width / 2, 105);

        // Abas da Loja
        let tabY = 140;
        let tabWidth = 150;
        drawButton(width/2 - tabWidth*1.5 - 10, tabY, tabWidth, 40, "Armas", currentShopTab === 'weapons' ? color(80,150,220) : color(60,100,150), () => currentShopTab = 'weapons');
        drawButton(width/2 - tabWidth/2, tabY, tabWidth, 40, "Skins", currentShopTab === 'skins' ? color(80,150,220) : color(60,100,150), () => currentShopTab = 'skins');
        drawButton(width/2 + tabWidth/2 + 10, tabY, tabWidth, 40, "Upgrades", currentShopTab === 'upgrades' ? color(80,150,220) : color(60,100,150), () => currentShopTab = 'upgrades');

        let startY = 200;
        let listX = width/2 - 350/2;
        let itemWidth = 350;
        let listHeight = SHOP_VISIBLE_ITEMS * SHOP_ITEM_HEIGHT;

        if (currentShopTab === 'weapons') {
            drawShopCategory(SHOP_ITEMS.weapons, listX, startY, itemWidth, SHOP_ITEM_HEIGHT, listHeight, shopScrollOffsetWeapons);
        } else if (currentShopTab === 'skins') {
            drawShopCategory(SHOP_ITEMS.skins, listX, startY, itemWidth, SHOP_ITEM_HEIGHT, listHeight, shopScrollOffsetSkins);
        } else if (currentShopTab === 'upgrades') {
            drawUpgradeCategory(UPGRADE_ITEMS, listX, startY, itemWidth, SHOP_ITEM_HEIGHT, listHeight, shopScrollOffsetUpgrades);
        }

        drawButton(width / 2 - 100, height - 70, 200, 50, "VOLTAR AO MENU", color(100, 120, 200), () => {
            gameState.current = 'menu';
            soundManager.playSound('buttonClick');
        });
    }


    function drawShopCategory(items, x, y, itemW, itemH, listH, scrollOffset) {
        if (!items) return;
        fill(0,0,0,100);
        rect(x, y, itemW, listH, 10);

        for (let i = 0; i < SHOP_VISIBLE_ITEMS; i++) {
            let itemIndex = scrollOffset + i;
            if (itemIndex >= items.length) break;

            let item = items[itemIndex];
            let itemY = y + i * itemH;

            fill(50, 60, 80, 150);
            if (mouseX > x && mouseX < x + itemW && mouseY > itemY && mouseY < itemY + itemH) {
                fill(70, 80, 100, 180);
            }
            rect(x + 5, itemY + 5, itemW - 10, itemH - 10, 8);

            textAlign(LEFT, TOP);
            fill(220, 220, 255); textSize(16);
            text(`${item.icon} ${item.name}`, x + 15, itemY + 15);

            textSize(12); fill(200, 200, 200);
            text(item.description, x + 15, itemY + 35, itemW - 120);

            textAlign(RIGHT, TOP);
            if (item.purchased) {
                fill(100, 255, 100); textSize(14);
                text("Adquirido", x + itemW - 15, itemY + 15);
                if ((item.type === 'weapon' && playerData.equippedWeapon !== item.id) ||
                    (item.type === 'skin' && playerData.equippedSkin !== item.id)
                   ) {
                    drawButton(x + itemW - 95, itemY + itemH - 35, 80, 25, "Equipar", color(80, 150, 220), () => handleShopAction(item, 'equip'));
                } else {
                    fill(200, 200, 80); textSize(12);
                    text("Equipado", x + itemW - 15, itemY + itemH - 25);
                }
            } else {
                fill(255, 200, 100); textSize(14);
                text(`Custo: ${item.cost}`, x + itemW - 15, itemY + 15);
                let canAfford = playerData.totalScore >= item.cost;
                drawButton(x + itemW - 95, itemY + itemH - 35, 80, 25, "Comprar", canAfford ? color(100, 200, 100) : color(150,150,150), () => {
                    if(canAfford) handleShopAction(item, 'buy');
                });
            }
            textAlign(CENTER, CENTER);
        }
    }

    function drawUpgradeCategory(items, x, y, itemW, itemH, listH, scrollOffset) {
        if (!items) return;
        fill(0,0,0,100);
        rect(x, y, itemW, listH, 10);

        for (let i = 0; i < SHOP_VISIBLE_ITEMS; i++) {
            let itemIndex = scrollOffset + i;
            if (itemIndex >= items.length) break;

            let item = items[itemIndex];
            let currentLevel = playerData.upgrades[item.id];
            let cost = item.cost + (item.cost * currentLevel * 0.5);
            let itemY = y + i * itemH;

            fill(50, 60, 80, 150);
            if (mouseX > x && mouseX < x + itemW && mouseY > itemY && mouseY < itemY + itemH) {
                fill(70, 80, 100, 180);
            }
            rect(x + 5, itemY + 5, itemW - 10, itemH - 10, 8);

            textAlign(LEFT, TOP);
            fill(220, 220, 255); textSize(16);
            text(`${item.icon} ${item.name} (Nível ${currentLevel}/${item.maxLevel})`, x + 15, itemY + 15);

            textSize(12); fill(200, 200, 200);
            text(item.description, x + 15, itemY + 35, itemW - 120);

            textAlign(RIGHT, TOP);
            if (currentLevel >= item.maxLevel) {
                fill(100, 255, 100); textSize(14);
                text("MAX", x + itemW - 15, itemY + 15);
            } else {
                fill(255, 200, 100); textSize(14);
                text(`Custo: ${cost}`, x + itemW - 15, itemY + 15);
                let canAfford = playerData.totalScore >= cost;
                drawButton(x + itemW - 95, itemY + itemH - 35, 80, 25, "Melhorar", canAfford ? color(100, 200, 100) : color(150,150,150), () => {
                    if(canAfford) handleShopAction(item, 'upgrade');
                });
            }
            textAlign(CENTER, CENTER);
        }
    }


    function handleShopAction(item, actionType) {
        soundManager.playSound('buttonClick');
        if (actionType === 'buy') {
            if (!item.purchased && playerData.totalScore >= item.cost) {
                playerData.totalScore -= item.cost;
                item.purchased = true;
                if (item.type === 'weapon') playerData.unlockedWeapons.push(item.id);
                if (item.type === 'skin') playerData.unlockedSkins.push(item.id);
            }
        } else if (actionType === 'equip') {
            if (item.purchased) {
                if (item.type === 'weapon') playerData.equippedWeapon = item.id;
                if (item.type === 'skin') playerData.equippedSkin = item.id;
            }
        } else if (actionType === 'upgrade') {
            let currentLevel = playerData.upgrades[item.id];
            if (currentLevel < item.maxLevel) {
                let cost = item.cost + (item.cost * currentLevel * 0.5);
                if (playerData.totalScore >= cost) {
                    playerData.totalScore -= cost;
                    playerData.upgrades[item.id]++;
                }
            }
        }
    }


    function drawAnimatedMenuBackground() {
        let t = frameCount * 0.005;
        let c1 = color(10, 20, 40 + sin(t) * 10);
        let c2 = color(40, 70, 100 + cos(t*0.7) * 20);
        for (let y = 0; y < height; y++) {
            let inter = map(y, 0, height, 0, 1);
            fill(lerpColor(c1, c2, inter));
            rect(0, y, width, 1);
        }
        drawStars(150, 1);
        fill(5, 10, 20, 150);
        beginShape();
        vertex(0, height);
        vertex(0, height - 150 + sin(t*2)*10);
        for(let x=0; x <= width; x+=40){
            vertex(x, height - 150 - noise(x*0.01, t*0.5)*80 + sin(x*0.05 + t)*15);
        }
        vertex(width, height - 150 + cos(t*1.5)*10);
        vertex(width, height);
        endShape(CLOSE);
    }

    function drawStars(numStars, baseAlphaFactor) {
        push();
        for (let i = 0; i < numStars; i++) {
            let x = (noise(i * 10.3, frameCount * 0.0005) * (width + 200) - 100);
            x = (x % (width + 200) + (width + 200)) % (width + 200) - 100;
            let y = noise(i * 25.7, frameCount * 0.0005) * height * 0.7;
            let s = noise(i * 0.1, frameCount * 0.01) * 2.5 + 0.5;
            let alpha = (100 + sin(frameCount * 0.02 + i * 0.5) * 155) * baseAlphaFactor;
            fill(255, 255, 220, alpha);
            ellipse(x, y, s, s);
        }
        pop();
    }

    function drawGame() {
        drawDefaultFarmBackground();
        if (slime && slime.abilities.includes('storm_caller')) {
            drawElectricStorm();
        }

        drawCrops(); drawAmmoPacks(); drawPowerUpItems(); drawRays(); drawSkyRays(); drawMiniSlimes();
        if (slime) {
            if (slime.drawFunction && typeof window[slime.drawFunction] === 'function') {
                window[slime.drawFunction](slime.x, slime.y, slime.size, false, 1, slime.color, slime);
            } else if (slime.isSlime) {
                slime.pulse += slime.pulseSpeed;
                let currentSlimeColor = slime.color;
                if (slime.hitTimer > 0) { currentSlimeColor = color(255, 100, 100, 200); }
                let pulseSize = slime.size * (1 + sin(slime.pulse) * (slime.health / slime.maxHealth * 0.1 + 0.05));
                slime.distortion = sin(frameCount * 0.15) * map(slime.health, slime.maxHealth, 0, 2, 8);
                drawSlime(slime.x, slime.y, pulseSize, false, 1, currentSlimeColor, slime);
            }
        }
        //Desenha os clones do Slime
        if (slime && slime.clones.length > 0) {
            drawSlimeClones();
        }
        if (hero) drawHero(hero.x, hero.y, hero.currentSize, {idle: !hero.isMoving}, hero);
        drawParticles(); drawEnemyShips(); drawGameUI();
    }

    function drawHero(x, y, size, options = {}, heroData) {
        if (!heroData) return;

        push();
        translate(x, y);
        if(options.facingLeft) scale(-1,1);

        let bobOffset = 0;
        if (heroData.isMoving || options.idle) {
            bobOffset = sin(frameCount * 0.15) * (options.idle ? 2 : 4);
            rotate(sin(frameCount * 0.2) * (options.idle ? 0.02 : 0.05));
        }
        translate(0, bobOffset);

        if (heroData.hitTimer > 0) {
            let hitFlashAlpha = map(heroData.hitTimer, 150, 0, 200, 0);
            fill(255,0,0, hitFlashAlpha);
            ellipse(0,0, size*1.2, size*1.3);
        }

        let bodyColor = heroData.color || color(0,120,255);
        let bodyGradient = drawingContext.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 0.5);
        bodyGradient.addColorStop(0, (heroData.shieldActive || heroData.hitTimer > 0) ? color(100,200,255,200).toString() : color(red(bodyColor)+50, green(bodyColor)+50, blue(bodyColor)+50).toString());
        bodyGradient.addColorStop(1, (heroData.shieldActive || heroData.hitTimer > 0) ? color(0,80,150,150).toString() : bodyColor.toString());
        drawingContext.fillStyle = bodyGradient;
        ellipse(0, 0, size, size * 1.1);

        let eyeX = size * 0.15; let eyeY = -size * 0.1;
        let eyeSizeOuter = size * 0.25; let eyeSizeInner = size * 0.12;
        fill(255); ellipse(eyeX, eyeY, eyeSizeOuter, eyeSizeOuter * 1.2);
        fill(50, 50, 100); ellipse(eyeX + sin(frameCount*0.05)*2, eyeY + cos(frameCount*0.05)*2, eyeSizeInner, eyeSizeInner*1.1);
        fill(255,255,255,200); ellipse(eyeX + eyeSizeInner*0.2, eyeY - eyeSizeInner*0.2, eyeSizeInner*0.4, eyeSizeInner*0.4);

        
        if (heroData.skin === 'farmer_skin') {
            fill(200, 150, 100);
            ellipse(0, -size * 0.55, size * 0.8, size * 0.3);
            fill(180, 130, 80);
            rect(-size*0.2, -size*0.5, size*0.4, size*0.2, 3);
            fill(100, 70, 50);
            rect(-size*0.3, -size*0.1, size*0.05, size*0.5);
            rect(size*0.25, -size*0.1, size*0.05, size*0.5);
        } else if (heroData.skin === 'vaqueiro_skin') {
            fill(139,69,19);
            ellipse(0, -size*0.5, size*0.9, size*0.25);
            arc(0, -size*0.5, size*0.5, size*0.4, PI, TWO_PI);
        } else if (heroData.skin === 'astro_skin') {
            fill(200, 210, 220);
            ellipse(0, 0, size * 1.1, size * 1.2); // Capacete
            fill(20, 30, 40, 180);
            ellipse(0, -size*0.1, size * 0.8, size * 0.9); // Visor
            fill(255,255,255,50);
            ellipse(-size*0.15, -size*0.2, size*0.2, size*0.2); // Reflexo
        }


        let gunLength = size * 0.5; let gunWidth = size * 0.2;
        let gunX = size * 0.25;
        let gunY = 0;

    
        if (heroData.weapon === 'ray_gun') {
            fill(100, 180, 255); rect(gunX, gunY - gunWidth * 0.3, gunLength, gunWidth*0.6, 5);
            fill(200, 255, 255); ellipse(gunX + gunLength, gunY, gunWidth * 0.8, gunWidth * 0.5);
        } else if (heroData.weapon === 'fire_thrower') {
            fill(200, 80, 0); rect(gunX, gunY - gunWidth * 0.4, gunLength*0.8, gunWidth*0.8, 5);
            fill(255, 150, 0); ellipse(gunX + gunLength*0.8, gunY, gunWidth, gunWidth*0.7);
        } else if (heroData.weapon === 'ice_beam') {
            fill(150, 200, 220); rect(gunX, gunY - gunWidth*0.35, gunLength*0.9, gunWidth*0.7, 5);
            fill(220, 240, 250); ellipse(gunX + gunLength*0.9, gunY, gunWidth*0.9, gunWidth*0.6);
        } else if (heroData.weapon === 'grenade_launcher') {
            fill(80, 100, 80); rect(gunX, gunY - gunWidth * 0.6, gunLength * 0.7, gunWidth * 1.2, 5);
            fill(120, 140, 120); rect(gunX - gunLength * 0.1, gunY - gunWidth*0.2, gunLength, gunWidth*0.4,3);
        } else { // default_weapon
            fill(100, 120, 150); rect(gunX, gunY - gunWidth * 0.5, gunLength, gunWidth, 5);
            fill(150, 170, 200); ellipse(gunX + gunLength, gunY, gunWidth * 1.2, gunWidth * 0.8);
        }

        if (heroData.shieldActive) {
            let shieldMaxTime = (hero.lastManualShieldTime + HERO_MANUAL_SHIELD_COOLDOWN > millis()) ? HERO_MANUAL_SHIELD_DURATION : HERO_POWERUP_SHIELD_DURATION;
            let shieldAlpha = map(heroData.shieldTime, shieldMaxTime, 0, 200, 50);
            shieldAlpha = max(shieldAlpha, 50 + sin(frameCount*0.3)*50);
            fill(red(heroData.shieldColor), green(heroData.shieldColor), blue(heroData.shieldColor), shieldAlpha);
            stroke(red(heroData.shieldColor)+50, green(heroData.shieldColor)+50, blue(heroData.shieldColor)+50, shieldAlpha + 50);
            strokeWeight(2 + sin(frameCount*0.2)*1);
            ellipse(0,0, size * 1.6, size * 1.6);
            noStroke();
        }
        pop();
    }

    function drawSlime(x, y, size, isCutscene, appearProgress = 1, dynamicColor, slimeData) {
        if (!slimeData) return;

        push();
        translate(x, y);
        let baseAlpha = isCutscene ? lerp(0, 220, appearProgress) : 220;
        if (slimeData.isInvisible) baseAlpha *= 0.3;
        let actualColor = dynamicColor || slimeData.color;

        if (slimeData.type === 'intergalactic_slime') {
            for (let k = 0; k < 5; k++) {
                let distortRadius = size * (1.5 + k * 0.2) * (1 + sin(frameCount * 0.02 + k) * 0.1);
                let distortColor = color(random(50, 200), random(50,100), random(150,255), (30 - k*5) * (baseAlpha/220) );
                noFill();
                strokeWeight(random(1,3));
                stroke(distortColor);
                beginShape();
                for (let ang = 0; ang < TWO_PI; ang += PI / 10) {
                    let rOff = noise(cos(ang) + frameCount * 0.01, sin(ang) + frameCount * 0.01, k*0.1) * 30 * appearProgress;
                    let sx = cos(ang) * (distortRadius + rOff);
                    let sy = sin(ang) * (distortRadius + rOff);
                    vertex(sx, sy);
                }
                endShape(CLOSE);
            }
            noStroke();
        }


        for (let i = 0; i < 5; i++) {
            let s = size * (1 - i * 0.15);
            let waveOffset = sin(frameCount * (0.05 + i * 0.01) + i) * (slimeData.distortion + i * 0.5);
            let layerAlpha = baseAlpha * (1 - i * 0.2);
            let r = red(actualColor) - i * 10;
            let g = green(actualColor) - i * 15;
            let b = blue(actualColor) - i * 10;
            if (slimeData.type === 'intergalactic_slime') {
                r = lerp(r, random(50,150), 0.3 + sin(frameCount*0.05 + i)*0.2);
                g = lerp(g, random(0,80), 0.3 + cos(frameCount*0.04 + i)*0.2);
                b = lerp(b, random(100,200), 0.3 + sin(frameCount*0.06 + i)*0.2);
            }
            fill(r, g, b, layerAlpha);
            ellipse(waveOffset, sin(frameCount*0.03 + i)*2, s, s * (0.8 + sin(frameCount*0.07+i*0.2)*0.1));
        }

        if (size > 30 && appearProgress >= 1 && !slimeData.isInvisible) {
            let numEyes = 3 + Math.floor(gameState.level / 2); numEyes = Math.min(numEyes, 7);
            if (slimeData.type === 'intergalactic_slime') numEyes = 1;
            let eyeColorFill = color(255, 50, 50);
            let pupilColor = color(0);

            if (slimeData.type === 'fire') { eyeColorFill = color(255, 200, 0); pupilColor = color(150,0,0); }
            else if (slimeData.type === 'ice') { eyeColorFill = color(200, 220, 255); pupilColor = color(0,0,100); }
            else if (slimeData.type === 'electric') { eyeColorFill = color(255,255,150); pupilColor = color(50,50,0); }
            else if (slimeData.type === 'toxic') { eyeColorFill = color(50,200,50); pupilColor = color(100,0,100); }
            else if (slimeData.type === 'intergalactic_slime') {
                 eyeColorFill = color(255,0,150);
                 pupilColor = color(0,0,0);
            }


            for (let i = 0; i < numEyes; i++) {
                let angle = (TWO_PI / numEyes) * i + frameCount * 0.02;
                let eyeDist = size * 0.3 * (1 + sin(frameCount * 0.03 + i) * 0.1);
                let eyeX = cos(angle) * eyeDist;
                let eyeY = sin(angle) * eyeDist - size * 0.1;
                let eyeSize = size * 0.15 * (1 + cos(frameCount * 0.05 + i * 2) * 0.1);
                if (slimeData.type === 'intergalactic_slime') {
                    eyeX = 0; eyeY = -size*0.05; eyeSize = size*0.4;
                    drawingContext.shadowColor = color(255,0,255,200).toString();
                } else {
                    drawingContext.shadowColor = color(red(eyeColorFill),green(eyeColorFill),blue(eyeColorFill),150).toString();
                }
                drawingContext.shadowBlur = 10;
                fill(eyeColorFill); ellipse(eyeX, eyeY, eyeSize, eyeSize * 1.2);
                drawingContext.shadowBlur = 0;
                fill(pupilColor); ellipse(eyeX + sin(frameCount*0.1+i)*1, eyeY + cos(frameCount*0.1+i)*1, eyeSize * 0.4, eyeSize * 0.6);
            }
        }

        if (slimeData.type === 'electric' && !isCutscene && !slimeData.isInvisible) {
            for(let i=0; i<3; i++){
                stroke(255,255,100, random(100,200)); strokeWeight(random(1,3));
                let angle = random(TWO_PI); let len = size * 0.6;
                line(0,0, cos(angle)*len, sin(angle)*len);
                if(random() < 0.3) line(cos(angle)*len, sin(angle)*len, cos(angle)*len + random(-10,10), sin(angle)*len + random(-10,10));
            }
            noStroke();
        }
        if (slimeData.type === 'rock_armor' && slimeData.abilities.includes('rock_armor') && !isCutscene) {
            for(let i=0; i<5; i++){
                fill(100,80,60, 200);
                let rockSize = size * random(0.1, 0.25);
                let rockAngle = random(TWO_PI);
                let rockDist = size * random(0.3, 0.45);
                ellipse(cos(rockAngle)*rockDist, sin(rockAngle)*rockDist, rockSize, rockSize*random(0.8,1.2));
            }
        }


        if ((isCutscene || (slimeData.health < slimeData.maxHealth * 0.3 && slimeData.health > 0)) && !slimeData.isInvisible) {
            let auraAlpha = isCutscene ? lerp(0, 80, appearProgress) : 50 + sin(frameCount*0.1)*30;
            drawingContext.shadowBlur = 30;
            let auraShadowColor = (slimeData.type === 'fire') ? color(255,150,0,100) : (slimeData.type === 'ice') ? color(150,200,255,100) : color(green(actualColor), 255, green(actualColor),100);
            if(slimeData.type === 'intergalactic_slime') auraShadowColor = color(150,50,255,120);
            drawingContext.shadowColor = auraShadowColor.toString();
            fill(red(actualColor), green(actualColor), blue(actualColor), auraAlpha * 0.5);
            ellipse(0, 0, size * 1.6, size * 1.5);
            drawingContext.shadowBlur = 0;
        }

        if (slimeData.shieldActive) {
            let shieldCurrentAlpha = lerp(80, 200, slimeData.shieldHealth / slimeData.shieldMaxHealth);
            shieldCurrentAlpha = max(shieldCurrentAlpha, 80 + sin(frameCount*0.25)*60);
            if (slimeData.isInvisible) shieldCurrentAlpha *=0.3;
            let shieldDisplayColor = slimeData.shieldColor;
            if(slimeData.hitTimer > 0 && slimeData.shieldActive) {
                shieldDisplayColor = color(255,255,255, 220);
            }
            fill(red(shieldDisplayColor), green(shieldDisplayColor), blue(shieldDisplayColor), shieldCurrentAlpha);
            stroke(red(shieldDisplayColor)+50, green(shieldDisplayColor)+50, blue(shieldDisplayColor)+50, shieldCurrentAlpha + 50);
            strokeWeight(3 + sin(frameCount*0.2)*1.5);
            ellipse(0, 0, size * 1.5 + sin(frameCount*0.15)*8, size * 1.4 + cos(frameCount*0.15)*8);
            noStroke();
        }
        pop();
    }

    function drawNaveColossal(x, y, size, isCutscene, appearProgress = 1, dynamicColor, naveData) {
        if (!naveData) return;
        push();
        translate(x,y);

        let mainNaveColor = naveData.hitTimer > 0 && !naveData.shieldActive ? color(255,100,100,220) : naveData.color;
        fill(mainNaveColor);
        rectMode(CENTER);
        beginShape();
        vertex(-size * 0.8, -size * 0.3);
        vertex(size * 0.8, -size * 0.3);
        vertex(size * 0.6, size * 0.4);
        vertex(-size * 0.6, size * 0.4);
        endShape(CLOSE);

        fill(red(mainNaveColor)*0.7, green(mainNaveColor)*0.7, blue(mainNaveColor)*0.7);
        rect(0, -size*0.1, size*0.4, size*0.3, 5);

        beginShape();
        vertex(-size*0.7, -size*0.2); vertex(-size*1.1, 0); vertex(-size*0.7, size*0.2);
        endShape(CLOSE);
        beginShape();
        vertex(size*0.7, -size*0.2); vertex(size*1.1, 0); vertex(size*0.7, size*0.2);
        endShape(CLOSE);

        fill(80,80,100);
        rect(-size*0.5, size*0.1, size*0.15, size*0.3);
        rect(size*0.5, size*0.1, size*0.15, size*0.3);
        ellipse(0, -size*0.35, size*0.2, size*0.1);

        for(let i=0; i<3; i++){
            let thrustX = (-size*0.3) + i * (size*0.3);
            let thrustSize = size*0.1 * (1 + sin(frameCount*0.2 + i)*0.3);
            fill(255, 150 + random(100), 0, 200 + random(55));
            ellipse(thrustX, size*0.45, thrustSize, thrustSize*1.8);
        }
        rectMode(CORNER);

        if (naveData.shieldActive) {
            let shieldAlpha = lerp(50, 150, naveData.shieldHealth / naveData.shieldMaxHealth);
            shieldAlpha = max(shieldAlpha, 50 + sin(frameCount*0.2)*50);
            let shieldCol = naveData.shieldColor || color(150,150,255,100);
            if(naveData.hitTimer > 0) shieldCol = color(255,255,255,180);

            noFill();
            strokeWeight(4 + sin(frameCount*0.15)*2);
            stroke(red(shieldCol), green(shieldCol), blue(shieldCol), shieldAlpha);
            beginShape();
            for(let i=0; i < 7; i++){
                let angle = TWO_PI/6 * i;
                let shieldRadiusX = size * 1.1 + sin(frameCount*0.1+i)*5;
                let shieldRadiusY = size * 0.6 + cos(frameCount*0.1+i)*5;
                vertex(cos(angle)*shieldRadiusX, sin(angle)*shieldRadiusY);
            }
            endShape(CLOSE);
            noStroke();
        }
        pop();
    }


    function drawDefaultFarmBackground() {
        let t = frameCount * 0.002;
        let c1Sky = color(40 + sin(t) * 20, 80 + cos(t * 0.7) * 30, 150 + sin(t * 1.2) * 40);
        let c2Sky = color(120 + cos(t * 1.5) * 30, 180 + sin(t) * 40, 240 + cos(t * 0.5) * 15);
        for (let y = 0; y < height * 0.6; y++) {
            let inter = map(y, 0, height * 0.6, 0, 1);
            fill(lerpColor(c1Sky, c2Sky, pow(inter, 0.7)));
            rect(0, y, width, 1);
        }
        drawStars(30, 0.7);

        fill(70, 100, 130, 180);
        beginShape();
        vertex(0, height * 0.6);
        let mountainDetail = 0.008;
        for (let x_coord = 0; x_coord <= width; x_coord += 30) {
            let yOff = noise(x_coord * mountainDetail, frameCount * 0.001) * 120;
            vertex(x_coord, height * 0.6 - 80 - yOff + sin(x_coord*0.02 + t*2)*10);
        }
        vertex(width, height * 0.6);
        endShape(CLOSE);
        fill(150, 180, 200, 50); rect(0, height*0.6-150, width, 150);

        fill(100, 160, 70); rect(0, height * 0.6, width, height * 0.4);
        fill(120, 100, 80); rect(0, height * 0.7, width, height * 0.3);

        drawBarn(barn.x, barn.y, barn.w, barn.h, barn.health);
        drawSilo(farmSilo.x, farmSilo.y, farmSilo.baseWidth, farmSilo.baseHeight, farmSilo.topHeight, farmSilo.health);

        stroke(90, 70, 50, 80); strokeWeight(1.5);
        for (let y_line = height * 0.75; y_line < height; y_line += 25) {
            line(0, y_line + noise(y_line, frameCount * 0.01) * 5, width, y_line + noise(y_line+100, frameCount * 0.01) * 5);
        }
        noStroke();

        if (hero && hero.canReloadAtSilo && farmSilo.health > 0) {
            fill(255,255,0, 200 + sin(frameCount*0.1)*55); textSize(14);
            text("Pressione 'R' para recarregar!", farmSilo.x + farmSilo.baseWidth/2, farmSilo.y - 20);
            if (millis() - farmSilo.lastUsedTime < SILO_RELOAD_COOLDOWN){
                let cooldownProgress = (millis() - farmSilo.lastUsedTime) / SILO_RELOAD_COOLDOWN;
                fill(100,100,100,150); rect(farmSilo.x, farmSilo.y + farmSilo.baseHeight + 5, farmSilo.baseWidth, 10);
                fill(50,200,50,200); rect(farmSilo.x, farmSilo.y + farmSilo.baseHeight + 5, farmSilo.baseWidth * cooldownProgress, 10);
            }
        }
    }

    function drawElectricStorm() {
        fill(20, 20, 40, 150); // Dark overlay
        rect(0, 0, width, height);

        for (let cloud of electricClouds) {
            push();
            translate(cloud.x, cloud.y);
            let baseColor = color(80, 80, 100, 220);
            for (let i = 0; i < 5; i++) {
                let cSize = cloud.size * (1 - i * 0.1);
                let pulse = sin(frameCount * 0.1 + i * PI / 2) * 5;
                let flash = random() < 0.05 ? color(255, 255, 150, 150) : color(0,0,0,0);
                fill(red(baseColor) + pulse, green(baseColor) + pulse, blue(baseColor) + pulse, 220 - i*20);
                ellipse(random(-20,20), random(-10,10), cSize, cSize * 0.6);
                fill(flash);
                ellipse(random(-20,20), random(-10,10), cSize, cSize * 0.6);
            }
            pop();
        }
    }

    function drawBarn(x, y, w, h, health) {
        push(); translate(x,y);
        let healthRatio = health / 100;
        // Telhado
        fill(100, 100, 100);
        beginShape(); vertex(-10, 0); vertex(w + 10, 0); vertex(w * 0.7, -h * 0.4); vertex(w * 0.3, -h * 0.4); endShape(CLOSE);
        // Parede
        fill(180, 80, 80); rect(0, 0, w, h);
        // Porta
        fill(120, 60, 60); rect(w * 0.3, h * 0.4, w * 0.4, h * 0.6);
        stroke(100,40,40); strokeWeight(4); line(w*0.3, h*0.4, w*0.7, h); line(w*0.7, h*0.4, w*0.3, h); noStroke();
        // Janela
        fill(50,30,30); ellipse(w*0.5, -h*0.15, w*0.2, w*0.2);

        // Danos
        if (healthRatio < 1) {
            fill(0,0,0, 150 * (1-healthRatio));
            for(let i=0; i< (1-healthRatio) * 10; i++){
                rect(random(w), random(h), random(5,20), random(5,20));
                ellipse(random(w*0.7, w+10), random(-h*0.4, 0), random(5,15), random(5,15));
            }
        }
        pop();
    }

    function drawSilo(x, y, baseWidth, baseHeight, topHeight, health) {
        push(); translate(x,y);
        let healthRatio = health / 100;
        // Corpo
        if(health > 0) fill(farmSilo.colorBase);
        else fill(50,50,50); // Destruído
        rect(0, 0, baseWidth, baseHeight);
        // Topo
        if(health > 0) fill(farmSilo.colorTop);
        else fill(80,20,20);
        beginShape(); vertex(0,0); vertex(baseWidth,0); vertex(baseWidth/2, -topHeight); endShape(CLOSE);
        // Linhas
        stroke(150,150,140); strokeWeight(2);
        for(let i=1; i<4; i++){ line(0, baseHeight * (i/4), baseWidth, baseHeight * (i/4)); }
        noStroke();
        // Danos
        if (healthRatio < 1 && health > 0) {
            fill(20,20,20, 180 * (1-healthRatio));
            for(let i=0; i< (1-healthRatio) * 15; i++){
                ellipse(random(baseWidth), random(baseHeight), random(3,15), random(3,15));
            }
        }
        pop();
    }

    function drawCrops() {
        for (let crop of crops) {
            drawDetailedCrop(crop);
        }
    }

    function drawDetailedCrop(crop) {
        push();
        translate(crop.x, crop.y);
        rotate(sin(frameCount * 0.04 + crop.sway) * 0.12);

        let currentCropColor = crop.infected ?
            lerpColor(crop.originalColor, color(180, 40, 180, 220), crop.infectionProgress) :
            crop.originalColor;

        if (crop.type === 'corn') {
            // Stalk
            fill(80, 180, 80);
            rect(-3, 0, 6, -crop.size * 2);
            // Leaves
            fill(100, 200, 100);
            arc(-3, -crop.size*0.8, 30, 30, PI, PI + HALF_PI);
            arc(3, -crop.size, 30, 30, HALF_PI, PI);
            // Corn cob
            fill(255, 220, 50);
            ellipse(0, -crop.size * 1.5, crop.size*0.6, crop.size);
        } else if (crop.type === 'wheat') {
            // Stalk
            fill(200, 180, 100);
            rect(-2, 0, 4, -crop.size * 1.8);
            // Head
            fill(240, 220, 120);
            for(let i = 0; i < 5; i++) {
                ellipse(0, -crop.size*1.8 - i*4, 8, 5);
            }
        } else { // Tomato
            fill(50, 150, 50);
            rect(-2, -5, 4, -crop.size);
            fill(220, 50, 50);
            ellipse(0, 0, crop.size, crop.size);
            fill(0,100,0);
            for(let i = 0; i < 5; i++){
                push();
                rotate(i * TWO_PI / 5);
                triangle(0,-crop.size/2, -3, -crop.size/2-5, 3, -crop.size/2-5);
                pop();
            }
        }

        if (crop.infected && crop.infectionProgress >= 1) {
            let pulseFactor = 1 + sin(frameCount * 0.25 + crop.sway) * 0.25;
            fill(180, 40, 180, 80 + sin(frameCount*0.3)*30);
            ellipse(0, 0, crop.size * pulseFactor * 1.5, crop.size * pulseFactor * 1.5);
        }
        pop();
    }

    function drawRays() {
        for (let ray of rays) {
            strokeWeight(ray.width + sin(frameCount*0.2)*2);
            // MODIFICADO: Adicionado caso para o novo feixe de dreno
            let rayColorBase = color(100, 255, 100, 180 + sin(frameCount*0.3)*50);
            if (ray.type === 'fire') rayColorBase = color(255, 150, 0, 200 + sin(frameCount*0.3)*55);
            if (ray.type === 'ice') rayColorBase = color(150, 200, 255, 200 + sin(frameCount*0.3)*55);
            if (ray.type === 'electric_shock') rayColorBase = color(255,255,100,200 + sin(frameCount*0.4)*55);
            if (ray.type === 'toxic_stream') rayColorBase = color(100,200,50,180 + sin(frameCount*0.3)*50);
            if (ray.type === 'galactic_beam') rayColorBase = color(200,100,255,220 + sin(frameCount*0.5)*35);
            if (ray.type === 'cosmic_ray') rayColorBase = color(220,150,255,220 + sin(frameCount*0.6)*35);
            if (ray.type === 'mini_laser') rayColorBase = color(255,0,0, 200 + sin(frameCount*0.6)*55);
            if (ray.type === 'ancient_beam') rayColorBase = color(180,180,180, 210 + sin(frameCount*0.4)*45);
            if (ray.type === 'drain_beam') rayColorBase = color(180, 50, 220, 150 + sin(frameCount*0.4)*50);


            stroke(rayColorBase);
            line(ray.x1, ray.y1, ray.x2, ray.y2);

            drawingContext.shadowBlur = 20;
            let shadowColor = color(red(rayColorBase)+50, green(rayColorBase)+50, blue(rayColorBase)+50, 150);
            drawingContext.shadowColor = shadowColor.toString();
            strokeWeight(ray.width * 0.5 + sin(frameCount*0.25)*1);
            stroke(red(rayColorBase)+80, green(rayColorBase)+80, blue(rayColorBase)+80, alpha(rayColorBase)+35);
            line(ray.x1, ray.y1, ray.x2, ray.y2);
            drawingContext.shadowBlur = 0;

            fill(red(rayColorBase)+100, green(rayColorBase)+100, blue(rayColorBase)+100, 230); noStroke();
            ellipse(ray.x2, ray.y2, 15, 15);

            if (frameCount % 2 === 0) {
                let alongRay = random();
                createParticles(lerp(ray.x1, ray.x2, alongRay), lerp(ray.y1, ray.y2, alongRay), 1, color(red(rayColorBase),green(rayColorBase),blue(rayColorBase),120), {sizeRange: [2,4], life: 15});
            }
        }
        noStroke();
    }

    function drawSkyRays() {
        for (let ray of skyRays) {
            let rayBaseColor = color(255,0,0);
            if (ray.type === 'meteor') rayBaseColor = color(255,150,0);
            if (ray.type === 'blizzard_marker') rayBaseColor = color(100,150,255);
            if (ray.type === 'lightning_marker' || ray.type === 'lightning_bolt') rayBaseColor = color(255,255,100);
            if (ray.type === 'toxic_fallout_marker') rayBaseColor = color(150,0,150);


            if (ray.warningTime > 0) {
                let warningProgress = 1 - (ray.warningTime / ray.maxWarningTime);
                let baseSize = lerp(20, 80, warningProgress);
                let ringSize = baseSize * (1 + sin(frameCount * 0.3 + ray.x) * 0.3);
                let alpha = lerp(50, 220, warningProgress);

                fill(red(rayBaseColor), green(rayBaseColor), blue(rayBaseColor), alpha * 0.3);
                ellipse(ray.x, height - 10, ringSize, ringSize * 0.25);
                stroke(red(rayBaseColor), green(rayBaseColor), blue(rayBaseColor), alpha);
                strokeWeight(lerp(1, 4, warningProgress)); noFill();
                ellipse(ray.x, height - 10, baseSize, baseSize*0.15); noStroke();

                let chargeY = lerp(0, height - baseSize*0.1, warningProgress);
                fill(red(rayBaseColor), green(rayBaseColor)+random(50,100), blue(rayBaseColor), alpha*0.7);
                ellipse(ray.x, chargeY, 10 * warningProgress, 20 * warningProgress);

            } else if (ray.lifetime > 0) {
                let lifeProgress = ray.lifetime / (ray.maxLifetime || 500);
                let rayWidth = lerp(ray.maxWidth || 15, 2, lifeProgress);
                let rayAlpha = lerp(220, 50, 1 - lifeProgress);

                let effectiveRayColor = color(100,255,100);
                if(ray.type === 'meteor') effectiveRayColor = color(255,100,0);
                if(ray.type === 'blizzard_column') effectiveRayColor = color(180,220,255);
                if(ray.type === 'lightning_bolt') effectiveRayColor = color(255,255,150);
                if(ray.type === 'nave_laser_beam') effectiveRayColor = color(255,50,50);
                if(ray.type === 'solar_flare_beam') effectiveRayColor = color(255,220,50);


                stroke(red(effectiveRayColor), green(effectiveRayColor), blue(effectiveRayColor), rayAlpha); strokeWeight(rayWidth);
                line(ray.x, 0, ray.x, height);

                drawingContext.shadowBlur = 25;
                drawingContext.shadowColor = color(red(effectiveRayColor)+50, green(effectiveRayColor)+50, blue(effectiveRayColor)+50).toString();
                stroke(red(effectiveRayColor)+80, green(effectiveRayColor)+80, blue(effectiveRayColor)+80, rayAlpha + 30); strokeWeight(rayWidth * 0.4);
                line(ray.x, 0, ray.x, height);
                drawingContext.shadowBlur = 0;

                if (frameCount % 3 === 0) {
                    createParticles(ray.x + random(-rayWidth, rayWidth), random(height), 1, color(red(effectiveRayColor),green(effectiveRayColor),blue(effectiveRayColor),150), {sizeRange: [3,6], life: 20});
                }
                fill(red(effectiveRayColor),green(effectiveRayColor),blue(effectiveRayColor), rayAlpha * 0.5);
                ellipse(ray.x, height-5, rayWidth*3, rayWidth);
            }
        }
        noStroke();
    }

    function drawParticles() {
        for (let p of particles) {
            push();
            translate(p.x, p.y);
            let alpha = lerp(0, p.baseAlpha || 255, p.life / p.initialLife);
            let particleColor = p.color;
            if(p.color && typeof p.color.setAlpha === 'function'){
                particleColor = color(red(p.color), green(p.color), blue(p.color), alpha);
            } else {
                particleColor = `rgba(${red(color(255,255,255))},${green(color(255,255,255))},${blue(color(255,255,255))},${alpha/255})`;
            }

            if (p.isProjectile) {
                drawingContext.shadowBlur = 12;
                // MODIFICADO: adicionado caso para projétil espectral
                let shadowColorValue = p.isEnemyProjectile ? color(255,100,100,150) : p.projectileColor ? color(red(p.projectileColor),green(p.projectileColor),blue(p.projectileColor),150) : color(255, 255, 150,150);
                if (p.projectileType === 'spectral_bolt') shadowColorValue = color(220, 220, 255, 150);

                drawingContext.shadowColor = shadowColorValue.toString();
                fill(particleColor);

                if (p.weaponType === 'fire_thrower') {
                    ellipse(0,0, p.size * (1 + sin(frameCount*0.5 + p.x)*0.3), p.size * (1 + cos(frameCount*0.5 + p.y)*0.3) );
                } else if (p.weaponType === 'ice_beam') {
                    rectMode(CENTER);
                    rotate(p.angle || 0);
                    rect(0,0, p.size*0.7, p.size*1.5, 2);
                    rectMode(CORNER);
                } else if (p.projectileType === 'nave_missile') {
                    rectMode(CENTER);
                    rotate(atan2(p.vy, p.vx) + PI/2);
                    fill(180,180,200); rect(0,0, p.size*0.8, p.size*1.5,3);
                    fill(255,150,0); ellipse(0, p.size*0.75, p.size*0.5, p.size*0.5);
                    rectMode(CORNER);
                } else if (p.projectileType === 'rock') {
                    ellipse(0,0, p.size, p.size*0.8);
                } else if (p.projectileType === 'crystal_shard') {
                    beginShape();
                    for(let k=0; k<5; k++){
                        let angle = TWO_PI/5 * k + frameCount*0.1;
                        vertex(cos(angle)*p.size/2, sin(angle)*p.size/2);
                    }
                    endShape(CLOSE);
                }
                 else {
                    ellipse(0,0, p.size, p.size * (p.isEnemyProjectile ? 1.5 : 1.2) );
                    if(p.isEnemyProjectile){
                        fill(red(p.color), green(p.color), blue(p.color), alpha * 0.7);
                        triangle(-p.size/2, 0, p.size/2, 0, 0, p.size);
                    } else if (p.weaponType !== 'ray_gun') {
                        fill(red(p.color), green(p.color), blue(p.color), alpha * 0.5);
                        ellipse(0, -p.size*0.5, p.size*0.5, p.size);
                    }
                }
                drawingContext.shadowBlur = 0;
            } else {
                fill(particleColor);
                if(p.isSpark){
                    stroke(255,255,200, alpha * 0.7); strokeWeight(1);
                    line(-p.size/2, 0, p.size/2, 0);
                    line(0, -p.size/2, 0, p.size/2);
                    noStroke();
                } else if (p.isConfetti) {
                    rotate(p.angle);
                    rect(-p.size/2, -p.size/4, p.size, p.size/2);
                } else if (p.isBlackHoleParticle) {
                    let swirlAngle = atan2(p.y - p.bhY, p.x - p.bhX) + PI/2 + p.swirlOffset;
                    p.x = p.bhX + cos(swirlAngle) * p.distToBh;
                    p.y = p.bhY + sin(swirlAngle) * p.distToBh;
                    p.distToBh *= 0.98;
                    ellipse(0,0,p.size,p.size);
                } else if (p.isRealityTear) {
                    noFill();
                    strokeWeight(random(1,3));
                    stroke(p.color);
                    for(let k=0; k<3; k++){
                        line(random(-p.size, p.size), random(-p.size, p.size), random(-p.size, p.size), random(-p.size, p.size));
                    }
                    noStroke();
                }
                else {
                    ellipse(0, 0, p.size, p.size);
                }
            }
            pop();
        }
    }

    function drawGameUI() {
        fill(20, 30, 50, 180); stroke(80, 100, 150, 200); strokeWeight(2);
        rect(10, 10, 230, 170, 15); noStroke();
        drawingContext.shadowBlur = 5; drawingContext.shadowColor = 'rgba(0,0,0,0.7)';
        fill(230, 240, 255); textSize(18); textAlign(LEFT, TOP);

        if(hero){
            text(`💣 MUNIÇÃO: ${hero.ammo} / ${hero.maxAmmo}`, 25, 25);
            text(`❤️ SAÚDE:`, 25, 60);
            drawHealthBar(25, 85, 180, 22, hero.health / hero.maxHealth, color(50, 220, 50), color(220, 50, 50), nf(hero.health,0,0) + "/" + hero.maxHealth);

            let shieldCooldownProgress = (millis() - hero.lastManualShieldTime) / HERO_MANUAL_SHIELD_COOLDOWN;
            fill(230, 240, 255);
            text(`ESCUDO (F):`, 25, height - 65);
            if (shieldCooldownProgress >= 1) {
                fill(100,200,255, 200);
                text(`PRONTO`, 120, height - 65);
            }
            fill(50,50,80,150); rect(25, height - 45, 180, 10, 3);
            fill(100,200,255,200); rect(25, height - 45, 180 * min(1, shieldCooldownProgress), 10, 3);

            if (hero.shieldActive) {
                fill(100, 200, 255, 220);
                text(`🛡️ ESCUDO ATIVO!`, 25, height - 25);
            }
        }

        let healthyCrops = crops.filter(c => !c.infected).length; let totalCrops = crops.length;
        text(`🌿 PLANTAÇÕES:`, 25, 120);
        drawHealthBar(25, 145, 180, 22, totalCrops > 0 ? healthyCrops / totalCrops : 0, color(100, 200, 100), color(180, 100, 180), healthyCrops + "/" + totalCrops);

        textAlign(RIGHT, TOP); textSize(20); fill(255, 220, 150);
        text(`NÍVEL: ${gameState.level}`, width - 25, 25);
        text(`PONTOS: ${gameState.score}`, width - 25, 55);

        if (slime && slime.health > 0) {
            textAlign(CENTER, TOP);
            fill(255,100,100); textSize(16);
            text(`BOSS: ${slime.name}`, width/2, 10);
            drawHealthBar(width/2 - 150, 30, 300, 20, slime.health / slime.maxHealth, slime.color, color(red(slime.color)*0.4, green(slime.color)*0.4, blue(slime.color)*0.4), "");
            if (slime.shieldActive) {
                fill(180,150,255); textSize(14);
                text("ESCUDO DO BOSS", width/2, 55);
                drawHealthBar(width/2 - 125, 75, 250, 15, slime.shieldHealth / slime.shieldMaxHealth, slime.shieldColor, color(red(slime.shieldColor)*0.3,green(slime.shieldColor)*0.3,blue(slime.shieldColor)*0.3), "");
            }
        }
        drawingContext.shadowBlur = 0; textAlign(CENTER, CENTER);
    }

    function drawHealthBar(x, y, w, h, ratio, goodColor, badColor, displayText = "") {
        push();
        fill(30, 30, 40, 200); rect(x, y, w, h, 8);
        let barColor = lerpColor(badColor, goodColor, ratio);
        fill(barColor); rect(x + 2, y + 2, max(0, (w - 4) * ratio), h - 4, 6);
        stroke(200, 220, 255, 150); strokeWeight(1.5); noFill(); rect(x, y, w, h, 8); noStroke();
        if (displayText) {
            fill(255); textSize(h * 0.6); textAlign(CENTER, CENTER);
            text(displayText, x + w / 2, y + h / 2 + 1);
        }
        pop();
    }

    function drawWinScreen() {
        drawAnimatedMenuBackground();
        if (frameCount % 2 === 0) {
            for (let i = 0; i < 3; i++) {
                particles.push({
                    x: random(width), y: random(-20, 0), vx: random(-2, 2), vy: random(1, 4),
                    size: random(8, 15), color: color(random(100,255),random(100,255),random(100,255), 200),
                    life: 120, initialLife: 120, isConfetti: true, angle: random(TWO_PI), spin: random(-0.1, 0.1), gravity: 0.03
                });
            }
        }
        updateParticles(); drawParticles();

        drawingContext.shadowBlur = 25; drawingContext.shadowColor = color(100, 255, 100).toString();
        fill(230, 255, 230); textSize(56); textStyle(BOLD);
        if (gameState.level -1 === FINAL_BOSS_LEVEL) { // Se acabou de vencer o boss final
            text("UNIVERSO SALVO!", width/2, height/2 - 120);
            fill(200,255,200); textSize(30); text("Você derrotou Zy'Glar!", width / 2, height / 2 - 60);
        } else {
            text("VITÓRIA ESMAGADORA!", width / 2, height / 2 - 120);
            fill(200,255,200); textSize(30); text(`Nível ${gameState.level-1} aniquilado!`, width / 2, height / 2 - 60);
        }
        drawingContext.shadowBlur = 0;

        textSize(24); text(`Pontuação da Partida: ${gameState.score}`, width/2, height/2 - 20);
        textSize(20); text(`Total de Pontos Acumulados: ${playerData.totalScore}`, width/2, height/2 + 10);


        let pulseAlpha = 180 + sin(frameCount * 0.15) * 75;
        fill(200, 255, 200, pulseAlpha); textSize(26);
        if (gameState.level -1 >= FINAL_BOSS_LEVEL) {
            text("Clique para ver os créditos finais!", width / 2, height / 2 + 70);
        } else {
            text("Clique para o PRÓXIMO DESAFIO!", width / 2, height / 2 + 70);
        }
    }

    function drawLoseScreen() {
        drawAnimatedMenuBackground();
        fill(180, 50, 50, 80 + sin(frameCount * 0.05) * 30); rect(0, 0, width, height);
        drawingContext.shadowBlur = 25; drawingContext.shadowColor = color(200, 50, 50).toString();
        fill(255, 200, 200); textSize(56); textStyle(BOLD);
        text("A FAZENDA CAIU...", width / 2, height / 2 - 100);
        drawingContext.shadowBlur = 0;
        fill(255, 180, 180); textSize(28); text("A gosma prevaleceu desta vez.", width / 2, height / 2 - 40);
        textSize(24); text(`Você alcançou o nível: ${gameState.level}`, width/2, height/2);
        textSize(20); text(`Pontos Ganhos na Partida: ${gameState.score}`, width/2, height/2 + 30);
        textSize(20); text(`Total de Pontos Acumulados: ${playerData.totalScore}`, width/2, height/2 + 60);


        let pulseAlpha = 180 + sin(frameCount * 0.15) * 75;
        fill(255, 200, 200, pulseAlpha); textSize(26);
        text("Clique para TENTAR NOVAMENTE!", width / 2, height / 2 + 100);
    }

    function drawInstructions() {
        drawAnimatedMenuBackground();
        drawingContext.shadowBlur = 15; drawingContext.shadowColor = color(100, 150, 255).toString();
        fill(220, 230, 255); textSize(44); textStyle(BOLD);
        text("COMO DEFENDER A FAZENDA", width / 2, 80);
        drawingContext.shadowBlur = 0;
        fill(230, 230, 240); textSize(19); textAlign(CENTER, TOP);
        let lineY = 150; const leading = 28;
        text("Use W,A,S,D ou as SETAS para mover o Agrinho.", width / 2, lineY); lineY += leading;
        text("Pressione 'F' para ativar um ESCUDO de 10 segundos.", width / 2, lineY); lineY += leading * 1.5;
        text("Clique com o MOUSE ou pressione ESPAÇO para atirar.", width / 2, lineY); lineY += leading;
        text("Seu objetivo: Destruir o Boss Gosma antes que ele infecte todas as plantações.", width / 10, lineY, width * 0.8, 100); lineY += leading * 2;
        text("MUNIÇÃO: Colete pacotes de naves ou use o SILO (tecla 'R').", width/9, lineY, width*0.8, 100); lineY += leading * 1.5;
        text("LOJA: Acumule pontos e visite a LOJA no menu para comprar armas e skins!", width/9, lineY, width*0.8, 100); lineY += leading * 2;
        text("BOSSES: Cada nível traz um Boss com poderes e aparências diferentes!", width/9, lineY, width*0.8, 100); lineY += leading * 2;
        drawButton(width / 2 - 100, height - 90, 200, 60, "VOLTAR", color(100, 120, 200), () => { gameState.current = 'menu'; soundManager.playSound('buttonClick'); });
        textAlign(CENTER, CENTER);
    }

    
    // drawCredits
   
    function drawCredits() {
        drawAnimatedMenuBackground();
        drawingContext.shadowBlur = 15; drawingContext.shadowColor = color(150, 100, 200).toString();
        fill(230, 220, 255); textSize(44); textStyle(BOLD);
        text("CRÉDITOS ESTELARES", width / 2, 80);
        drawingContext.shadowBlur = 0;
        fill(220, 220, 230); textSize(20); textAlign(CENTER, TOP);
        let lineY = 150; const leading = 30;
        text("Conceito e Código Original: Matheus Medina", width / 2, lineY); lineY += leading;
        text("Motor Gráfico: p5.js", width / 2, lineY); lineY += leading;
        text("Inspiração: Luta contra as pragas do Agro Brasileiro!", width / 2, lineY); lineY += leading * 1.5;
        text("Obrigado por jogar!", width/2, lineY + leading * 2);
        
        drawButton(width / 2 - 100, height - 90, 200, 60, "VOLTAR AO MENU", color(120, 100, 200), () => { 
           
            gameState.level = 1;
            gameState.introCutscenePlayed = false;
            gameState.finalBossIntroPlayed = false;
            gameState.current = 'menu'; 
            soundManager.playSound('buttonClick'); 
        });
        
        textAlign(CENTER, CENTER);
    }

    function drawButton(x, y, w, h, label, btnColor, action) {
        let isHover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
        let currentW = w; let currentH = h; let currentX = x; let currentY = y;

        if (isHover) {
            currentW = w * 1.05; currentH = h * 1.05;
            currentX = x - (currentW - w) / 2; currentY = y - (currentH - h) / 2;
        }
        if (isHover && mouseIsPressed) {
            currentW = w * 0.95; currentH = h * 0.95;
            currentX = x - (currentW - w) / 2; currentY = y - (currentH - h) / 2;
        }

        drawingContext.shadowBlur = isHover ? 15 : 8;
        drawingContext.shadowColor = 'rgba(0,0,0,0.4)';
        drawingContext.shadowOffsetX = isHover ? 4 : 2;
        drawingContext.shadowOffsetY = isHover ? 4 : 2;

        let c = color(btnColor);
        let r = red(c) + (isHover ? 20 : 0) - (mouseIsPressed && isHover ? 20 : 0);
        let g = green(c) + (isHover ? 20 : 0) - (mouseIsPressed && isHover ? 20 : 0);
        let b = blue(c) + (isHover ? 20 : 0) - (mouseIsPressed && isHover ? 20 : 0);
        fill(r,g,b);
        stroke(230, 240, 255, 200); strokeWeight(isHover ? 3 : 1.5);
        rect(currentX, currentY, currentW, currentH, 15);
        noStroke();
        drawingContext.shadowBlur = 0; drawingContext.shadowOffsetX = 0; drawingContext.shadowOffsetY = 0;

        fill(240, 250, 255); textSize(h * 0.35); textStyle(BOLD);
        textAlign(CENTER, CENTER); text(label, x + w / 2, y + h / 2 + 2); textStyle(NORMAL);

        if(!buttonActions) buttonActions = [];
        buttonActions.push({ x, y, w, h, action, label });
    }

    function updateGame() {
        if (gameState.current !== 'game') return; // Guard clause for entire game logic
    
        // OPÇÕES DE DEBUG
        if (debugMode) {
            if (debugOptions.infiniteLife && hero) {
                hero.health = hero.maxHealth;
            }
            if (debugOptions.disableAI) {
                
                updateHero(); // 
                updateParticles();
                checkCollisions(); 
                return; 
            }
        }
        // CABO A SEÇÃO DE DEBUG
        
        if(hero) updateHero();
        if(slime) updateSlime();
        // Att os clones
        if(slime && slime.clones.length > 0) {
            updateSlimeClones();
        }
        updateRays(); updateSkyRays(); updateParticles(); updateCrops(); updateEnemyShips(); updateMiniSlimes(); updateAmmoPacks(); updatePowerUpItems();
        checkCollisions();
        applySlimeAbilities();

        if (millis() - lastMiniSlimeSpawn > MINI_SLIME_SPAWN_INTERVAL) {
            if (miniSlimes.length < MAX_MINI_SLIMES) {
                spawnMiniSlime();
            }
            lastMiniSlimeSpawn = millis();
        }

        if (slime && slime.abilities.includes('storm_caller')) {
            updateElectricClouds();
        }

        if (slime && slime.health > 0) {
            let slimeHealthRatio = slime.health / slime.maxHealth;

            if (slimeHealthRatio <= 0.75 && !slimeShieldActivated75) { activateSlimeShield(); slimeShieldActivated75 = true; }
            if (slimeHealthRatio <= 0.40 && !slimeShieldActivated40 && !slime.shieldActive) { activateSlimeShield(); slimeShieldActivated40 = true; }

            if (millis() - lastSlimeAttackTime > slimeAttackCooldown && !slime.shieldActive) {
                slimeBossAttack();
                lastSlimeAttackTime = millis();
                slimeAttackCooldown = (slime.type === 'nave_colossal' ? 4000 : 2500) - gameState.level * 100 + random(-300,300);
                slimeAttackCooldown = max(slime.type === 'nave_colossal' ? 1500 : 800, slimeAttackCooldown);
            }
            const bossAttackFunctions = slime.attackFunctions || [];
            const hasSkyAttack = bossAttackFunctions.some(fnName => fnName.toLowerCase().includes('sky') || fnName.toLowerCase().includes('meteor') || fnName.toLowerCase().includes('blizzard') || fnName.toLowerCase().includes('navemissile') || fnName.toLowerCase().includes('navelaser') || fnName.toLowerCase().includes('storm') || fnName.toLowerCase().includes('lightning') || fnName.toLowerCase().includes('cosmic') || fnName.toLowerCase().includes('spawnhelper'));

            if (hasSkyAttack && millis() - slime.lastSkyAttack > slime.skyAttackCooldown && !slime.shieldActive) {
                slimeBossSkyAttack();
                slime.lastSkyAttack = millis();
                slime.skyAttackCooldown = (slime.type === 'nave_colossal' ? 5000 : 3500) - gameState.level * 100 + random(1500);
                slime.skyAttackCooldown = max(slime.type === 'nave_colossal' ? 2000 : 1500, slime.skyAttackCooldown);
            }

        }

        if (slime && slime.health <= 0) {
            soundManager.stopAllSounds(); 
            if (gameState.level === FINAL_BOSS_LEVEL) {
                gameState.current = 'final_win_cutscene';
            } else {
                gameState.current = 'win';
                playerData.totalScore += gameState.score;
                playerData.totalScore += gameState.level * 1000;
                let healthyCrops = crops.filter(c => !c.infected).length;
                if (healthyCrops === crops.length) playerData.totalScore += 500 * gameState.level; // Bônus
                if (hero.health >= hero.maxHealth * 0.9) playerData.totalScore += 300 * gameState.level; // Bônus
            }
        } else if (hero && hero.health <= 0 || crops.length > 0 && crops.filter(c => !c.infected).length === 0 ) {
            gameState.current = 'lose';
            playerData.totalScore += gameState.score;
            soundManager.stopAllSounds();
        }
    }

    function updateHero() {
        if (!hero) return;
        hero.x += hero.vx; hero.y += hero.vy;
        hero.x = constrain(hero.x, hero.currentSize / 2, width - hero.currentSize / 2);
        hero.y = constrain(hero.y, hero.currentSize / 2, height - hero.currentSize / 2);
        hero.vx *= 0.85; hero.vy *= 0.85;
        hero.isMoving = (abs(hero.vx) > 0.1 || abs(hero.vy) > 0.1);
        if (hero.isMoving) hero.moveTime += deltaTime / 60; else hero.moveTime = 0;

        hero.canReloadAtSilo = farmSilo.health > 0 && dist(hero.x, hero.y, farmSilo.x + farmSilo.baseWidth/2, farmSilo.y + farmSilo.baseHeight/2) < farmSilo.interactionRadius;

        if(hero.shieldActive){
            hero.shieldTime -= deltaTime;
            if(hero.shieldTime <= 0) {
                hero.shieldActive = false;
            }
        }
        if (hero.hitTimer > 0) {
            hero.hitTimer -= deltaTime;
        }
    }

    function updateSlime() {
        if(!slime) return;
        if (slime.hitTimer > 0) {
            slime.hitTimer -= deltaTime;
        }
        if (slime.isSlime) {
            if (frameCount % (90 - gameState.level * 5) === 0 && slime.health > 0 && !slime.shieldActive) {
                let targetX = hero.x + random(-width/3, width/3);
                let targetY = hero.y - random(50, 200);
                targetY = constrain(targetY, slime.size/2, height / 2);
                slime.x = lerp(slime.x, constrain(targetX, slime.size/2, width - slime.size/2), 0.2);
                slime.y = lerp(slime.y, constrain(targetY, slime.size/2, height/2 - slime.size/2), 0.2);
            }
        } else if (slime.type === 'nave_colossal') {
            if (frameCount % 120 === 0 && slime.health > 0 && !slime.shieldActive) {
                let targetX = width/2 + random(-width/4, width/4);
                let targetY = 100 + random(-30,30);
                slime.x = lerp(slime.x, targetX, 0.05);
                slime.y = lerp(slime.y, targetY, 0.05);
            }
        }

        let healthRatio = slime.health / slime.maxHealth;
        slime.distortion = map(healthRatio, 1, 0, 2, 10) + sin(frameCount * 0.1) * 3;
        slime.pulseSpeed = map(healthRatio, 1, 0, 0.04, 0.12);
    }

    function updateElectricClouds() {
        for (let i = electricClouds.length - 1; i >= 0; i--) {
            let cloud = electricClouds[i];
            cloud.life -= deltaTime;
            cloud.x += sin(frameCount * 0.01 + cloud.y) * 0.5; // slow drift

            if (millis() - cloud.lastStrike > cloud.strikeCooldown) {
                soundManager.playSound('electricZap', 0.6, random(0.8, 1.0));
                skyRays.push({
                    x: cloud.x + random(-cloud.size/2, cloud.size/2),
                    warningTime: 500, maxWarningTime: 500,
                    lifetime: 250, damage: 15 + gameState.level * 2,
                    isSkyRay: true, type: 'lightning_bolt', maxWidth: 10
                });
                cloud.lastStrike = millis();
            }

            if (cloud.life <= 0) {
                electricClouds.splice(i, 1);
            }
        }
    }


    function applySlimeAbilities() {
        if (!slime || !slime.abilities || slime.health <= 0) return;

        if (slime.abilities.includes('fire_aura') && hero && slime.isSlime) {
            if (dist(hero.x, hero.y, slime.x, slime.y) < slime.size * 1.5) {
                if (frameCount % 30 === 0 && !hero.shieldActive) {
                    hero.health -= (2 + gameState.level * 0.5);
                    hero.hitTimer = 60;
                    createParticles(hero.x, hero.y, 2, color(255,100,0,150), {sizeRange:[5,10], life:15});
                }
            }
        }
        if (slime.abilities.includes('static_field') && hero && slime.isSlime) {
            if (dist(hero.x, hero.y, slime.x, slime.y) < slime.size * 1.8) {
                 if (frameCount % 60 === 0 && !hero.shieldActive && random() < 0.3) {
                     hero.vx = 0; hero.vy = 0;
                     createParticles(hero.x, hero.y, 5, color(255,255,100,180), {isSpark:true, life:20});
                 }
            }
        }
        if (slime.abilities.includes('toxic_pool') && slime.isSlime) {
            if (frameCount % 180 === 0 && random() < 0.4) {
                createParticles(slime.x + random(-slime.size*0.3, slime.size*0.3), slime.y + slime.size*0.3 + random(10,30), 1, color(100,200,50,150), {
                    sizeRange: [slime.size*0.5, slime.size*0.8], life: 300, gravity: 0,
                    isDamagingParticle: true, damagePerFrame: 0.2 + gameState.level*0.02,
                    vx:0, vy:0
                });
            }
        }
        if (slime.abilities.includes('invisibility_short') && slime.isSlime) {
            slime.abilityTimers = slime.abilityTimers || {};
            slime.abilityTimers.invisibility = slime.abilityTimers.invisibility || 0;
            if (millis() - slime.abilityTimers.invisibility > 10000 && !slime.isInvisible && random() < 0.01) {
                slime.isInvisible = true;
                slime.abilityTimers.invisibility = millis();
                soundManager.playSound('phantomWhoosh');
                setTimeout(() => { if(slime) slime.isInvisible = false; }, 3000);
            }
        }
        if (slime.abilities.includes('cosmic_regeneration') && slime.type === 'intergalactic_slime') {
            if (frameCount % 120 === 0 && slime.health < slime.maxHealth) {
                slime.health = min(slime.maxHealth, slime.health + (5 + gameState.level * 0.5));
                createParticles(slime.x, slime.y, 5, color(150,255,150,100), {vy:-0.5, life:30, spread: slime.size*0.5});
            }
        }
        if (slime.abilities.includes('gravity_aura_strong') && hero && slime.type === 'intergalactic_slime') {
            let d = dist(hero.x, hero.y, slime.x, slime.y);
            if (d < slime.size * 3 && d > slime.size * 0.5) {
                let angleToSlime = atan2(slime.y - hero.y, slime.x - hero.x);
                let pullForce = map(d, slime.size * 3, slime.size * 0.5, 0.1, 0.5);
                hero.vx += cos(angleToSlime) * pullForce * (deltaTime/16.66);
                hero.vy += sin(angleToSlime) * pullForce * (deltaTime/16.66);
            }
        }
    }


    function activateSlimeShield() {
        if (!slime.shieldActive && slime.health > 0) {
            slime.shieldActive = true;
            slime.shieldHealth = slime.shieldMaxHealth;
            createParticles(slime.x, slime.y, 30, slime.shieldColor, {spread: slime.size * 0.8, life: 40, speed: 2.5, gravity:0.02});
        }
    }

    // Funções de Ataque dos Boss
    function defaultSlimeAttack() {
        let attackCount = 1 + floor(gameState.level / 2.5); attackCount = min(attackCount, 5);
        for (let i = 0; i < attackCount; i++) {
            let angleToHero = atan2(hero.y - slime.y, hero.x - slime.x);
            let spread = PI/8 * (1 - gameState.level * 0.05); spread = max(PI/32, spread);
            angleToHero += random(-spread, spread);
            let targetX = slime.x + cos(angleToHero) * width;
            let targetY = slime.y + sin(angleToHero) * width;
            rays.push({
                x1: slime.x + cos(angleToHero) * slime.size * 0.5, y1: slime.y + sin(angleToHero) * slime.size * 0.5,
                x2: targetX, y2: targetY, lifetime: 600 + gameState.level * 30,
                damage: 8 + gameState.level * 2.5, width: 4 + random(4) + gameState.level * 0.5, isSlimeRay: true, type: 'default'
            });
        }
    }

    function fireSlimeAttack() {
        let numFireballs = 2 + floor(gameState.level / 2); numFireballs = min(numFireballs, 6);
        for (let i = 0; i < numFireballs; i++) {
            let angleToHero = atan2(hero.y - slime.y, hero.x - slime.x);
            let spread = PI/10;
            angleToHero += random(-spread, spread) + i * (PI/16);
            let fireballSpeed = 5 + random(2);
            particles.push({
                x: slime.x + cos(angleToHero) * slime.size * 0.4, y: slime.y + sin(angleToHero) * slime.size * 0.4,
                size: 10 + random(5) + gameState.level, color: color(255, 100 + random(100), 0, 220), baseAlpha: 220,
                vx: cos(angleToHero) * fireballSpeed, vy: sin(angleToHero) * fireballSpeed,
                damage: 10 + gameState.level * 2, life: 120, initialLife: 120,
                isProjectile: true, isEnemyProjectile: true, gravity: 0.02, projectileType: 'fireball'
            });
        }
    }

    function iceShardAttack() {
        let numShards = 3 + gameState.level; numShards = min(numShards, 8);
        for (let i = 0; i < numShards; i++) {
            let angle = (TWO_PI / numShards) * i + random(-PI/16, PI/16);
            rays.push({
                x1: slime.x + cos(angle) * slime.size * 0.3, y1: slime.y + sin(angle) * slime.size * 0.3,
                x2: slime.x + cos(angle) * (width * 0.3), y2: slime.y + sin(angle) * (width * 0.3),
                lifetime: 400 + gameState.level * 20, damage: 7 + gameState.level * 1.5, width: 3 + random(3) + gameState.level * 0.3,
                isSlimeRay: true, type: 'ice',
            });
        }
    }
    function electricShockAttack() {
        soundManager.playSound('electricZap', null, random(0.9,1.1));
        let numSparks = 3 + Math.floor(gameState.level/2); numSparks = min(numSparks, 6);
        for(let i=0; i<numSparks; i++){
            let angle = random(TWO_PI);
            let sparkLen = slime.size * random(1,2.5);
            let targetX = slime.x + cos(angle)*sparkLen;
            let targetY = slime.y + sin(angle)*sparkLen;
            rays.push({
                x1: slime.x, y1: slime.y, x2: targetX, y2: targetY,
                lifetime: 20,
                damage: 6 + gameState.level * 1.5, width: random(3,6),
                isSlimeRay: true, type: 'electric_shock'
            });
            createParticles(targetX, targetY, 3, color(255,255,100,200), {isSpark:true, speed:2, life:15});
        }
    }
    function toxicSpitAttack() {
        let numSpits = 1 + Math.floor(gameState.level/3); numSpits = min(numSpits, 4);
        for(let i=0; i<numSpits; i++){
            let angleToHero = atan2(hero.y - slime.y, hero.x - slime.x) + random(-0.3,0.3) + i*0.1;
            particles.push({
                x: slime.x + cos(angleToHero)*slime.size*0.3, y: slime.y + sin(angleToHero)*slime.size*0.3,
                size: 12 + random(4), color: color(100,220,50,200), baseAlpha:200,
                vx: cos(angleToHero)*5, vy: sin(angleToHero)*5,
                damage: 7 + gameState.level * 1.2, life: 120, initialLife: 120,
                isProjectile: true, isEnemyProjectile: true, gravity: 0.04, projectileType: 'toxic_glob',
                onHitGround: (px,py) => {
                    createParticles(px, py, 1, color(80,180,40,150), {
                        sizeRange: [20,30], life: 240, gravity: 0,
                        isDamagingParticle: true, damagePerFrame: 0.15 + gameState.level*0.01, vx:0, vy:0
                    });
                }
            });
        }
    }

    function phantomDashAttack() {
        soundManager.playSound('phantomWhoosh');
        slime.isInvisible = true;
        let dashAngle = atan2(hero.y - slime.y, hero.x - slime.x);
        let dashSpeed = 15;
        slime.vx = cos(dashAngle) * dashSpeed;
        slime.vy = sin(dashAngle) * dashSpeed;
        slime.abilityTimers = slime.abilityTimers || {};
        slime.abilityTimers.dashEnd = millis() + 500;
        slime.abilityTimers.dashDamageCooldown = 0;

        setTimeout(() => {
            if(slime) {
                slime.isInvisible = false;
                slime.vx = 0; slime.vy = 0;
            }
        }, 600);
    }

    // Ataques da Gosma Fantasma
    function cloneFantasmaAttack() {
        if (!slime || slime.clones.length > 1) return; // Limita o número de clones
        soundManager.playSound('phantomWhoosh', 0.5, 1.2);
        let numClones = 2;
        for (let i = 0; i < numClones; i++) {
            let clone = {
                x: slime.x + random(-50, 50),
                y: slime.y + random(-50, 50),
                size: slime.size * 0.8,
                life: 300, 
                health: 25, 
                hitTimer: 0,
                color: color(200, 200, 220, 100),
                pulse: random(TWO_PI),
                pulseSpeed: 0.06,
                distortion: 2,
                shieldActive: false, 
                lastShot: 0,
                shootCooldown: 2000 + random(1000)
            };
            slime.clones.push(clone);
        }
    }

    function drenarVidaAttack() {
        if (!hero) return;
        
        rays.push({
            x1: slime.x, y1: slime.y,
            x2: hero.x, y2: hero.y,
            lifetime: 240, 
            damage: 0.25 + gameState.level * 0.05, 
            healAmount: 0.3 + gameState.level * 0.05, 
            width: 10,
            isSlimeRay: true,
            type: 'drain_beam' 
        });
    }

    function projeteisEspectraisAttack() {
        let numProjectiles = 3 + Math.floor(gameState.level / 2);
        for (let i = 0; i < numProjectiles; i++) {
            let angleToHero = atan2(hero.y - slime.y, hero.x - slime.x);
            let spread = PI / 6;
            angleToHero += random(-spread, spread);
            particles.push({
                x: slime.x, y: slime.y,
                size: 10 + random(4),
                color: color(200, 200, 220, 180),
                baseAlpha: 180,
                vx: cos(angleToHero) * 5, vy: sin(angleToHero) * 5,
                damage: 6 + gameState.level * 1.5,
                life: 150, initialLife: 150,
                isProjectile: true, isEnemyProjectile: true,
                projectileType: 'spectral_bolt',
                homing: true, 
                target: hero,
                turnSpeed: 0.02 
            });
        }
    }
    // CABO OS ATAQUES


    // Ataques da Nave 
    function naveLaserAttack() {
        soundManager.playSound('laserFire');
        let laserOriginX = slime.x + random(-slime.size*0.4, slime.size*0.4);
        let laserOriginY = slime.y + slime.size*0.1;
        skyRays.push({
            x: laserOriginX, fromY: laserOriginY,
            targetX: hero.x + random(-20,20), targetYval: hero.y + random(-20,20),
            warningTime: 400, maxWarningTime: 400, lifetime: 300, damage: 25 + gameState.level*2,
            isSkyRay: true, type: 'nave_laser_beam', maxWidth: 10, isAngled: true
        });
    }
    function naveMissileAttack() {
        soundManager.playSound('explosionSmall', 0.5);
        let numMissiles = 1 + Math.floor((gameState.level-9)/2);
        numMissiles = min(numMissiles, 3);
        for(let i=0; i<numMissiles; i++){
            let missileOriginX = slime.x + (i % 2 === 0 ? -1 : 1) * slime.size * 0.3;
            let missileOriginY = slime.y + slime.size * 0.2;
            particles.push({
                x: missileOriginX, y: missileOriginY,
                size: 12, color: color(180,180,200,220), baseAlpha:220,
                vx: random(-1,1), vy: 2,
                damage: 25 + gameState.level*2, life: 240, initialLife: 240,
                isProjectile: true, isEnemyProjectile: true, gravity: 0.005, projectileType: 'nave_missile',
                homing: true, target: hero, turnSpeed: 0.03 + i*0.01
            });
        }
    }
    function naveMinionSpawn() {
        if (enemyShips.length < MAX_ENEMY_SHIPS ) {
           spawnEnemyShip();
           spawnEnemyShip();
        }
    }


   // Slime boss final
    function blackHoleAttack() {
        soundManager.playSound('blackholeSound', 0.8);
        let bhX = slime.x + random(-width/3, width/3);
        let bhY = slime.y + random(100, height/2.5);
        bhX = constrain(bhX, 150, width-150);
        bhY = constrain(bhY, 150, height-150);

        let blackHoleDuration = 5000 + gameState.level * 100;
        let blackHoleRadius = 40 + gameState.level * 2;

        let bhEffect = {
            x: bhX, y: bhY, radius: blackHoleRadius,
            life: blackHoleDuration / (1000/frameRate()),
            initialLife: blackHoleDuration / (1000/frameRate()),
            pullStrength: 0.02 + gameState.level * 0.002,
            damageRadius: blackHoleRadius * 1.5,
            damage: 0.5 + gameState.level * 0.05
        };
        slime.activeEffects = slime.activeEffects || [];
        slime.activeEffects.push(bhEffect);


        for(let i=0; i<80; i++){
            let angle = random(TWO_PI);
            let dist = random(blackHoleRadius * 2, width/2);
            createParticles(bhX + cos(angle)*dist, bhY + sin(angle)*dist, 1, color(random(20,80),0,random(50,120),180), {
                isBlackHoleParticle: true, bhX: bhX, bhY: bhY,
                distToBh: dist,
                swirlOffset: random(TWO_PI),
                life: (blackHoleDuration / (1000/frameRate())) * random(0.5,1),
                sizeRange: [2,5], speed: 0
            });
        }
    }

    function galacticBlastAttack() {
        soundManager.playSound('explosionSmall', 0.8);
        let numBlasts = 1 + Math.floor(gameState.level / FINAL_BOSS_LEVEL * 2);
        for(let i=0; i<numBlasts; i++){
            let angleToHero = atan2(hero.y - slime.y, hero.x - slime.x) + random(-PI/12, PI/12) * i;
            rays.push({
                x1: slime.x, y1: slime.y,
                x2: slime.x + cos(angleToHero) * width * 1.5, y2: slime.y + sin(angleToHero) * width * 1.5,
                lifetime: 150, damage: 40 + gameState.level, width: 25 + random(15),
                isSlimeRay: true, type: 'galactic_beam'
            });
            triggerCameraShake(10, 30);
        }
    }

    
    // realityWarpAttack (Distorção)
    
    function realityWarpAttack() {
        
        soundManager.playSound('blackholeSound', 0.7, 1.4); 
      
        triggerCameraShake(10, 120); 
        
       
        gameState.screenDistortion = { 
            amount: 8, 
            duration: 90,
            time: 0, 
            type: 'cosmic_distortion' 
        };
        
       
        for(let i=0; i<15; i++){
            createParticles(random(width), random(height), 1, color(random(200,255),random(200,255),random(200,255),150), {
                vx:0, vy:0, life: 90, sizeRange:[40,100], spread:0,
                isRealityTear: true
            });
        }
    }

    function cosmicRayBarrageAttack() {
        let numRays = 3 + Math.floor(gameState.level / FINAL_BOSS_LEVEL * 3);
        for (let i = 0; i < numRays; i++) {
            let angle = random(TWO_PI);
            let originX = slime.x + cos(angle) * slime.size * 0.6;
            let originY = slime.y + sin(angle) * slime.size * 0.6;
            let targetAngle = atan2(hero.y - originY, hero.x - originX) + random(-0.1, 0.1);
            let targetX = originX + cos(targetAngle) * width;
            let targetY = originY + sin(targetAngle) * width;
            setTimeout(() => {
                if (slime && slime.health > 0) {
                    soundManager.playSound('laserFire', 0.6, 1.2);
                    rays.push({
                        x1: originX, y1: originY, x2: targetX, y2: targetY,
                        lifetime: 100, damage: 30 + gameState.level * 2,
                        width: 8 + random(4), isSlimeRay: true, type: 'cosmic_ray'
                    });
                }
            }, i * 100);
        }
    }

    function purpleEnergyVolleyAttack() {
        let numProjectiles = 5 + Math.floor(gameState.level / FINAL_BOSS_LEVEL * 5);
        for (let i = 0; i < numProjectiles; i++) {
            let angle = (PI / numProjectiles) * i - PI / 2; // Fan shape
            let projSpeed = 6 + random(2);
            particles.push({
                x: slime.x, y: slime.y,
                size: 10 + random(4), color: color(180, 100, 255, 220), baseAlpha: 220,
                vx: cos(angle) * projSpeed, vy: sin(angle) * projSpeed,
                damage: 20 + gameState.level * 1.5, life: 120, initialLife: 120,
                isProjectile: true, isEnemyProjectile: true, gravity: 0.01, projectileType: 'purple_energy'
            });
        }
    }

    function spawnHelperShipsAttack() {
        let numShips = 1 + Math.floor(gameState.level / FINAL_BOSS_LEVEL * 2);
        for(let i=0; i < numShips; i++) {
            if(enemyShips.length < MAX_ENEMY_SHIPS + 2) {
                spawnIntergalacticShip();
            }
        }
    }

    function reflectiveShieldPulse(){
        if(slime.shieldActive){
            soundManager.playSound('crystalShatter', 0.5);
            for(let i=0; i<12; i++){
                let angle = TWO_PI/12 * i;
                particles.push({
                    x: slime.x, y: slime.y, size: 6+random(3), color: color(0,200,200,200),
                    vx: cos(angle)*6, vy: sin(angle)*6, damage: 4+gameState.level*0.5, life:80,
                    isProjectile: true, isEnemyProjectile: true, projectileType: 'reflected_shard'
                });
            }
        }
    }


    // Ataques Aéreos dos Bosses
    function defaultSkyAttack() {
        let attackCount = 1 + floor(gameState.level / 2); attackCount = min(attackCount, 4);
        for (let i = 0; i < attackCount; i++) {
            let targetX = hero.x + random(-width/4, width/4); targetX = constrain(targetX, 50, width - 50);
            skyRays.push({
                x: targetX, warningTime: 1200 + random(600) - gameState.level * 50,
                maxWarningTime: 1200 + random(600) - gameState.level * 50,
                lifetime: 600, damage: 12 + gameState.level * 3, isSkyRay: true, type: 'default_sky'
            });
        }
    }

    function meteorRainAttack() {
        let numMeteors = 2 + floor(gameState.level / 3); numMeteors = min(numMeteors, 5);
        for (let i = 0; i < numMeteors; i++) {
            let targetX = hero.x + random(-width/3, width/3) + i * random(-30,30);
            targetX = constrain(targetX, 50, width - 50);
            skyRays.push({
                x: targetX, warningTime: 1500 + random(500) - gameState.level * 60,
                maxWarningTime: 1500 + random(500) - gameState.level * 60,
                lifetime: 700, damage: 15 + gameState.level * 3.5, isSkyRay: true, type: 'meteor',
                maxWidth: 25
            });
        }
    }

    function blizzardAttack() {
        let numColumns = 3 + floor(gameState.level / 2); numColumns = min(numColumns, 6);
        for (let i = 0; i < numColumns; i++) {
            let targetX = random(width*0.1, width*0.9);
            skyRays.push({
                x: targetX, warningTime: 1000 + random(400) - gameState.level * 40,
                maxWarningTime: 1000 + random(400) - gameState.level * 40,
                lifetime: 800, damage: 5 + gameState.level * 1, isSkyRay: true, type: 'blizzard_column',
                maxWidth: 30,
            });
        }
    }

    function lightningCloudAttack() { // Renomeado do antigo electricStormAttack
        let numClouds = 2 + floor(gameState.level / 4);
        for (let i = 0; i < numClouds; i++) {
            electricClouds.push({
                x: random(width),
                y: random(80, 150),
                size: random(80, 120),
                life: 10000, // 10 segundos de vida
                lastStrike: millis() + random(2000),
                strikeCooldown: 2500 + random(-500, 500)
            });
        }
    }

    function lightningStormAttack() { // ataque para a Gosma Elétrica
        let numStrikes = 4 + floor(gameState.level / 2);
        numStrikes = min(numStrikes, 8);
        for (let i=0; i < numStrikes; i++) {
            setTimeout(() => {
                let targetX = hero.x + random(-width/4, width/4);
                targetX = constrain(targetX, 50, width - 50);
                skyRays.push({
                    x: targetX,
                    warningTime: 600 - gameState.level * 30,
                    maxWarningTime: 600 - gameState.level * 30,
                    lifetime: 200,
                    damage: 18 + gameState.level * 2,
                    isSkyRay: true,
                    type: 'lightning_bolt',
                    maxWidth: 10
                });
            }, i * 150);
        }
    }

    function poisonCloudAttack() {
        let targetX = hero.x + random(-width/5, width/5);
        targetX = constrain(targetX, 100, width - 100);
        skyRays.push({
            x: targetX, warningTime: 1200, maxWarningTime: 1200, lifetime: 100,
            isSkyRay: true, type: 'toxic_fallout_marker', maxWidth: 80, damage:0,
            onEnd: (rx, ry) => {
                for(let k=0; k<30; k++) {
                    createParticles(rx + random(-40,40), height - random(50,150), 1, color(80,180,40,120), {
                        vy: random(-0.3,0.1), vx: random(-0.2,0.2), life: 300 + random(100), gravity: -0.005,
                        sizeRange: [15,25],
                        isDamagingParticle: true, damagePerFrame: 0.05 + gameState.level * 0.005
                    });
                }
            }
        });
    }

    function earthquakeAttack() {
        soundManager.playSound('rockSmash', 0.8);
        triggerCameraShake(15, 90);
        for(let i=0; i<10; i++){
            createParticles(random(width), height - random(10,30), 1, color(100,80,60,150),{
                vy: random(-2,-5), vx: random(-1,1), life: 40, gravity: 0.2, sizeRange:[10,25]
            });
        }
        if(random() < 0.5 && hero){
            hero.vx += random(-3,3);
            hero.vy += random(-2,1);
        }
    }
    function fearInducingScream() {
        triggerCameraShake(8, 45);
        createParticles(slime.x, slime.y, 20, color(150,150,200,100),{spread: slime.size, speed:3, life:30});
    }
    function crystalShardVolley() {
        soundManager.playSound('crystalShatter', 0.6);
        let numShards = 8 + gameState.level; numShards = min(numShards, 16);
        for(let i=0; i<numShards; i++){
            let angle = (TWO_PI/numShards) * i + random(-0.1,0.1);
            particles.push({
                x: slime.x, y: slime.y, size: 8+random(4), color: color(0,220,220,230), baseAlpha: 230,
                vx: cos(angle)*7, vy: sin(angle)*7, damage: 5+gameState.level*0.8, life:90, initialLife: 90,
                isProjectile: true, isEnemyProjectile: true, projectileType: 'crystal_shard'
            });
        }
    }

    function slimeBossAttack() {
        if (!slime || !slime.attackFunctions || slime.attackFunctions.length === 0) {
            defaultSlimeAttack();
            return;
        }
        let groundAttacks = slime.attackFunctions.filter(fn =>
            !fn.toLowerCase().includes('sky') &&
            !fn.toLowerCase().includes('meteor') &&
            !fn.toLowerCase().includes('blizzard') &&
            !fn.toLowerCase().includes('storm') &&
            !fn.toLowerCase().includes('lightning') &&
            !fn.toLowerCase().includes('poisoncloud') &&
            !fn.toLowerCase().includes('navelaser') &&
            !fn.toLowerCase().includes('navemissile') &&
            !fn.toLowerCase().includes('naveminionspawn') &&
            !fn.toLowerCase().includes('galactic') &&
            !fn.toLowerCase().includes('blackhole') &&
            !fn.toLowerCase().includes('realitywarp') &&
            !fn.toLowerCase().includes('cosmic') &&
            !fn.toLowerCase().includes('spawnhelper')
    );
    if (groundAttacks.length === 0) groundAttacks.push('defaultSlimeAttack');

    let chosenAttackFunction = random(groundAttacks);

    if (typeof window[chosenAttackFunction] === 'function') {
        window[chosenAttackFunction]();
    } else {
        console.warn("Função de ataque terrestre não encontrada:", chosenAttackFunction);
        defaultSlimeAttack();
    }
}

function slimeBossSkyAttack() {
    if (!slime || !slime.attackFunctions || slime.attackFunctions.length === 0) {
        defaultSkyAttack();
        return;
    }
    let skyOrSpecialAttacks = slime.attackFunctions.filter(fn =>
        fn.toLowerCase().includes('sky') ||
        fn.toLowerCase().includes('meteor') ||
        fn.toLowerCase().includes('blizzard') ||
        fn.toLowerCase().includes('storm') ||
        fn.toLowerCase().includes('lightning') ||
        fn.toLowerCase().includes('poisoncloud') ||
        (slime.type === 'nave_colossal' && (fn.toLowerCase().includes('navelaser') || fn.toLowerCase().includes('navemissile') || fn.toLowerCase().includes('naveminionspawn'))) ||
        (slime.type === 'intergalactic_slime' && (fn.toLowerCase().includes('galactic') || fn.toLowerCase().includes('blackhole') || fn.toLowerCase().includes('realitywarp') || fn.toLowerCase().includes('cosmic') || fn.toLowerCase().includes('spawnhelper')))
    );
    if (skyOrSpecialAttacks.length === 0) {
        if (slime.type === 'nave_colossal') { naveLaserAttack(); return; }
        if (slime.type === 'intergalactic_slime') { galacticBlastAttack(); return; }
        defaultSkyAttack();
        return;
    }

    let chosenAttackFunction = random(skyOrSpecialAttacks);

    if (typeof window[chosenAttackFunction] === 'function') {
        window[chosenAttackFunction]();
    } else {
        console.warn("Função de ataque aéreo/especial não encontrada:", chosenAttackFunction);
        if (slime.type === 'nave_colossal') naveLaserAttack();
        else if (slime.type === 'intergalactic_slime') galacticBlastAttack();
        else defaultSkyAttack();
    }
}


function updateRays() {
    for (let i = rays.length - 1; i >= 0; i--) {
        let ray = rays[i]; ray.lifetime -= deltaTime;
        
        // Lógica para o feixe 
        if (ray.type === 'drain_beam' && hero && slime) {
            ray.x1 = slime.x;
            ray.y1 = slime.y;
            ray.x2 = hero.x;
            ray.y2 = hero.y;
            
            if (!hero.shieldActive) {
                hero.health -= ray.damage * (deltaTime / 16.66);
                hero.hitTimer = 30;
                slime.health += ray.healAmount * (deltaTime / 16.66);
                slime.health = min(slime.health, slime.maxHealth);
                if (frameCount % 5 === 0) {
                     createParticles(hero.x, hero.y, 1, color(180, 50, 220, 100), {sizeRange:[5,8], life: 10, vy:-1});
                     createParticles(slime.x, slime.y, 1, color(150, 255, 150, 100), {sizeRange:[5,8], life: 10, vy:-1});
                }
            } else {
                 hero.shieldTime -= ray.damage * 10;
            }
            if (ray.lifetime <= 0) { 
                rays.splice(i, 1);
                continue;
            }
        }
        
        let checkPointX = lerp(ray.x1, ray.x2, 0.95);
        let checkPointY = lerp(ray.y1, ray.y2, 0.95);

        if (hero && dist(checkPointX, checkPointY, hero.x, hero.y) < hero.currentSize / 2 + ray.width/2) {
            if(!hero.shieldActive) {
                hero.health -= ray.damage; hero.hitTimer = 150;
                if (ray.type === 'ice') hero.speed *= 0.8;
            } else {
                hero.shieldTime -= ray.damage * 50;
                createParticles(hero.x, hero.y, 3, hero.shieldColor, {spread:hero.currentSize/2, life:20, speed:2});
            }
            hero.health = max(0, hero.health); triggerCameraShake(3,20);
            createParticles(hero.x, hero.y, 5, color(255, 80, 80, 200), {spread:hero.currentSize/2, life:25, speed:3});
            rays.splice(i, 1);
            continue;
        }
        for (let crop of crops) {
            if (!crop.infected && dist(checkPointX, checkPointY, crop.x, crop.y) < crop.size / 2 + ray.width/2) {
                crop.infectionProgress += (0.4 + gameState.level * 0.08);
                if (crop.infectionProgress >= 1) {
                    crop.infected = true; if(slime) slime.infectedCrops.push(crop);
                    if(slime && slime.isSlime) {
                        slime.size = min(slime.size + 1.5, slime.targetSize);
                        slime.health = min(slime.maxHealth, slime.health + 5 + gameState.level);
                    }
                }
                createParticles(crop.x, crop.y, 3, color(180, 80, 180, 180), {spread:crop.size/2, life:20});
                rays.splice(i, 1);
                break;
            }
        }
        if (ray && ray.lifetime <= 0) { rays.splice(i, 1); }
    }
}

function updateSkyRays() {
    for (let i = skyRays.length - 1; i >= 0; i--) {
        let ray = skyRays[i];
        if (ray.warningTime > 0) {
            ray.warningTime -= deltaTime;
            if(ray.warningTime <= 0) {
                triggerCameraShake(8,30);
                ray.maxLifetime = ray.lifetime;
                if(ray.onEnd && typeof ray.onEnd === 'function') {
                    ray.onEnd(ray.x, height - 10);
                }
            }
        } else {
            ray.lifetime -= deltaTime; let rayEffectiveWidth = ray.maxWidth || 20;
            if (hero && abs(ray.x - hero.x) < hero.currentSize / 2 + rayEffectiveWidth/2) {
                let damageMultiplier = (ray.type === 'meteor') ? 1.5 : 1;
                if(!hero.shieldActive) {
                    hero.health -= ray.damage * (deltaTime / 1000) * 2.5 * damageMultiplier; hero.hitTimer = 150;
                    if (ray.type === 'blizzard_column' || ray.type === 'lightning_bolt') hero.speed *= 0.95;
                } else {
                    hero.shieldTime -= ray.damage * 75 * damageMultiplier;
                    createParticles(hero.x, hero.y, 2, hero.shieldColor, {spread:hero.currentSize/3, life:15, speed:1.5});
                }
                hero.health = max(0, hero.health);
                if (frameCount % 4 === 0) {
                    createParticles(hero.x + random(-hero.currentSize/3, hero.currentSize/3), hero.y, 1, color(255, 80, 80, 220), {sizeRange: [4,8], life: 15, speed:2});
                }
            }
            for (let crop of crops) {
                if (!crop.infected && abs(ray.x - crop.x) < crop.size / 2 + rayEffectiveWidth/2) {
                    crop.infectionProgress += (0.6 + gameState.level * 0.12) * (deltaTime / 1000);
                    if (crop.infectionProgress >= 1) {
                        crop.infected = true; if(slime) slime.infectedCrops.push(crop);
                         if(slime && slime.isSlime) {
                            slime.size = min(slime.size + 1.5, slime.targetSize);
                            slime.health = min(slime.maxHealth, slime.health + 5 + gameState.level);
                         }
                    }
                    if (frameCount % 8 === 0) {
                        createParticles(crop.x, crop.y, 1, color(180, 80, 180, 180), {sizeRange: [3,5], life:18});
                    }
                }
            }

            // Interação com o cenário
            if (abs(ray.x - barn.x - barn.w/2) < barn.w/2) barn.health -= ray.damage*0.1;
            if (abs(ray.x - farmSilo.x - farmSilo.baseWidth/2) < farmSilo.baseWidth/2) farmSilo.health -= ray.damage*0.2;


            if (ray.lifetime <= 0) {
                skyRays.splice(i, 1);
            }
        }
    }
}

function updateCrops() {
    if (frameCount % 120 === 0) {
        for (let crop of crops) {
            if (!crop.infected && random() < 0.02 * gameState.level) {
                createParticles(crop.x, crop.y - crop.size/2, 1, color(200,255,200,100), {vy: -0.5, life: 30, isSpark: true});
            }
        }
    }
}

function createParticles(x, y, count, pColor, options = {}) {
    for (let i = 0; i < count; i++) {
        let sizeRange = options.sizeRange || [3,7];
        let particleSize = random(sizeRange[0], sizeRange[1]);
        let lifeTime = options.life || random(25, 50);
        let particle = {
            x: x + (options.spread ? random(-options.spread, options.spread) : 0),
            y: y + (options.spread ? random(-options.spread, options.spread) : 0),
            size: particleSize, color: pColor, baseAlpha: alpha(pColor),
            vx: options.vx !== undefined ? options.vx : random(-1.8, 1.8) * (options.speed || 1),
            vy: options.vy !== undefined ? options.vy : random(-2.2, 0.2) * (options.speed || 1),
            life: lifeTime, initialLife: lifeTime,
            isProjectile: options.isProjectile || false,
            isEnemyProjectile: options.isEnemyProjectile || false,
            projectileType: options.projectileType || null,
            weaponType: options.weaponType || null,
            projectileColor: options.projectileColor || null,
            isSpark: options.isSpark || false,
            isConfetti: options.isConfetti || false,
            isBlackHoleParticle: options.isBlackHoleParticle || false,
            bhX: options.bhX || 0, bhY: options.bhY || 0,
            distToBh: options.distToBh || 0, swirlOffset: options.swirlOffset || 0,
            isDamagingParticle: options.isDamagingParticle || false, damagePerFrame: options.damagePerFrame || 0,
            isRealityTear: options.isRealityTear || false,
            angle: options.angle || 0, spin: options.spin || 0,
            gravity: options.gravity === undefined ? 0.07 : options.gravity,
            damage: options.damage || 0,
            homing: options.homing || false, target: options.target || null,
            onHitGround: options.onHitGround || null,
        };
        if(options.isConfetti){ particle.gravity = 0.03; }
        particles.push(particle);
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];

        if (p.homing && p.target && p.target.health > 0) {
            let angleToTarget = atan2(p.target.y - p.y, p.target.x - p.x);
            let currentAngle = atan2(p.vy, p.vx);
            let turnSpeed = p.turnSpeed || 0.05;
            let angleDiff = (angleToTarget - currentAngle + PI * 3) % (PI * 2) - PI;
            currentAngle += constrain(angleDiff, -turnSpeed, turnSpeed);
            let speed = sqrt(p.vx*p.vx + p.vy*p.vy);
            if (speed < 2 && p.projectileType === 'nave_missile') speed = 4;
            p.vx = cos(currentAngle) * speed;
            p.vy = sin(currentAngle) * speed;
        }

        p.x += p.vx * (deltaTime/16.66); p.y += p.vy * (deltaTime/16.66);

        if (p.isProjectile) {
            p.life -= deltaTime/16.66;
            if (p.weaponType === 'fire_thrower') {
                p.vx *= 0.95; p.vy *= 0.95;
                p.size *= 0.98;
            }
            if (p.projectileType === 'fireball' || p.projectileType === 'toxic_glob' || p.projectileType === 'nave_missile' || p.projectileType === 'rock' || p.weaponType === 'grenade_launcher') {
                p.vy += p.gravity * (deltaTime/16.66);
            }
            if (p.life <= 0 && p.onHitGround) {
                p.onHitGround(p.x, p.y);
            }

        } else {
            if (!p.isBlackHoleParticle) p.vy += p.gravity * (deltaTime/16.66);
            p.life -= deltaTime/16.66;
            if(p.isConfetti){ p.vx *= 0.98; p.angle += p.spin; }
            if(p.isDamagingParticle && hero && dist(p.x,p.y,hero.x,hero.y) < hero.currentSize/2 + p.size/2 && !hero.shieldActive){
                hero.health -= p.damagePerFrame * (deltaTime/16.66);
                if(frameCount % 15 === 0) hero.hitTimer = 30;
            }
        }
        if (p.life <= 0 || p.y > height + 50 || p.y < -50 || p.x < -50 || p.x > width + 50) {
            particles.splice(i, 1);
        }
    }
}

function heroShoot(targetX, targetY) {
    if (hero.ammo <= 0 || millis() - hero.lastShot < hero.shootCooldown) return;
    hero.ammo--; hero.lastShot = millis();
    soundManager.playSound('heroShoot', null, random(0.95, 1.05));
    let angle = atan2(targetY - hero.y, targetX - hero.x);
    let speed = 12;
    let projSize = 7;
    let projColor = color(255, 255, 0, 220);
    let projDamage = 12 + gameState.level * 1.5;
    let projLife = 70;
    let weaponType = hero.weapon;
    let projGravity = 0;

    if (weaponType === 'ray_gun') {
        speed = 18; projSize = 5;
        projColor = color(100, 200, 255, 230);
        projDamage = 15 + gameState.level * 2;
        projLife = 50;
    } else if (weaponType === 'fire_thrower') {
        speed = 8; projSize = 15 + random(10);
        projColor = color(255, 100 + random(100), 0, 200);
        projDamage = 8 + gameState.level * 1;
        projLife = 40;
        hero.shootCooldown = 100;
        for (let i = 0; i < 3; i++) {
            let fireAngle = angle + random(-PI/12, PI/12);
            particles.push({
                x: hero.x + cos(fireAngle) * hero.currentSize * 0.3, y: hero.y + sin(fireAngle) * hero.currentSize * 0.3,
                size: projSize * (1 - i*0.2), color: projColor, baseAlpha: alpha(projColor),
                vx: cos(fireAngle) * (speed - i*1.5), vy: sin(fireAngle) * (speed - i*1.5),
                damage: projDamage, life: projLife, initialLife: projLife,
                isProjectile: true, isEnemyProjectile: false, weaponType: weaponType, projectileColor: projColor, gravity: 0.01
            });
        }
        hero.vx -= cos(angle) * 0.2; hero.vy -= sin(angle) * 0.2;
        return;
    } else if (weaponType === 'ice_beam') {
        speed = 10; projSize = 8;
        projColor = color(180, 220, 255, 220);
        projDamage = 10 + gameState.level * 1.8;
        projLife = 60;
    } else if (weaponType === 'grenade_launcher') {
        speed = 7; projSize = 12;
        projColor = color(80, 120, 80, 230);
        projDamage = 35 + gameState.level * 3; // Dano da explosão
        projLife = 80;
        projGravity = 0.1;
        hero.shootCooldown = 800;
        particles.push({
            x: hero.x + cos(angle) * hero.currentSize * 0.3, y: hero.y + sin(angle) * hero.currentSize * 0.3,
            size: projSize, color: projColor, baseAlpha: alpha(projColor),
            vx: cos(angle) * speed, vy: sin(angle) * speed - 3,
            damage: projDamage, life: projLife, initialLife: projLife,
            isProjectile: true, isEnemyProjectile: false, weaponType: weaponType, projectileColor: projColor, gravity: projGravity,
            onHitGround: (px, py) => { // Explode no chão ou no tempo
                soundManager.playSound('grenadeExplode');
                createParticles(px, py, 20, color(255,150,0,200), {sizeRange:[2,5], spread: 5, speed:4, life: 25});
                // Lógica de dano em área
                let explosionRadius = 60;
                if (slime && slime.health > 0 && dist(px,py, slime.x, slime.y) < explosionRadius + slime.size/2) {
                    if (slime.shieldActive) { slime.shieldHealth -= projDamage*0.5; }
                    else { slime.health -= projDamage; }
                    slime.hitTimer = 150;
                }
                for(let ship of enemyShips){
                    if(dist(px,py, ship.x, ship.y) < explosionRadius + ship.size/2){
                        ship.health -= projDamage;
                        ship.hitTimer = 150;
                    }
                }
            }
        });
        return;
    } else { 
        hero.shootCooldown = 280;
    }


    particles.push({
        x: hero.x + cos(angle) * hero.currentSize * 0.3, y: hero.y + sin(angle) * hero.currentSize * 0.3,
        size: projSize + random(2), color: projColor, baseAlpha: alpha(projColor),
        vx: cos(angle) * speed, vy: sin(angle) * speed,
        damage: projDamage, life: projLife, initialLife: projLife,
        isProjectile: true, isEnemyProjectile: false, weaponType: weaponType, projectileColor: projColor, gravity: projGravity,
        angle: (weaponType === 'ice_beam' ? angle + PI/2 : 0)
    });

    hero.vx -= cos(angle) * 0.5; hero.vy -= sin(angle) * 0.5;
    createParticles(hero.x + cos(angle) * hero.currentSize * 0.45, hero.y + sin(angle) * hero.currentSize * 0.45, 3, color(red(projColor),green(projColor),blue(projColor),200), {sizeRange:[4,8], life:8, speed:3, spread: 5});
}


function spawnEnemyShip() {
    if (enemyShips.length >= MAX_ENEMY_SHIPS) return;
    let x, y, entrySide = floor(random(3));
    let shipSize = 35 + random(-5,5);
    switch(entrySide){
        case 0: x = random(width); y = -shipSize; break;
        case 1: x = -shipSize; y = random(height*0.1, height*0.4); break;
        case 2: x = width + shipSize; y = random(height*0.1, height*0.4); break;
    }
    enemyShips.push({
        x: x, y: y, size: shipSize, health: 30 + gameState.level * 10, maxHealth: 30 + gameState.level * 10,
        speed: 1.5 + random(0.5) + gameState.level * 0.1,
        shootCooldown: 2500 - gameState.level * 80 + random(-300,300),
        lastShotTime: millis() + random(1000), entryPhaseTimer: 120,
        targetX: random(width * 0.2, width * 0.8), targetY: random(height * 0.1, height * 0.3),
        color: color(150,150,200,220), shieldColor: color(255,100,100,150), hitTimer: 0,
        dropsAmmo: true, ammoDropAmount: AMMO_PACK_VALUE + floor(gameState.level/2),
        dropsPowerUp: random() < POWERUP_DROP_CHANCE,
        type: 'default'
    });
}

function spawnIntergalacticShip() {
    if (enemyShips.length >= MAX_ENEMY_SHIPS + 2) return;
    let x = random(width);
    let y = -50;
    enemyShips.push({
        x: x, y: y, size: 45, health: 80 + gameState.level * 15, maxHealth: 80 + gameState.level * 15,
        speed: 2 + random(0.5),
        shootCooldown: 1800 - gameState.level * 50,
        lastShotTime: millis() + random(500), entryPhaseTimer: 100,
        targetX: random(width * 0.2, width * 0.8), targetY: random(height * 0.1, height * 0.3),
        color: color(150,100,200,220), shieldColor: color(255,100,255,150), hitTimer: 0,
        dropsAmmo: true, ammoDropAmount: AMMO_PACK_VALUE + floor(gameState.level/2),
        dropsPowerUp: random() < POWERUP_DROP_CHANCE,
        type: 'intergalactic'
    });
}

function updateEnemyShips() {
    for (let i = enemyShips.length - 1; i >= 0; i--) {
        let ship = enemyShips[i];
        if(ship.hitTimer > 0) ship.hitTimer -= deltaTime;

        if (ship.entryPhaseTimer > 0) {
            ship.entryPhaseTimer -= deltaTime/16.66;
            ship.x = lerp(ship.x, ship.targetX, 0.03); ship.y = lerp(ship.y, ship.targetY, 0.03);
        } else {
            if (frameCount % 180 === 0 || dist(ship.x, ship.y, ship.targetX, ship.targetY) < 20) {
                ship.targetX = hero.x + random(-width/3, width/3);
                ship.targetY = hero.y - random(100, 250);
                ship.targetX = constrain(ship.targetX, ship.size, width - ship.size);
                ship.targetY = constrain(ship.targetY, ship.size, height/2 - ship.size);
            }
            ship.x = lerp(ship.x, ship.targetX, 0.02 * ship.speed * (deltaTime/16.66));
            ship.y = lerp(ship.y, ship.targetY, 0.02 * ship.speed * (deltaTime/16.66));
        }

        if (millis() - ship.lastShotTime > ship.shootCooldown && ship.entryPhaseTimer <=0) {
            let angle = atan2(hero.y - ship.y, hero.x - ship.x);
            let projSpeed = (ship.type === 'intergalactic' ? 9 : 7) + gameState.level * 0.3;
            particles.push({
                x: ship.x, y: ship.y, size: (ship.type === 'intergalactic' ? 8 : 6) + random(2),
                color: (ship.type === 'intergalactic' ? color(200,100,255,200) : color(255, 80, 80, 200)),
                baseAlpha: 200,
                vx: cos(angle) * projSpeed, vy: sin(angle) * projSpeed,
                damage: (ship.type === 'intergalactic' ? 10 : 7) + gameState.level * 1.5,
                life: 80, initialLife: 80,
                isProjectile: true, isEnemyProjectile: true, gravity:0
            });
            ship.lastShotTime = millis();
        }
    }
}

function drawEnemyShips() {
    for (let ship of enemyShips) {
        push(); translate(ship.x, ship.y);
        let angleToHero = atan2(hero.y - ship.y, hero.x - ship.x); rotate(angleToHero + PI/2);

        let mainColor = (ship.hitTimer > 0) ? ship.shieldColor : ship.color;
        fill(mainColor);
        if(ship.type === 'intergalactic') {
            beginShape(); // Forma mais alienígena
            vertex(0, -ship.size * 0.8);
            vertex(-ship.size * 0.6, 0);
            vertex(-ship.size * 0.3, ship.size * 0.6);
            vertex(ship.size * 0.3, ship.size * 0.6);
            vertex(ship.size * 0.6, 0);
            endShape(CLOSE);
            fill(50,30,80,220);
            ellipse(0,0, ship.size * 0.4, ship.size*0.5);
        } else { // Nave Padrão
            beginShape();
            vertex(0, -ship.size * 0.7);
            vertex(-ship.size * 0.5, ship.size * 0.5);
            vertex(0, ship.size*0.2);
            vertex(ship.size * 0.5, ship.size * 0.5);
            endShape(CLOSE);
            fill(50, 50, 80, 200);
            ellipse(0, -ship.size * 0.1, ship.size * 0.3, ship.size * 0.4);
        }

        let thrustSize = ship.size * 0.3 * (1 + sin(frameCount*0.3 + ship.x)*0.2);
        fill(255, 150 + sin(frameCount*0.5+ship.y)*50, 0, 200);
        ellipse(0, ship.size * 0.5, thrustSize, thrustSize*1.5);

        let healthRatio = ship.health / ship.maxHealth;
        if (healthRatio < 1) {
            pop(); push(); translate(ship.x, ship.y);
            let barW = ship.size * 1.2; let barH = 5;
            fill(80,0,0); rect(-barW/2, ship.size * 0.7 + 5, barW, barH);
            fill(200,0,0); rect(-barW/2, ship.size * 0.7 + 5, barW * healthRatio, barH);
        }
        pop();
    }
}

function spawnMiniSlime() {
    let side = floor(random(4));
    let x,y;
    if(side === 0) { x = -20; y = random(height); }
    else if(side === 1) { x = width + 20; y = random(height); }
    else if(side === 2) { x = random(width); y = -20; }
    else { x = random(width); y = height + 20; }

    miniSlimes.push({
        x: x, y: y,
        size: random(15,25),
        health: 15 + gameState.level * 3,
        speed: 1.5 + random(0.5),
        color: color(100,200,100,200),
        hitTimer: 0,
        jumpCooldown: random(60, 120),
        vy: 0
    });
}

function updateMiniSlimes() {
    for (let i = miniSlimes.length - 1; i >= 0; i--) {
        let ms = miniSlimes[i];
        ms.jumpCooldown--;
        if (ms.jumpCooldown <= 0) {
            let angleToHero = atan2(hero.y - ms.y, hero.x - ms.x);
            ms.vx = cos(angleToHero) * ms.speed;
            ms.vy = sin(angleToHero) * ms.speed;
            ms.jumpCooldown = random(80, 150);
        }
        ms.x += ms.vx;
        ms.y += ms.vy;

        ms.vx *= 0.95;
        ms.vy *= 0.95;

        if (ms.hitTimer > 0) ms.hitTimer--;
    }
}

function drawMiniSlimes() {
    for (let ms of miniSlimes) {
        push();
        let c = ms.hitTimer > 0 ? color(255,100,100) : ms.color;
        fill(c);
        ellipse(ms.x, ms.y, ms.size, ms.size * (1 + sin(frameCount * 0.2 + ms.x) * 0.2));
        fill(0,0,0,100);
        ellipse(ms.x, ms.y + ms.size/2, ms.size, ms.size/3);
        pop();
    }
}

function updateSlimeClones() {
    if (!slime || slime.clones.length === 0) return;
    for (let i = slime.clones.length - 1; i >= 0; i--) {
        let clone = slime.clones[i];
        clone.life--;
        clone.pulse += clone.pulseSpeed;

        if (millis() - clone.lastShot > clone.shootCooldown) {
            let angleToHero = atan2(hero.y - clone.y, hero.x - clone.x);
            particles.push({
                x: clone.x, y: clone.y,
                size: 8, color: color(200, 200, 220, 150), baseAlpha: 150,
                vx: cos(angleToHero) * 4, vy: sin(angleToHero) * 4,
                damage: 5 + gameState.level, life: 100, initialLife: 100,
                isProjectile: true, isEnemyProjectile: true, projectileType: 'spectral_bolt'
            });
            clone.lastShot = millis();
        }

        if (clone.life <= 0 || clone.health <= 0) {
            createParticles(clone.x, clone.y, 10, clone.color, {spread: clone.size/2, speed: 2});
            slime.clones.splice(i, 1);
        }
    }
}

function drawSlimeClones() {
    if (!slime || slime.clones.length === 0) return;
    for (let clone of slime.clones) {
        let pulseSize = clone.size * (1 + sin(clone.pulse) * 0.1);
        let cloneColor = clone.hitTimer > 0 ? color(255, 150, 150, 150) : clone.color;
        drawSlime(clone.x, clone.y, pulseSize, false, clone.life / 300, cloneColor, clone);
    }
}
// FIM FUNÇÕES DE CLONE


function spawnAmmoPack(x, y, amount) {
    ammoPacks.push({
        x: x, y: y, size: 18, ammoAmount: amount, vy: 0.8 + random(0.4), vx: random(-0.5, 0.5),
        life: 800 + random(200), rotation: random(TWO_PI), rotationSpeed: random(-0.02, 0.02)
    });
}

function updateAmmoPacks() {
    for (let i = ammoPacks.length - 1; i >= 0; i--) {
        let pack = ammoPacks[i];
        pack.y += pack.vy * (deltaTime/16.66); pack.x += pack.vx * (deltaTime/16.66);
        pack.vy += 0.01;
        pack.life -= deltaTime/16.66; pack.rotation += pack.rotationSpeed;
        if (pack.life <= 0 || pack.y > height + pack.size) { ammoPacks.splice(i, 1); }
    }
}

function drawAmmoPacks() {
    for (let pack of ammoPacks) {
        push(); translate(pack.x, pack.y); rotate(pack.rotation);
        fill(200, 200, 100, 220 + sin(frameCount*0.1+pack.x)*35);
        stroke(50,50,0,150); strokeWeight(2); rectMode(CENTER);
        rect(0,0, pack.size, pack.size, 4);
        noStroke();
        fill(50,50,0); textSize(pack.size*0.7); textStyle(BOLD); text("⚡", 0, 2);
        rectMode(CORNER); textStyle(NORMAL);
        pop();
    }
}

function spawnPowerUpItem(x, y, type = 'shield') {
    powerUpItems.push({
        x: x, y: y,
        size: 20,
        type: type,
        vy: 0.7 + random(0.3),
        vx: random(-0.4, 0.4),
        life: 900 + random(300),
        rotation: random(TWO_PI),
        rotationSpeed: random(-0.03, 0.03),
        color: (type === 'shield') ? color(100, 220, 255, 230) : color(255,150,50,230),
        symbol: (type === 'shield') ? '🛡️' : '🔥'
    });
}

function updatePowerUpItems() {
    for (let i = powerUpItems.length - 1; i >= 0; i--) {
        let item = powerUpItems[i];
        item.y += item.vy * (deltaTime / 16.66);
        item.x += item.vx * (deltaTime / 16.66);
        item.vy += 0.008;
        item.life -= deltaTime / 16.66;
        item.rotation += item.rotationSpeed;

        if (item.life <= 0 || item.y > height + item.size) {
            powerUpItems.splice(i, 1);
        }
    }
}

function drawPowerUpItems() {
    for (let item of powerUpItems) {
        push();
        translate(item.x, item.y);
        rotate(item.rotation);
        fill(red(item.color), green(item.color), blue(item.color), alpha(item.color) + sin(frameCount*0.15+item.x)*25);
        stroke(red(item.color)-50, green(item.color)-50, blue(item.color)-50, 180);
        strokeWeight(2.5);
        rectMode(CENTER);
        ellipse(0,0, item.size, item.size);
        noStroke();
        fill(255); textSize(item.size * 0.8); textStyle(BOLD);
        text(item.symbol, 0, 2);
        rectMode(CORNER); textStyle(NORMAL);
        pop();
    }
}

function checkCollisions() {
    if (gameState.current !== 'game') return; // Guard clause
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        if (p.isProjectile && !p.isEnemyProjectile) {
            // Colisão com o Boss
            if (slime && slime.health > 0) {
                let hitDist = slime.type === 'nave_colossal' ? slime.size * 0.5 : slime.size / 2;
                if (dist(p.x, p.y, slime.x, slime.y) < hitDist + p.size / 2) {
                    if (p.weaponType === 'grenade_launcher') {
                        if (p.onHitGround) p.onHitGround(p.x,p.y); // Ativa explosão
                    } else if (slime.shieldActive) {
                        slime.shieldHealth -= p.damage;
                        slime.hitTimer = 100;
                        soundManager.playSound('shieldHit', null, random(0.9, 1.1));
                        createParticles(p.x, p.y, 5, slime.shieldColor, {spread:10, life:20, speed:2, isSpark: true});
                        if (slime.shieldHealth <= 0) {
                            slime.shieldActive = false;
                            slime.hitTimer = 200;
                            triggerCameraShake(7, 30);
                            createParticles(slime.x, slime.y, 25, slime.shieldColor, {spread:slime.size*0.7, life:35, speed:3.5, gravity:0.03});
                        }
                    } else {
                        slime.health -= p.damage;
                        slime.hitTimer = 150;
                        createParticles(p.x, p.y, 3, color(red(slime.color),green(slime.color),blue(slime.color),200), {spread:10, life:20, speed:2});
                        soundManager.playSound('slimeHit', null, random(0.9,1.1));
                    }
                    slime.health = max(0, slime.health);
                    triggerCameraShake(p.damage * 0.15, 15);
                    particles.splice(i, 1);
                    continue;
                }
            }
            
            if (slime && slime.clones.length > 0) {
                for (let j = slime.clones.length - 1; j >= 0; j--) {
                    let clone = slime.clones[j];
                    if (dist(p.x, p.y, clone.x, clone.y) < clone.size / 2 + p.size / 2) {
                        clone.health -= p.damage;
                        clone.hitTimer = 30;
                        particles.splice(i, 1);
                        if (clone.health <= 0) {
                            createParticles(clone.x, clone.y, 10, clone.color, {spread: clone.size/2, speed: 2});
                            slime.clones.splice(j, 1);
                        }
                        break; 
                    }
                }
                 if (i >= particles.length) continue; 
            }
         
            for (let j = enemyShips.length - 1; j >= 0; j--) {
                let ship = enemyShips[j];
                if (dist(p.x, p.y, ship.x, ship.y) < ship.size / 2 + p.size / 2) {
                    ship.health -= p.damage;
                    ship.hitTimer = 150;
                    particles.splice(i, 1);
                    if (ship.health <= 0) {
                        // ... (código de destruição da nave)
                    } else {
                        soundManager.playSound('shieldHit', null, random(1.1, 1.3));
                    }
                    break;
                }
            }
             if (i >= particles.length) continue;
            // Colisão com Mini Slimes
            for (let j = miniSlimes.length - 1; j >= 0; j--) {
                let ms = miniSlimes[j];
                if (dist(p.x, p.y, ms.x, ms.y) < ms.size / 2 + p.size / 2) {
                    ms.health -= p.damage;
                    ms.hitTimer = 30;
                    particles.splice(i, 1);
                    if (ms.health <= 0) {
                        gameState.score += 15 * gameState.level;
                        createParticles(ms.x, ms.y, 8, ms.color, {spread:ms.size, life:20, speed:2.5});
                        miniSlimes.splice(j, 1);
                    }
                    break;
                }
            }
        }
        else if (p.isProjectile && p.isEnemyProjectile && hero) {
           if (dist(p.x, p.y, hero.x, hero.y) < hero.currentSize / 2 + p.size / 2) {
                if(!hero.shieldActive) {
                    hero.health -= p.damage; hero.hitTimer = 150;
                } else {
                    hero.shieldTime -= p.damage * 100;
                    createParticles(p.x, p.y, 3, hero.shieldColor, {spread:hero.currentSize/3, life:15, speed:1.5});
                    if (hero.shieldTime <= 0) { hero.shieldActive = false; }
                }
                hero.health = max(0, hero.health);
                triggerCameraShake(p.damage * 0.3, 20);
                createParticles(p.x, p.y, 4, color(255,100,100,200), {spread:10, life:20, speed:2});
                particles.splice(i, 1);
                continue;
           }
        }
    }
   
    for (let i = miniSlimes.length - 1; i >= 0; i--) {
        let ms = miniSlimes[i];
        if (hero && dist(ms.x, ms.y, hero.x, hero.y) < hero.currentSize/2 + ms.size/2) {
            if(!hero.shieldActive) {
                hero.health -= 5; hero.hitTimer = 120;
            }
            createParticles(ms.x, ms.y, 8, ms.color, {spread:ms.size, life:20, speed:2.5});
            miniSlimes.splice(i, 1);
        }
    }
}


function keyPressed() {
    initializeAudio();
    if (gameState.current === 'game' && hero) {
        if (key.toLowerCase() === 'r') {
            if (hero.canReloadAtSilo && millis() - farmSilo.lastUsedTime > SILO_RELOAD_COOLDOWN) {
                hero.ammo = hero.maxAmmo;
                farmSilo.lastUsedTime = millis();
                createParticles(hero.x, hero.y, 10, color(200, 255, 100, 180), { spread: hero.currentSize, isSpark: true, life: 30 });
            }
        }
        if (key.toLowerCase() === 'f') {
            if (!hero.shieldActive && millis() - hero.lastManualShieldTime > HERO_MANUAL_SHIELD_COOLDOWN) {
                hero.shieldActive = true;
                hero.shieldTime = HERO_MANUAL_SHIELD_DURATION;
                hero.lastManualShieldTime = millis();
                createParticles(hero.x, hero.y, 15, hero.shieldColor, {spread:hero.currentSize*0.7, life:35, speed:2.8});
            }
        }
    } else if (gameState.current === 'menu') {
        if (key.toLowerCase() === 'd') {
            const currentTime = millis();
            if (currentTime - lastDebugKeyPressTime > 1000) {
                debugKeyPressCount = 0;
            }
            debugKeyPressCount++;
            lastDebugKeyPressTime = currentTime;
            if (debugKeyPressCount >= 5) {
                debugMode = !debugMode;
                console.log("MODO DEBUG " + (debugMode ? "ATIVADO" : "DESATIVADO"));
                debugKeyPressCount = 0;
            }
        } else {
            debugKeyPressCount = 0;
        }
    }
    if (gameState.current === 'cutscene' && (keyCode === ENTER || keyCode === 32)) {
        if(gameState.cutsceneProgress < 0.85) {
            gameState.cutsceneProgress = 0.85;
            gameState.cutsceneTextProgress = 999; // Força o texto a completar
        } else {
            gameState.cutscenePhase++;
            gameState.cutsceneProgress = 0;
            gameState.cutsceneTextProgress = 0;
            if (gameState.cutscenePhase >= 8) {
                gameState.introCutscenePlayed = true;
                soundManager.stopSound('cutsceneMusic');
                gameState.current = 'game';
                initGame();
            }
        }
    }
    if (gameState.current === 'final_boss_cutscene' && (keyCode === ENTER || keyCode === 32)) {
        if(gameState.finalBossCutsceneProgress < 0.85) gameState.finalBossCutsceneProgress = 0.85;
        else {
            gameState.finalBossCutscenePhase++; gameState.finalBossCutsceneProgress = 0;
            if (gameState.finalBossCutscenePhase >= 4) { gameState.finalBossIntroPlayed = true; gameState.current = 'game'; initGame(); }
        }
    }
    return false;
}

function keyReleased() {
    if (gameState.current === 'game') {
        if (hero && hero.weapon === 'fire_thrower' && (keyCode === 32 )) {
            hero.shootCooldown = 280;
        }
    }
    return false;
}

function handleMovement() {
    if (gameState.current !== 'game' || !hero) { return; }
    let currentSpeed = hero.speed * (deltaTime / 16.666);
    hero.vx = 0; hero.vy = 0;

    const isMovingUp = keyIsDown(87) || keyIsDown(UP_ARROW);
    const isMovingDown = keyIsDown(83) || keyIsDown(DOWN_ARROW);
    if (isMovingUp && !isMovingDown) { hero.vy = -currentSpeed; }
    else if (isMovingDown && !isMovingUp) { hero.vy = currentSpeed; }

    const isMovingLeft = keyIsDown(65) || keyIsDown(LEFT_ARROW);
    const isMovingRight = keyIsDown(68) || keyIsDown(RIGHT_ARROW);
    if (isMovingLeft && !isMovingRight) { hero.vx = -currentSpeed; }
    else if (isMovingRight && !isMovingLeft) { hero.vx = currentSpeed; }

    if (hero.vx !== 0 && hero.vy !== 0) {
        const factor = 1 / Math.sqrt(2); hero.vx *= factor; hero.vy *= factor;
    }

    if (keyIsDown(32)) {
        if (millis() - hero.lastShot > hero.shootCooldown || hero.weapon === 'fire_thrower') {
            let targetX, targetY;
            if(slime && slime.health > 0){
                targetX = slime.x + random(-slime.size * 0.1, slime.size * 0.1);
                targetY = slime.y + random(-slime.size * 0.1, slime.size * 0.1);
            } else {
                targetX = hero.x;
                targetY = hero.y - 100;
            }
            heroShoot(targetX, targetY);
        }
    }
}

function mousePressed() {
    initializeAudio();
    console.log(`Mouse Pressionado em: (${mouseX}, ${mouseY}) no estado: ${gameState.current}`);

    let buttonClickedThisFrame = false;
    for (let btn of buttonActions) {
        if (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h) {
            console.log("Botão clicado:", btn.label);
            soundManager.playSound('buttonClick');
            btn.action();
            buttonClickedThisFrame = true;
            break;
        }
    }
    if (buttonClickedThisFrame) return;


    if (gameState.current === 'cutscene') {
        if(gameState.cutsceneProgress < 0.85) {
            gameState.cutsceneProgress = 0.85;
            gameState.cutsceneTextProgress = 999; // Força o texto a completar
        } else {
            gameState.cutscenePhase++;
            gameState.cutsceneProgress = 0;
            gameState.cutsceneTextProgress = 0;
            if (gameState.cutscenePhase >= 8) {
                gameState.introCutscenePlayed = true;
                soundManager.stopSound('cutsceneMusic');
                gameState.current = 'game';
                initGame();
            }
        }
    } else if (gameState.current === 'final_boss_cutscene') {
        if(gameState.finalBossCutsceneProgress < 0.85) gameState.finalBossCutsceneProgress = 0.85;
        else {
            gameState.finalBossCutscenePhase++; gameState.finalBossCutsceneProgress = 0;
            if (gameState.finalBossCutscenePhase >= 4) {
                gameState.finalBossIntroPlayed = true;
                gameState.current = 'game';
                initGame();
            }
        }
    } else if (gameState.current === 'game') {
        if(hero) heroShoot(mouseX, mouseY);
    } else if (gameState.current === 'win') {
        if (gameState.level - 1 === FINAL_BOSS_LEVEL) {
            gameState.current = 'credits';
        } else {
            gameState.level++;
            gameState.current = 'loading';
        }
        gameState.loadingStartTime = millis();
        soundManager.stopSound('gameMusic');
        soundManager.stopSound('finalBossMusic');
    } else if (gameState.current === 'lose') {
        gameState.level = 1;
        gameState.introCutscenePlayed = false;
        gameState.finalBossIntroPlayed = false;
        gameState.current = 'menu';
        soundManager.stopSound('gameMusic');
        soundManager.stopSound('finalBossMusic');
        soundManager.playSound('menuMusic');
    }
}
