!function() {
  let settings = {
    fixPlayerCount: true,
    respawnLines: true,
    respawnLinesMinimap: true,
    fixHud: true,
    selfMinimapDot: false,
    keepFiringWhileTyping:false,
    carrier: 'count',
    showPlaneCount:true,
    ctfEndFx: false,
    showBotMode: true,
    nameOnProwlerRadar: true,
    selfProwlerRadar: true,
    removeBotsScoreboard: true,
    addPlaneTypeToScoreboard: true,
    quickResize: {
      key:'B',
      a: {
        zoom: 3000,
        squared: false,
      },
      b: {
        zoom: 5000,
        squared: false,
      }
    },
    botsColor: true,
    dropFlagKey: 'Y',
    dropUpgKey: '',
    chatRadioKey:'Z',
    teamRadioKey: 'X',
    sayRadioKey: 'C',
    missileSize: 100,
    // missilePointerSize: 0,
    vanillaFont: true,
    resizeNameplate: false,
    energyCircleColor: '#1F32A1',
    healthGlowStrength: 2,
    selfEnergyCircle: true,
    selfHealthGlow: true,
    othersEnergyCircle: 'all',
    othersHealthGlow: 'all',
    SWAMSensibleDefaults:0
  };
  const BLUE_TEAM = 1
  const RED_TEAM = 2
  const PLANE_LABELS = {
    1: "Pred",
    2: "Goli",
    3: "Heli",
    4: "Torn",
    5: "Prow",
  }
  const PLANE_FULL_LABELS = {
    1: "Predator",
    2: "Goliath",
    3: "Mohawk",
    4: "Tornado",
    5: "Prowler",
  }

  const BLUE_COLOR = '#4076E2'
  const RED_COLOR = '#EA4242'

  let LOW_PINGS = {}

  // This is the handler that will be executed when new settings are applied
  function settingsApplied(values)
  {
    settings = values;
    SWAM.trigger("settingsUpdated",values);
  }

  // creates an instance of SettingsProvider
  function createSettingsProvider()
  {
    const sp = new SettingsProvider(settings, settingsApplied);
    const miscSection = sp.addSection("Miscellaneous");
    miscSection.addBoolean("fixHud", "Fix HUD on map edge (needs page reload)");
    miscSection.addBoolean("keepFiringWhileTyping", "Keep firing while typing (except stealthed prowler)");
    miscSection.addBoolean("botsColor", "Bots have different color on minimap");
    miscSection.addBoolean("addPlaneTypeToScoreboard", "Add player plane type on scoreboard");
    miscSection.addBoolean("nameOnProwlerRadar", "Add names on prowler radar");
    miscSection.addBoolean("selfProwlerRadar", "Add self radar to prowler (what radar players are seeing)");
    /*miscSection.addSliderField("missilePointerSize", "Add a pointer in front of missile, to know where it will go", {
      min: 0,
      max: 1000,
      step: 50
    });*/

    const planeHealthEnergySections = sp.addSection("Planes Health/Energy");
    planeHealthEnergySections.addBoolean("selfEnergyCircle", "Show energy circle for self (when can't fire missile)");
    planeHealthEnergySections.addValuesField("othersEnergyCircle", "Show energy circle for others",
                                             {
                                               "all": "Everyone",
                                               "team": "Only own team",
                                               "enemy": "Only enemy team",
                                               "carrier": "Only for flag carriers",
                                               "none": "None"
                                             });
    planeHealthEnergySections.addString("energyCircleColor", "Energy circle HEX color ex: #1F32A1")



    planeHealthEnergySections.addBoolean("selfHealthGlow", "Show health glow for self  (yellow dies to pred, red to heli)");
    planeHealthEnergySections.addValuesField("othersHealthGlow", "Show health glow for others",
                                         {
                                           "all": "Everyone",
                                           "team": "Only own team",
                                           "enemy": "Only enemy team",
                                           "carrier": "Only for flag carriers",
                                           "none": "None"
                                         });
    planeHealthEnergySections.addSliderField("healthGlowStrength", "Health glow strength", {
      min:0,
      max: 5,
      step: 0.1
    })



    const themeSection = sp.addSection("Theme/Style");
    themeSection.addBoolean("vanillaFont", "Use original text font for chat/leaderboard");
    themeSection.addBoolean("resizeNameplate", "Keep nameplate size on zoom change");
    themeSection.addSliderField("missileSize", "Adjust Missile Size (in %)", {
      min: 10,
      max: 400,
      step: 10
    });
    themeSection.addBoolean("selfMinimapDot", "[Vanilla] Replaces white rectangle of minimap for small dot");

    const keyBindings = sp.addSection("Key Bindings");
    keyBindings.addString("dropFlagKey", "CTF drop key.");
    keyBindings.addString("dropUpgKey", "Drop upgrade key.");
    keyBindings.addString("chatRadioKey", "Chat radio key");
    keyBindings.addString("teamRadioKey", "Team radio key");
    keyBindings.addString("sayRadioKey", "Close range radio key");

    const ctfSection = sp.addSection("CTF Options");
    ctfSection.addBoolean("showBotMode", "Show bot mode (cap,rec...) on top of the screen");
    ctfSection.addBoolean("showPlaneCount", "Show plane type counter ($PLANES to send in chat)");
    ctfSection.addBoolean("fixPlayerCount", "Improve CTF team player count");
    ctfSection.addBoolean("respawnLines", "Add CTF respawn lines");
    ctfSection.addBoolean("respawnLinesMinimap", "[Minimap] Add CTF respawn lines to minimap");
    ctfSection.addBoolean("removeBotsScoreboard", "Remove bots from scoreboard");
    ctfSection.addBoolean("ctfEndFx", "Fireworks/color overlay for CTF match end");
    ctfSection.addValuesField("carrier", "Display CTF carrier type ($CAP and $REC to send in chat)",
      {
        "count": "Carrier type and esc/rec count",
        "carrier": "Carrier only",
        "none": "Disabled"
      });
    const quickResizeSection = sp.addSection("Quick Zoom Resizing");
    quickResizeSection.addString("quickResize.key", "Trigger key for toggle between [A] and [B]");
    quickResizeSection.addSeparator();
    quickResizeSection.addSliderField("quickResize.a.zoom", "[A] Zoom Level", {
      min: 1500,
      max: 6e3,
      step: 500
    });
    quickResizeSection.addBoolean("quickResize.a.squared","[A] Use squared game area")
    quickResizeSection.addSliderField("quickResize.b.zoom", "[B] Zoom level", {
      min: 1500,
      max: 6e3,
      step: 500
    });
    quickResizeSection.addBoolean("quickResize.b.squared","[B] Use squared game area")
    return sp;
  }

  const onSettingsUpdated = (key,callback) => {
    let previousSettings = settings
    const keys = [].concat(key)
    SWAM.on("settingsUpdated", (nextSettings) => {

      if (keys.find(k => !deepEqual(previousSettings[k],nextSettings[k]))) {
        callback(typeof key === "string" ? nextSettings[key] : Object.fromEntries(keys.map(k => [k,settings[k]])),false)
      }
      previousSettings = nextSettings
    })
    callback(typeof key === "string" ? settings[key] : Object.fromEntries(keys.map(k => [k,settings[k]])),true)
  }

  /**
   * utils
   */

  const isBot = player =>
    (
      player.name.indexOf('[bot]') === 0 &&
      LOW_PINGS[player.id] > 0
    ) ||
    player.team > 2
  const isSpec = player =>
    player.removedFromMap && (performance.now() - (player.lastKilled || 0)) > 3000

  const getPlaneGroups = () => {
    const players = Object.keys(Players.getIDs()).map(Players.get).filter(p => !isBot(p) && !isSpec(p))
    return players.reduce((acc, player) => {
      acc[player.type] = acc[player.type] || [0, 0]
      acc[player.type][player.team === RED_TEAM ? 1 : 0]++
      return acc
    }, {})
  }
  const getFastBots = () => {
    const botsOn5555 = Object.keys(Players.getIDs()).map(Players.get).filter(p => isBot(p) && p.speedupgrade === 5)
    const blue5555 = botsOn5555.filter(({team}) => team === 1)
    const red5555 = botsOn5555.filter(({team}) => team === 2)
    return [blue5555,red5555]
  }

  /**
   * Remove up/down chat input
   */
  SWAM.on("gameRunning",async function () {
    $("#chatinput").off("keydown")
  })

  /**
   *  FIX PLAYER COUNT
   */

  SWAM.on("gameRunning",async function () {

    const INITIAL_EXTRALATENCY = 0;

    const originalPlayersKill = Players.kill
    const originalUIUpdateScore = UI.updateScore;
    const originalUIUpdateStats = UI.updateStats;

    Players.kill = (msg) => {
      try {
        const player = Players.get(msg.id)
        player.lastKilled = performance.now();
      } catch (e) {
      }
      originalPlayersKill(msg);
    }

    UI.updateScore = function (On) {
      originalUIUpdateScore(On)
      On.scores.forEach(p => {
        LOW_PINGS[p.id] = (LOW_PINGS[p.id] || 0) + (p.ping < 10 ? 1 : -1)
      })
    }
    let currentTeamCount = ""
    const toggle = (isEnabled) => {
      if (isEnabled) {
        const countTeamPlayers = () => {
          let Ht = 0
            , jt = 0;
          forEachPlayer(Wt => {
              if (!isSpec(Wt) && !isBot(Wt)) { // new code
                BLUE_TEAM == Wt.team ? Ht++ : jt++
              }
            }
          ),
            currentTeamCount = "<span id='starmash-team-count'><span class='greyed'>&nbsp;&nbsp;(<span style='color: #4076E2'>" + Ht + "</span>&nbsp;/&nbsp;<span style='color: #EA4242'>" + jt + "</span>)</span>"
        }
        const updateTeamPlayers = () => {
          if (game.gameType == SWAM.GAME_TYPE.CTF) {
            countTeamPlayers()
            const teamCount = $(currentTeamCount)
            $("#starmash-team-count .greyed:first").replaceWith(teamCount.find(".greyed"))
          }
        }
        UI.updateStats = function (Bt) { // same code from engine.js
          let Gt = currentTeamCount;
          if (game.gameType == SWAM.GAME_TYPE.CTF && !Gt) {
            countTeamPlayers()
          }
          if (game.fakeExtraLatency == INITIAL_EXTRALATENCY) {
            let Ht = Math.max(Bt.ping, 130)
              , jt = Math.max(Bt.ping, 300)
              , Wt = Tools.randInt(Ht, jt);
            game.fakeExtraLatency = Wt - Bt.ping
          }
          SWAM.spoofLatency && (Bt.ping -= game.fakeExtraLatency);
          var Xt = Bt.playerstotal
            , Yt = "";
          Yt += '<div class="item"><span class="icon-container"><div class="icon players"></div></span><span class="greyed">' + Bt.playersgame + "&nbsp;/&nbsp;</span>" + Xt + Gt + '<span class="greyed"><span class="icon-container padded"><div class="icon ping"></div></span>' + Bt.ping + '<span class="millis">ms</span></div>',
            $("#gameinfo").html(Yt),
            game.ping = Bt.ping
        };
        SWAM.on("scoreboardUpdate", updateTeamPlayers)
        SWAM.on("playerAdded", (player) => {
          if (player === Players.getMe()) {
            currentTeamCount = ""
          }
        })
      } else {
        SWAM.off("scoreboardUpdate", updateTeamPlayers)
        UI.updateStats = originalUIUpdateStats;
      }
    }
    onSettingsUpdated('fixPlayerCount', toggle)
  });


  /**
   * RESPAWN LINES
   */
  SWAM.on("gameRunning",async function () {
    const previousGamesPrep = Games.prep;
    const {height: minimapHeight,width: minimapWidth} = game.graphics.gui.minimap.getLocalBounds()



    const minimapOffsetY = 512*minimapHeight/config.mapHeight
    const minimapOffsetX = 1024*minimapWidth/config.mapWidth
    const blueXSpawnMinimap = createRectangleSprite({color:0x0000FF, x:-minimapWidth/2,y:-minimapHeight, height:minimapHeight,width:1/game.graphics.gui.minimap.scale.x,alpha: 1})
    const redXSpawnMinimap = createRectangleSprite({color:0xFF0000, x:-minimapOffsetX - (minimapWidth/2),y:-minimapHeight, height:minimapHeight,width:1/game.graphics.gui.minimap.scale.x,alpha: 1})
    const blueYSpawnMinimap = createRectangleSprite({color:0x0000FF, y:-minimapHeight/2, x:-minimapWidth/2,  width:minimapWidth/2,height:1/game.graphics.gui.minimap.scale.y,alpha: 1})
    const redYSpawnMinimap = createRectangleSprite({color:0xFF0000, y:-minimapOffsetY - minimapHeight/2, x:-minimapOffsetX - minimapWidth,width:minimapWidth/2,height:1/game.graphics.gui.minimap.scale.y,alpha: 1})

    const blueXSpawn = createRectangleSprite({color:0x0000FF, x:0,y:-config.mapHeight/2, height:config.mapHeight,width:1/game.graphics.layers.groundobjects.scale.x})
    const redXSpawn = createRectangleSprite({color:0xFF0000, x:-1024,y:-config.mapHeight/2, height:config.mapHeight,width:1/game.graphics.layers.groundobjects.scale.x})
    const blueYSpawn = createRectangleSprite({color:0x0000FF, y:0, x:0,  width:config.mapWidth/2,height:1/game.graphics.layers.groundobjects.scale.y})
    const redYSpawn = createRectangleSprite({color:0xFF0000, y:-512, x:-1024 - config.mapWidth/2,width:config.mapWidth/2,height:1/game.graphics.layers.groundobjects.scale.y})

    const onRenderResized = async function () {
      redXSpawn.width = 1 / game.graphics.layers.groundobjects.scale.x
      blueXSpawn.width = 1 / game.graphics.layers.groundobjects.scale.x
      redYSpawn.height = 1 / game.graphics.layers.groundobjects.scale.y
      blueYSpawn.height = 1 / game.graphics.layers.groundobjects.scale.y
    }
    const addMinimap = () => {
      game.graphics.gui.minimap.addChild(blueXSpawnMinimap)
      game.graphics.gui.minimap.addChild(redXSpawnMinimap)
      game.graphics.gui.minimap.addChild(blueYSpawnMinimap)
      game.graphics.gui.minimap.addChild(redYSpawnMinimap)
    }
    const removeMinimap = () => {
      game.graphics.gui.minimap.removeChild(blueXSpawnMinimap)
      game.graphics.gui.minimap.removeChild(redXSpawnMinimap)
      game.graphics.gui.minimap.removeChild(blueYSpawnMinimap)
      game.graphics.gui.minimap.removeChild(redYSpawnMinimap)
    }
    const addMap = () => {
      game.graphics.layers.groundobjects.addChild(redXSpawn)
      game.graphics.layers.groundobjects.addChild(blueXSpawn)
      game.graphics.layers.groundobjects.addChild(redYSpawn)
      game.graphics.layers.groundobjects.addChild(blueYSpawn)
    }
    const removeMap = () => {
      game.graphics.layers.groundobjects.removeChild(redXSpawn)
      game.graphics.layers.groundobjects.removeChild(blueXSpawn)
      game.graphics.layers.groundobjects.removeChild(redYSpawn)
      game.graphics.layers.groundobjects.removeChild(blueYSpawn)
    }
    const toggle = ({respawnLines,respawnLinesMinimap},firstTime) => {
      if (respawnLines || respawnLinesMinimap) {
        const addRespawnLines = () => {
          if (game.gameType === 2) {
            if (respawnLines) {
              addMap()
            } else {
              removeMap()
            }
            if (respawnLinesMinimap) {
              addMinimap()
            } else {
              removeMinimap()
            }
          } else {
            removeMap()
            removeMinimap()
          }
        }
        Games.prep = () => {
          previousGamesPrep();
          addRespawnLines()
        }
        if (!firstTime) {
          addRespawnLines()
        }
        SWAM.on("rendererResized", onRenderResized)
      } else {
        Games.prep = previousGamesPrep;
        removeMap()
        removeMinimap()
        SWAM.off("rendererResized", onRenderResized)
      }
    }
    onSettingsUpdated(['respawnLines','respawnLinesMinimap'], toggle)
  });

  /**
   *  FIX HUD
   */

  if (settings.fixHud) {
    SWAM.on("gameRunning", async function () {
      const HUD_WIDTH = 196;
      const HUD_HEIGHT = 85;
      const BAR_WIDTH = 19.5;

      const previousPlayersUpdate = Players.update
      const originalUIResizeHUD = UI.resizeHUD

      const sourceOrig = game.graphics.gui.hudHealth_mask.texture.orig
      const image = game.graphics.gui.hudHealth_mask.texture.baseTexture.source;
      const canvasHealth = document.createElement("canvas");
      canvasHealth.width = sourceOrig.width
      canvasHealth.height = sourceOrig.height
      const ctxHealth = canvasHealth.getContext("2d");
      ctxHealth.drawImage(image, sourceOrig.x, sourceOrig.y, sourceOrig.width, sourceOrig.height, 0, 0, sourceOrig.width, sourceOrig.height);
      const canvasHealthTexture = PIXI.Texture.fromCanvas(canvasHealth)

      const canvasEnergy = document.createElement("canvas");
      canvasEnergy.width = sourceOrig.width
      canvasEnergy.height = sourceOrig.height
      const ctxEnergy = canvasEnergy.getContext("2d");
      ctxEnergy.translate(sourceOrig.width, 0)
      ctxEnergy.scale(-1, 1)
      ctxEnergy.drawImage(canvasHealth, 0, 0);
      const canvasEnergyTexture = PIXI.Texture.fromCanvas(canvasEnergy)

      const hudHealthMask = new PIXI.Sprite(canvasHealthTexture)
      const hudEnergyMask = new PIXI.Sprite(canvasEnergyTexture)
      game.graphics.layers.aircraftme.addChild(hudHealthMask)
      game.graphics.layers.aircraftme.addChild(hudEnergyMask)

      UI.resizeHUD = function () {
        originalUIResizeHUD()
        const scaleFactor = game.scale / game.graphics.gui.hudSpriteEnergy.scale.x

        hudHealthMask.width = (BAR_WIDTH + 0.5) * scaleFactor;
        hudEnergyMask.width = (BAR_WIDTH + 0.5) * scaleFactor;
        game.graphics.gui.hudHealth_shadow.width = (BAR_WIDTH + 0.5) * scaleFactor;
        game.graphics.gui.hudEnergy_shadow.width = (BAR_WIDTH + 0.5) * scaleFactor;
        hudHealthMask.height = HUD_HEIGHT * scaleFactor;
        hudEnergyMask.height = HUD_HEIGHT * scaleFactor;
        game.graphics.gui.hudHealth_shadow.height = (HUD_HEIGHT + 0.5) * scaleFactor;
        game.graphics.gui.hudEnergy_shadow.height = (HUD_HEIGHT + 0.5) * scaleFactor;
        game.graphics.layers.hudEnergy.scale.set(0.25 * scaleFactor);
        game.graphics.layers.hudHealth.scale.set(0.25 * scaleFactor);
      };
      UI.resizeHUD()


      SWAM.on("gamePrep", function () {
        game.graphics.layers.aircraftme.addChild(game.graphics.gui.hudHealth_shadow)
        game.graphics.layers.aircraftme.addChild(game.graphics.gui.hudEnergy_shadow)
        game.graphics.layers.aircraftme.addChild(game.graphics.layers.hudEnergy)
        game.graphics.layers.aircraftme.addChild(game.graphics.layers.hudHealth)
        game.graphics.layers.aircraftme.addChild(hudEnergyMask)
        game.graphics.layers.aircraftme.addChild(hudHealthMask)
        game.graphics.layers.aircraftme.addChild(game.graphics.gui.hudHealth_mask)
        game.graphics.layers.aircraftme.addChild(game.graphics.gui.hudEnergy_mask)


        game.graphics.layers.hudEnergy.mask = hudEnergyMask
        game.graphics.layers.hudHealth.mask = hudHealthMask
        UI.resizeHUD()
        Players.update = () => {
          previousPlayersUpdate()
          const me = Players.getMe()
          game.graphics.layers.hudEnergy.position.set(me.pos.x + 155, me.pos.y - 87)
          game.graphics.gui.hudEnergy_shadow.position.set(me.pos.x + 30, me.pos.y)
          game.graphics.gui.hudEnergy_mask.position.set(me.pos.x + 155, me.pos.y - 87)

          game.graphics.layers.hudHealth.position.set(me.pos.x - 195, me.pos.y - 87)
          game.graphics.gui.hudHealth_shadow.position.set(me.pos.x - 30, me.pos.y)
          game.graphics.gui.hudHealth_mask.position.set(me.pos.x + 100, me.pos.y - 87)

          const scaleFactor = game.scale / game.graphics.gui.hudSpriteEnergy.scale.x

          hudEnergyMask.position.set(me.pos.x - (BAR_WIDTH * scaleFactor) + (HUD_WIDTH * scaleFactor) / 2, me.pos.y - hudHealthMask.height / 2);
          hudHealthMask.position.set(me.pos.x - (HUD_WIDTH * scaleFactor) / 2, me.pos.y - hudHealthMask.height / 2);
        }
      })
    })
  }


  /**
   * Small dot minimap_box texture
   */
  SWAM.on("gameRunning", function() {
    const originalMinimapBoxTexture = game.graphics.gui.minimap_box.texture
    onSettingsUpdated('selfMinimapDot',(selfMinimapDot) => {
      if (selfMinimapDot) {
        const mozBaseTexture = new PIXI.Texture.fromImage("https://raw.githubusercontent.com/fabiospampinato/airmash-swam-extensions/master/themes/hit_circles/assets/gui.png");
        const minimapBoxTexture = new PIXI.Texture(mozBaseTexture.baseTexture, new PIXI.Rectangle(268, 404, 64, 64));
        game.graphics.gui.minimap_box.texture = minimapBoxTexture
      } else {
        game.graphics.gui.minimap_box.texture = originalMinimapBoxTexture
      }
    })
  })

  /*/!**
   * Laser pointer
   *!/
  SWAM.on("gameRunning", function() {
    onSettingsUpdated('laserPointer',(laserPointer) => {
      if (laserPointer) {
        const pointer = createRectangleSprite(
          {
            color: 0xFFFFFF,
            alpha: 1,
            width: 1,
            height: 1000,
            x: 0,
            y: 0
          })
        pointer.rotation = Math.PI;
        Players.getMe().sprites.sprite.addChild(pointer)
      } else {

      }
    })
  })*/

  /**
   * Energy/health indicator
   */
  SWAM.on("gameRunning",() => {
    const settingsRef = {current: {}}

    const carrierInfo = {
      [RED_TEAM]: {player:null,team:RED_TEAM},
      [BLUE_TEAM]: {player:null,team:BLUE_TEAM}
    }
    SWAM.on("carrierInfo", (info) => {
      carrierInfo[info.team] = info
    })
    const createCircleCanvas = (diameter = 60, color = "#FFFFFF") => {
      const canvas = document.createElement('canvas');
      canvas.height = diameter
      canvas.width = diameter
      const ctx = canvas.getContext('2d');
      ctx.filter = 'blur(1px)';
      const centerY = diameter / 2;
      const centerX = diameter / 2;

      ctx.beginPath();

      ctx.arc(centerX, centerY, (diameter - 2) / 2, 0, 2 * Math.PI,true);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.closePath();
      return canvas
    }


    const ENERGY_CIRCLE_DIAMETER = 45
    const PREDATOR = 1
    const GOLIATH = 2
    const MOHAWK = 3
    const TORNADO = 4
    const PROWLER = 5
    const PLANE_FIRE_ENERGY = {
      [PREDATOR]: 0.55,
      [GOLIATH]: 0.85,
      [MOHAWK]: 1,
      [TORNADO]: 0.45,
      [PROWLER]: 0.7
    }

    const UPGRADES_SPECS = {
      DEFENSE: [1, 1.05, 1.1, 1.15, 1.2, 1.25],
      MISSILE: [1, 1.05, 1.1, 1.15, 1.2, 1.25]
    };
    const PROJECTILES_DAMAGE = {
      [PREDATOR]: 0.4,
      [GOLIATH]: 1.2,
      [MOHAWK]: 0.2,
      [TORNADO]: 0.42,
      [TORNADO + 'SMALL_MISSILE']: 0.3,
      [PROWLER]: 0.45,
    };
    const SHIP_DAMAGE_FACTOR = {
      [PREDATOR]: 2,
      [GOLIATH]: 1,
      [MOHAWK]: 2.87,
      [TORNADO]: 4.85 / 3.1,
      [PROWLER]: 5 / 3
    }
    const SMALL_DAMAGE_GLOW = new PIXI.filters.GlowFilter(5,0,2,0xfcba03,.2)
    const HIGH_DAMAGE_GLOW_BLUE = new PIXI.filters.GlowFilter(5,0,2,0xff0077,.2)
    const HIGH_DAMAGE_GLOW_RED = new PIXI.filters.GlowFilter(5,0,2,0xa204db,.2)

    const howManyMissilesCanHandle = (victim,type) => {
      if (!type) { return }
      const missileDamage = PROJECTILES_DAMAGE[type];
      const fullAirplaneHealth =
        (1 / SHIP_DAMAGE_FACTOR[victim.type]) *
        UPGRADES_SPECS.DEFENSE[5];
      const result = (fullAirplaneHealth * victim.health) / missileDamage
      const totalMissilesCanHandle = fullAirplaneHealth / missileDamage
      if (Math.ceil(totalMissilesCanHandle) !== Math.ceil(result)) {
        return (fullAirplaneHealth * victim.health) / missileDamage
      } else {
        return 2
      }
    }

    Players.add({type:1,id:'protoHelp'})
    const PlayerProto = Players.get('protoHelp').constructor.prototype
    const originalUpdateGraphics = PlayerProto.updateGraphics
    const originalSetupGraphics = PlayerProto.setupGraphics
    const originalDestroy = PlayerProto.destroy
    const originalVisibilityUpdate = PlayerProto.visibilityUpdate
    Players.destroy('protoHelp')

    const CIRCLE_TEXTURE = PIXI.Texture.fromCanvas(createCircleCanvas(ENERGY_CIRCLE_DIAMETER))
    const createProgressSprite = () => {
      const progressSprite = new PIXI.Sprite(CIRCLE_TEXTURE)
      progressSprite.width = ENERGY_CIRCLE_DIAMETER
      progressSprite.height = ENERGY_CIRCLE_DIAMETER
      return progressSprite
    }
    const addGlow = (p,nextGlow) => {
      p.sprites.sprite.filters = p.sprites.sprite.filters || []
      const lastFilter = p.sprites.sprite.filters[p.sprites.sprite.filters.length - 1]
      const replace = lastFilter === HIGH_DAMAGE_GLOW_RED || lastFilter === HIGH_DAMAGE_GLOW_BLUE || lastFilter === SMALL_DAMAGE_GLOW

      if (nextGlow !== lastFilter) {
        if (replace) {
          p.sprites.sprite.filters = p.sprites.sprite.filters.slice(0, -1).concat(nextGlow)
        } else {
          p.sprites.sprite.filters = p.sprites.sprite.filters.concat(nextGlow)
        }
      }
    }
    const removeGlow = (p) => {
      if (!p.sprites.sprite.filters?.length) return
      const lastFilter = p.sprites.sprite.filters[p.sprites.sprite.filters.length - 1]
      const hasDamageGlow = lastFilter === HIGH_DAMAGE_GLOW_RED || lastFilter === HIGH_DAMAGE_GLOW_BLUE || lastFilter === SMALL_DAMAGE_GLOW
      if (hasDamageGlow) {
        p.sprites.sprite.filters = p.sprites.sprite.filters.slice(0, -1)
      }
    }
    const updateEnergyStatus = (p) => {
      if (!p.render) {
        p.sprites.energy.visible = false
        return;
      }
      const playerIsMe = p.id === Players.getMe()?.id
      const sameTeam = p.team === Players.getMe()?.team
      const isCarrier = p.id === carrierInfo[BLUE_TEAM]?.player?.id || p.id === carrierInfo[RED_TEAM]?.player?.id
      /*if (!p.team || p.team !== Players.getMe()?.team) {
        const missilesCanHandle = howManyMissilesCanHandle(p, Players.getMe()?.type)
        if (missilesCanHandle < 2 && !!settingsRef.current.healthGlowStrength) {
          addGlow(p,
                  missilesCanHandle < 1
                    ? (p.team === BLUE_TEAM ? HIGH_DAMAGE_GLOW_BLUE : HIGH_DAMAGE_GLOW_RED)
                    : SMALL_DAMAGE_GLOW
          )
        } else {
          removeGlow(p)
        }
      } else {*/
        if (!settingsRef.current.healthGlowStrength ||
          (!settingsRef.current.selfHealthGlow && playerIsMe) ||
          (settingsRef.current.othersHealthGlow === 'team' && !sameTeam) ||
          (settingsRef.current.othersHealthGlow === 'enemy' && sameTeam && !playerIsMe) ||
          (settingsRef.current.othersHealthGlow === 'carrier' && !isCarrier && !playerIsMe) ||
          (settingsRef.current.othersHealthGlow === 'none' && !playerIsMe)
        ) {
          removeGlow(p)
        } else {
          const mohawkMissilesCanHandle = howManyMissilesCanHandle(p, MOHAWK)
          if (mohawkMissilesCanHandle < 1) {
            addGlow(p, (p.team === BLUE_TEAM ? HIGH_DAMAGE_GLOW_BLUE : HIGH_DAMAGE_GLOW_RED))
          } else {
            const predMissilesCanHandle = howManyMissilesCanHandle(p, PREDATOR)
            if (predMissilesCanHandle < 1) {
              addGlow(p, SMALL_DAMAGE_GLOW)
            } else {
              removeGlow(p)
            }
          }
        }
      // }
      const fireEnergy = PLANE_FIRE_ENERGY[p.type]
      const canFirePercent = 1 - (p.energy < fireEnergy ? p.energy / fireEnergy : 1)
      const settingsVisible =
        !isNaN(settingsRef.current.ENERGY_COLOR) &&
        !(
          (!settingsRef.current.selfEnergyCircle && playerIsMe) ||
          (settingsRef.current.othersEnergyCircle === 'team' && !sameTeam) ||
          (settingsRef.current.othersEnergyCircle === 'enemy' && sameTeam && !playerIsMe) ||
          (settingsRef.current.othersEnergyCircle === 'carrier' && !isCarrier && !playerIsMe ) ||
          (settingsRef.current.othersEnergyCircle === 'none' && !playerIsMe)
        )

      p.sprites.energy.visible = settingsVisible && canFirePercent > 0 && canFirePercent <= 1
      if (p.sprites.energy.visible) {
        Graphics.transform(p.sprites.energy, p.pos.x - (ENERGY_CIRCLE_DIAMETER * canFirePercent / 2), p.pos.y - (ENERGY_CIRCLE_DIAMETER * canFirePercent / 2), 0, canFirePercent, null, null)
      }
    }
    onSettingsUpdated(['energyCircleColor','healthGlowStrength','selfEnergyCircle', 'selfHealthGlow','othersEnergyCircle', 'othersHealthGlow'],
    (settings) => {
      const ENERGY_COLOR = parseInt(settings.energyCircleColor?.replace("#",""),16)
      const HEALTH_STRENGTH = Number(settings.healthGlowStrength)
      settingsRef.current = {...settings,ENERGY_COLOR,HEALTH_STRENGTH}
      if (!isNaN(ENERGY_COLOR) || HEALTH_STRENGTH) {
        HIGH_DAMAGE_GLOW_RED.uniforms.innerStrength = HEALTH_STRENGTH
        HIGH_DAMAGE_GLOW_BLUE.uniforms.innerStrength = HEALTH_STRENGTH
        SMALL_DAMAGE_GLOW.uniforms.innerStrength = HEALTH_STRENGTH
        Object.keys(Players.getIDs()).map(Players.get).forEach(p => {
          if (p.sprites?.energy) {
            p.sprites.energy.tint = ENERGY_COLOR
          }
        })
        PlayerProto.setupGraphics = function (isPlaneTypeChange) {
          originalSetupGraphics.call(this, isPlaneTypeChange)
          if (!isPlaneTypeChange && ENERGY_COLOR) {
            const energy = createProgressSprite(ENERGY_CIRCLE_DIAMETER, 15)
            energy.tint = ENERGY_COLOR
            energy.alpha = 0.7
            energy.visible = false
            this.sprites.energy = energy
            game.graphics.layers.powerups.addChild(energy)
          }
        }
        PlayerProto.updateGraphics = function (e) {
          originalUpdateGraphics.call(this, e)
          updateEnergyStatus(this)
        }
        PlayerProto.destroy = function (fullDestroy) {
          originalDestroy.call(this, fullDestroy)
          if (this.sprites.energy && fullDestroy) {
            game.graphics.layers.powerups.removeChild(this.sprites.energy)
            this.sprites.energy.destroy()
          }
        }
        PlayerProto.visibilityUpdate = function (e) {
          originalVisibilityUpdate.call(this, e)
          if (!this.render && this.sprites.energy) {
            this.sprites.energy.visible = false
          }
        }
      } else {
        PlayerProto.setupGraphics = originalSetupGraphics
        PlayerProto.updateGraphics = originalUpdateGraphics
        PlayerProto.destroy = originalDestroy
        PlayerProto.visibilityUpdate = originalVisibilityUpdate
      }
    })

  })

/*
function update() {
    progressFrameTexture.frame = new PIXI.Rectangle(radius * frame, 0, radius, radius)
}

   */


  /**
   * HitCircles missile size
   */
  SWAM.on("gameRunning", function() {
    const MissilePathTexture = (function createMissilePointerTexture() {
      const width = 1;  // Width of the rectangle
      const height = 500; // Height of the rectangle
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // White
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Transparent
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      return PIXI.Texture.from(canvas);
    })()


    let missileSizeRef = {current: 100}
    let missilePathRef = {current: 0}
    const originalMobScaler = SWAM.Theme?._getMobScale

    const deferredUpdateMissileSize = ( ...args ) => setTimeout ( () => updateMissileSize( ...args ) )
    const addMissilePath = (mob,player) => {
      if (!missilePathRef.current) return
      const missilePath = new PIXI.Sprite(MissilePathTexture);
      missilePath.rotation = Math.PI;
      const w = 2 / game.graphics.layers.groundobjects.scale.x
      missilePath.x = w/2
      missilePath.width = w
      missilePath.height = 500
      missilePath.alpha = 0.3
      if (SWAM.Theme?._getThrusterTint) {
        missilePath.tint = SWAM.Theme._getThrusterTint(player)
      }
      game.graphics.layers.projectiles.addChild(missilePath)
      return missilePath
    }

    const getMobScale = (mob) => {
      const missileSizeMultiplier = missileSizeRef.current / 100

      return mob.type === 2
        ? [.2 * missileSizeMultiplier, .2 * missileSizeMultiplier]
        : mob.type === 3
          ? [.2 * missileSizeMultiplier, .2 * missileSizeMultiplier]
          : [.2 * missileSizeMultiplier, .15 * missileSizeMultiplier];
    }

    const updateMissilePointerGraphics = () => {

    }

    const updateMissileSize = (data,ex,playerId) => {
      let mob = Mobs.get ( data.id );
      let player = Players.get ( playerId );
      if ( !mob ) return;
      if ( ![ 1, 2, 3, 5, 6, 7 ].includes ( mob.type ) ) return;
      /*if (missilePathRef.current > 0) {
        mob.originalPos = mob.pos;
        if (mob.constructor.prototype.updateGraphics !== updateMissilePointerGraphics) {
          const originalUpdateGraphics = mob.constructor.prototype.updateGraphics
          const originalDestroy = mob.constructor.prototype.destroy
          mob.constructor.prototype.updateGraphics = function() {
            originalUpdateGraphics.call(this)
            if ( ![ 1, 2, 3, 5, 6, 7 ].includes ( this.type ) ) return;
            if (this.missilePath) {

            }
          }
          mob.constructor.prototype.destroy = function(msg) {
            originalDestroy.call(this,msg)
            if (this.missilePath) {
              game.graphics.layers.projectiles.removeChild(this.missilePath)
            }
          }
        }
        mob.missilePath = addMissilePath(mob, player)
      }*/

      const scale = getMobScale ( mob )
      // mob.sprites.thruster.scale.set( ...scale );
      // mob.sprites.thrusterGlow.scale.set( ...scale );
      mob.sprites.shadow.scale.set( ...scale );
      if (SWAM.Theme?._getMobScale && game.gameType === 2) return;
      mob.sprites.sprite.scale.set( ...scale );
    }


    onSettingsUpdated(['missileSize','missilePointerSize'],({missileSize,missilePointerSize}) => {
      missileSizeRef.current = Number(missileSize)
      missilePathRef.current = missilePointerSize
      if (SWAM.Theme?._getMobScale) {
        if (Number(missileSize) !== 100) {
          SWAM.Theme._getMobScale = getMobScale
        } else {
          SWAM.Theme._getMobScale = originalMobScaler
        }
      }
      if (Number(missileSize) !== 100) {
        SWAM.on('mobAdded', deferredUpdateMissileSize);
      } else {
        SWAM.off('mobAdded', deferredUpdateMissileSize);
      }
    })
  })

  /**
   * CTF flag carrier esc/rec
   */
  SWAM.on("gameRunning",async function () {

    const DISTANCE = (a,b) => Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
    const originalGamesNetworkFlag = Games.networkFlag;
    const originalUIscoreboardUpdate = UI.scoreboardUpdate

    let blueCarrier = null
    let redCarrier = null

    onSettingsUpdated('carrier',(type) => {
      Games.networkFlag = originalGamesNetworkFlag;
      UI.scoreboardUpdate = originalUIscoreboardUpdate;
      if (type !== 'none') {
        Games.networkFlag = function(t) {
          originalGamesNetworkFlag(t)
          const player = Players.get(t.id)
          const isBlue = t.flag === 1
          const element = document.getElementById(isBlue ? "blueflag-name" : 'redflag-name')
          element.querySelector(".player-plane")?.remove()
          if (player) {
            const playerPlane = document.createElement('span')
            const bluesClose = document.createElement('span')
            const redsClose = document.createElement('span')
            bluesClose.style.color = BLUE_COLOR
            redsClose.style.color = RED_COLOR
            bluesClose.className = "blues-close"
            redsClose.className = "reds-close"
            playerPlane.className = "player-plane"
            playerPlane.innerText = ` [${PLANE_LABELS[player.type]}] `
            playerPlane.prepend(bluesClose)
            playerPlane.append(redsClose)
            if (isBlue) {
              SWAM.trigger("carrierInfo",{plane:player.type,player,team:BLUE_TEAM})
              blueCarrier = t.id
              playerPlane.style.position = "absolute"
              playerPlane.style.top = "-20px"
              playerPlane.style.opacity = "0.45"
              playerPlane.style.right = "72px"
              element.insertBefore(playerPlane,element.querySelector(".rounds"))
            } else {
              SWAM.trigger("carrierInfo",{plane:player.type,player,team:RED_TEAM})
              redCarrier = t.id
              playerPlane.style.position = "absolute"
              playerPlane.style.top = "-20px"
              playerPlane.style.opacity = "0.45"
              playerPlane.style.left = "72px"
              element.prepend(playerPlane)
            }
          } else {
            if (isBlue) {
              SWAM.trigger("carrierInfo",{plane:null,team:BLUE_TEAM,blues:[],reds:[]})
              blueCarrier = null
            } else {
              SWAM.trigger("carrierInfo",{plane:null,team:RED_TEAM,blues:[],reds:[]})
              redCarrier = null
            }
          }
        }

        const getCloseToCarrier = (player) => {
          const players = Object.keys(Players.getIDs()).map(Players.get).filter(({removedFromMap}) => !removedFromMap)
          .map(({lowResPos,...playerInfo}) => ({...playerInfo,distance: DISTANCE(lowResPos,player.lowResPos)}))
          const blueTeam = players.filter(({team}) => team === BLUE_TEAM)
          const redTeam = players.filter(({team}) => team === RED_TEAM)
          return [blueTeam.filter(({distance,id}) => distance < 3500 && id !== player.id), redTeam.filter(({distance,id}) => distance < 3500 && id !== player.id)]
        }
        const planesNearHtml = (planesClose,team) => {
          const botsClose = planesClose.filter(isBot)
          const subColor = team === 1 ? "#26cae0" : "#e07d26"
          return `<span>${planesClose.length - botsClose.length}</span>${
            botsClose.length
            ? `<span style="font-size: 10px;color:${subColor};">+${botsClose.length}</span>`
            : ``}`
        }
        UI.scoreboardUpdate = (t,n,i) => {
          originalUIscoreboardUpdate(t,n,i)
          if (game.gameType == SWAM.GAME_TYPE.CTF) {
            if (type === 'count') {
              if (blueCarrier) {
                const [bluesClose, redsClose] = getCloseToCarrier(Players.get(blueCarrier))
                SWAM.trigger("carrierInfo",{plane:Players.get(blueCarrier).type,player:Players.get(blueCarrier),team: BLUE_TEAM,reds:redsClose,blues:bluesClose,hasCount:true})
                $("#blueflag-name .blues-close").html(planesNearHtml(bluesClose,BLUE_TEAM))
                $("#blueflag-name .reds-close").html(planesNearHtml(redsClose,RED_TEAM))
              }
              if (redCarrier) {
                const [bluesClose, redsClose] = getCloseToCarrier(Players.get(redCarrier))
                SWAM.trigger("carrierInfo",{plane:Players.get(redCarrier).type,player:Players.get(redCarrier),team:RED_TEAM,reds:redsClose,blues:bluesClose,hasCount:true})
                $("#redflag-name .blues-close").html(planesNearHtml(bluesClose,BLUE_TEAM))
                $("#redflag-name .reds-close").html(planesNearHtml(redsClose,RED_TEAM))
              }
            }
          }
        }
      }
    })
  })

  /**
   * QUICK RESIZE
   */
  SWAM.on("gameRunning",async function () {
    const currentSettingsRef = {ref:settings}
    const resize = (settings) => {
      const newScale = (SWAM.Settings.general.scalingFactor+"") === (settings.b.zoom+"") && (SWAM.Settings.ui.useSquaredScene === settings.b.squared)
        ? settings.a
        : settings.b
      SWAM.Settings.ui.useSquaredScene = newScale.squared
      SWAM.Settings.general.scalingFactor = newScale.zoom+""
      SWAM.resizeMap(newScale.zoom)
      UI.updateScalingWidgetState()
    }
    document.addEventListener("keydown", (e) => {
      const settings = currentSettingsRef.ref
      if (settings.key) {
        if (!UI.chatBoxOpen() && e.key?.toLowerCase() === settings.key.toLowerCase()) {
          resize(settings)
        }
      }
    })
    onSettingsUpdated('quickResize',(settings) => {
      currentSettingsRef.ref = settings
    })
  })
  /**
   * CTF WIN COLOR OVERLAY
   */
  SWAM.on("gameRunning",async function () {
    const originalShowBlue = SWAM.mapColorizer.showBlue
    const originalShowRed = SWAM.mapColorizer.showRed
    const originalFireworks = SWAM.fx.startFireworks
    onSettingsUpdated('ctfEndFx',(ctfEndFx) => {
      if (ctfEndFx) {
        SWAM.mapColorizer.showBlue = originalShowBlue
        SWAM.mapColorizer.showRed = originalShowRed
        SWAM.fx.startFireworks = originalFireworks
      } else {
        SWAM.mapColorizer.showBlue = () => {}
        SWAM.mapColorizer.showRed = () => {}
        SWAM.fx.startFireworks = () => {}
      }
    })
  })

  /**
   * Bots color on minimap
   */
  SWAM.on("gameRunning",async function () {
    const updateColors = () => {
      const mobs = UI.getMinimapMobs();
      Object.keys(mobs).forEach((id) => {
        const mob = mobs[id]
        const player = Players.get(id)
        const mobIsBot = isBot(player)
        const isNotCrown = mob.sprite.texture.width <= 16
        if (mobIsBot && isNotCrown) {
          const f = new PIXI.filters.ColorMatrixFilter()
          mob.sprite.filters = [f]
          mob.sprite.scale.set(0.6)
          f.hue(player.team === RED_TEAM ? 25 : -25,false)
        }
      })
    }
    onSettingsUpdated('botsColor',(botsColor) => {
      if (botsColor) {
        SWAM.on("scoreboardUpdate", updateColors)
      } else {
        SWAM.off("scoreboardUpdate", updateColors)
      }
    })
  })
  /**
   * Remove bots from scoreboard
   */
  SWAM.on("gameRunning",async function () {
    const settingsRef = {ref:settings}
    const PLANES = [1,2,3,4,5].map(i => $("#selectaircraft-"+i).css("background-image"))
    const enhanceScoreboard = () => {
      $("#scoreboard .line").each((i,e) => {
        const el = $(e)
        const player = Players.get(el.data("playerid"))
        if (player && settingsRef.ref.addPlaneTypeToScoreboard) {
          el.find(".flag").after($("<span class='small flag'></span>").css({"background-image":PLANES[player.type-1],
            "opacity":
              isSpec(player)
              ? '0'
                : player.type === 1
                  ? '0.2'
                  : '1'
          }))
        }
        if (game.gameType !== SWAM.GAME_TYPE.CTF) { return }
        if (player && isBot(player) && settingsRef.ref.removeBotsScoreboard) {
          el.remove()
        }
      })
    }
    onSettingsUpdated(['removeBotsScoreboard','addPlaneTypeToScoreboard'],(settings) => {
      settingsRef.ref = settings
      if (settings.removeBotsScoreboard || settings.addPlaneTypeToScoreboard) {
        SWAM.on("detailedScoreUpdate", enhanceScoreboard)
      } else {
        SWAM.off("detailedScoreUpdate", enhanceScoreboard)
      }
    })
  })

  /**
   * Keep firing while typing
   */
  SWAM.on("gameRunning", function () {
    const SPECIAL_KEYS = ['Shift','Control','Alt']
    const PLANE_BINDINGS = ['LEFT','RIGHT','UP','DOWN','STRAFELEFT','STRAFERIGHT','FIRE','SPECIAL']
    const SPACE_IS_LAST_REGEX = /.*\s$/
    const maybePlaneBinding = (key) => SPECIAL_KEYS.indexOf(key)>=0 || key?.length === 1
    const buildFakeMouseEvent = (button) => ({
      preventDefault: () => {},
      originalEvent: {
        target: {tagName: "canvas"},
        button
      }
    })

    const onWindowKeyDown = (event) => {
      if (UI.chatBoxOpen() && maybePlaneBinding(event.key) && (Players.getMe().type !== 5 || !Players.getMe().stealthed)) {
        const bind = Input.getBind(event.which);
        if (PLANE_BINDINGS.indexOf(bind)>=0) {
          if (bind === 'FIRE') {
            Input.mouseDown(buildFakeMouseEvent(0))
          } else if (bind === 'SPECIAL') {
            Input.mouseDown(buildFakeMouseEvent(2))
          }
        }
        if (SPACE_IS_LAST_REGEX.test(document.getElementById("chatinput").value) && event.key === ' ') {
          event.preventDefault()
        }
      }
    }
    const onWindowKeyUp = (event) => {
      if (UI.chatBoxOpen() && maybePlaneBinding(event.key) && Players.getMe().type !== 5) {
        const bind = Input.getBind(event.which);
        if (PLANE_BINDINGS.indexOf(bind)>=0) {
          if (bind === 'FIRE') {
            Input.mouseUp(buildFakeMouseEvent(0))
          } else if (bind === 'SPECIAL') {
            Input.mouseUp(buildFakeMouseEvent(2))
          }
        }
      }
    }
    onSettingsUpdated('keepFiringWhileTyping', (enabled) => {
      if (enabled) {
        $(window).on("keydown", onWindowKeyDown)
        $(window).on("keyup", onWindowKeyUp)
      } else {
        $(window).off("keydown", onWindowKeyDown)
        $(window).off("keyup", onWindowKeyUp)
      }
    })

  })



  /**
   * Custom Drop Flag key
   */
  SWAM.on("gameRunning", function () {
    const originalNetworkSendCommand = Network.sendCommand
    const settingsRef = {ref:settings}
    const onWindowKeyDown = (event) => {
      if (!UI.chatBoxOpen() && event.key?.toLowerCase() === settingsRef.ref?.dropFlagKey?.toLowerCase()) {
        Network.sendCommand("drop","",true)
      } else if (!UI.chatBoxOpen() && event.key?.toLowerCase() === settingsRef.ref?.dropUpgKey?.toLowerCase()) {
        Network.sendCommand("upgrades","drop",true)
      }
    }
    $(window).on("keydown", onWindowKeyDown)
    onSettingsUpdated(['dropFlagKey','dropUpgKey'], (values) => {
      settingsRef.ref = values
      Network.sendCommand = originalNetworkSendCommand
      if (values.dropFlagKey || values.dropUpgKey) {
        Network.sendCommand = (command, value, force) => {
          if (command === "drop" && !force && values.dropFlagKey) { return }
          if (command === "upgrades" && value === "drop" && !force && values.dropUpgKey) { return }
          originalNetworkSendCommand(command, value)
        }
      }
    })
  });

  /**
   * Show Plane Count
   */
  SWAM.on("gameRunning",async function () {
    let lastTooltipPlaneId = null
    const toggle = (isEnabled) => {
      const handleMouseEnter = (ev) => {
        lastTooltipPlaneId = ev.currentTarget.id.replace(/\D/g,"")
        updateTooltip(lastTooltipPlaneId)
      }
      const handleMouseLeave = (ev) => {
        lastTooltipPlaneId = null
      }
      const updateTooltip = (planeId = lastTooltipPlaneId) => {
        if (game.gameType !== SWAM.GAME_TYPE.CTF || !planeId) { return }
        const players = Object.keys(Players.getIDs())
          .map(Players.get).filter(p => !isBot(p) && !isSpec(p) && p.type === Number(planeId))
          .sort((a,b) => a.name.localeCompare(b.name))
        const bluePlayers = players.filter(p => p.team === BLUE_TEAM)
        const redPlayers = players.filter(p => p.team === RED_TEAM)
        const tooltip = $("#tooltip")
        const myTeam = Players.getMe().team
        const planeName = /*Number(planeId) === 5 && !players.find(p => p.team === myTeam) && players.find(p => p.team !== myTeam)
          ? "Scum" : */PLANE_FULL_LABELS[planeId]
        const HEADER = `<div class="header">${planeName}</div>`
        if (!players.length) {
          tooltip.html(
            `${HEADER}
<div class="name" style="color: #dcdcdc;">No player using this plane</div>`
          )
        } else {
        tooltip.html(
          `${HEADER}
${bluePlayers.map(player =>
  `<div class="name" style="color: ${BLUE_COLOR};"><span class="flag small flag-${player.flag}"></span>${player.name}</div>`
).join("")}
${redPlayers.map(player =>
  `<div class="name" style="color: ${RED_COLOR};"><span class="flag small flag-${player.flag}"></span>${player.name}</div>`
).join("")}
`)
          }
      }
      const appendPlaneNumber = (container,team,number) => {
        if (!number) { return }
        const el = document.createElement('div')
        el.style.display = "inline-block"
        el.style.position = "absolute"
        el.style.backgroundColor = "rgba(0, 0, 0, .8)"
        el.style.padding = "2px"
        el.style.borderRadius = "3px"
        el.style.textAlign = "center"
        el.style.bottom = "0"
        if (team === RED_TEAM) {
          el.style.right = "0"
          el.style.color = RED_COLOR
        } else {
          el.style.left = "0"
          el.style.color = BLUE_COLOR
        }
        el.textContent = number
        container.appendChild(el)
      }
      const updatePlaneCount = (Bt) => { // same code from engine.js
        if (game.gameType == SWAM.GAME_TYPE.CTF) {
          updateTooltip();
          const planeGroups = getPlaneGroups()
          Object.keys(PLANE_LABELS).map(planeId => {
            const planeIcon = document.getElementById("selectaircraft-"+planeId)
            if (planeIcon) {
              [...planeIcon.children].forEach(v => v.remove())
              const [bluePlanes,redPlanes] = planeGroups[planeId] || []
              appendPlaneNumber(planeIcon,BLUE_TEAM,bluePlanes)
              appendPlaneNumber(planeIcon,RED_TEAM,redPlanes)
            }
          })
        }
      }
      const spacer = $("#sidebar .spacer")
      const fastBots = () => {
        spacer.empty().css({minHeight:"14px",height:"auto"})
        if (game.gameType == SWAM.GAME_TYPE.CTF) {
          const [blue5555,red5555] = getFastBots()
          if (blue5555.length) {
            const S = blue5555.length === 1 ? "" : "S"
            spacer.append(`<div style='color: ${BLUE_COLOR};font-size: 12px;text-align: center;'>${blue5555.length} FAST BOT${S}</div>`)
          }
          if (red5555.length) {
            const S = red5555.length === 1 ? "" : "S"
            spacer.append(`<div style='color: ${RED_COLOR};font-size: 12px;text-align: center;'>${red5555.length} FAST BOT${S}</div>`)
          }
        }
      }
      if (isEnabled) {
        $(".aircraft").on("mouseenter",handleMouseEnter).on("mouseleave",handleMouseLeave)
        SWAM.on("scoreboardUpdate", updatePlaneCount)
        SWAM.on("scoreboardUpdate",fastBots)
      } else {
        $(".aircraft").off("mouseenter",handleMouseEnter).off("mouseleave",handleMouseLeave)
        SWAM.off("scoreboardUpdate", updatePlaneCount)
        SWAM.off("scoreboardUpdate",fastBots)
      }
    }
    onSettingsUpdated('showPlaneCount', toggle)
  });

  /**
   * Names on prowler radar
   */
  SWAM.on("gameRunning",async function () {
    let circleMapping = {}

    const addNameToPlayerStealth = ({id},force) => {
      const player = Players.get(id)
      if (isSpec(player) || player.type !== 5) { return }
      if (!force && circleMapping[id] && circleMapping[id].find(circle => circle?.children?.length > 0)) {
        circleMapping[id].forEach(circle => {
          circle.children[0].style.fill = (player.team === BLUE_TEAM ? BLUE_COLOR : RED_COLOR)
        })
        return true
      }
      const circles = game.graphics.layers.groundobjects.children
      .filter(({graphicsData}) => graphicsData?.[0]?.shape.radius === 600)
      .filter(({position}) => position.x === player.lowResPos.x && position.y === player.lowResPos.y)
      if (circles.length === 1 || circles.length === 2) {
        const isSame = !circleMapping[id] || (
          (circleMapping[id][0] === circles[0] || circleMapping[id][0] === circles[1]) &&
          (circleMapping[id][1] === circles[0] || circleMapping[id][1] === circles[1])
        )
        if (!isSame) {
          circleMapping[id].forEach(circle => circle.removeChildren())
        }
        circleMapping[id] = circles


        circles.forEach(circle => circle.removeChildren())
        circles.forEach(circle => {
          const text = new PIXI.Text(player.name,{fontFamily : ['MontserratWeb','Helvetica','sans-serif'], fontSize: 36, fontWeight: "bold", fill : player.team === BLUE_TEAM ? BLUE_COLOR : RED_COLOR, align : 'center'})
          text.position.set(-text.width/2,-text.height/2)
          circle.addChild(text)
        })
        return true
      }
    }
    const addAll = () => {
      if (game.graphics.layers.groundobjects.children.length > 1) {
        Object.keys(Players.getIDs()).map(id => addNameToPlayerStealth({id}))
      }
    }

    const clearAll = () => {
      game.graphics.layers.groundobjects.children.filter(v => v.graphicsData?.[0]?.shape.radius === 600).forEach(v => v.removeChildren())
      circleMapping = {}
    }
    const reteam = ({id}) => {
      if (id === Players.getMe().id) {
        clearAll()
        addAll()
      } else {
        delete circleMapping[id]
        addNameToPlayerStealth({id})
      }
    }
    const gamePrep = () => {
      clearAll()
      addAll()
    }
    onSettingsUpdated('nameOnProwlerRadar',(nameOnProwlerRadar) => {
      if (nameOnProwlerRadar) {
        SWAM.on("gamePrep",gamePrep)
        SWAM.on("playerStealth", (p) => addNameToPlayerStealth(p,true))
        SWAM.on("playerReteamed", reteam)
        SWAM.on("scoreboardUpdate",addAll)
      } else {
        SWAM.off("playerStealth", addNameToPlayerStealth)
        SWAM.off("playerReteamed", reteam)
        SWAM.off("gamePrep", gamePrep)
        SWAM.off("scoreboardUpdate",addAll)
        game.graphics.layers.groundobjects.children.filter(v => v.graphicsData?.[0]?.shape.radius === 600).forEach(v => v.removeChildren())
      }
    })
  })

  /**
   * Self Prowler radar
   */
  SWAM.on("gameRunning",async function () {
    let circleMapping = {}
    const circle = new PIXI.Graphics
    circle.clear();
    circle.beginFill(0x999999, .125);
    circle.drawCircle(0, 0, 600);
    circle.endFill();
    circle.renderable = false
    const text = new PIXI.Text("",{fontFamily : ['MontserratWeb','Helvetica','sans-serif'], fontSize: 36, fontWeight: "bold", fill : BLUE_COLOR, align : 'center'})
    text.position.set(-text.width/2,-text.height/2)
    circle.addChild(text)
    game.graphics.layers.groundobjects.addChild(circle)

    const updateStealth = () => {
      const me = Players.getMe()
      if (me?.stealthed) {
        text.text = me.name
        text.fill = me.team === BLUE_TEAM ? BLUE_COLOR : RED_COLOR
        circle.position.set(me.lowResPos.x, me.lowResPos.y)
        circle.renderable = true
      } else {
        circle.renderable = false
      }
    }

    onSettingsUpdated('selfProwlerRadar',(selfProwlerRadar) => {
      if (selfProwlerRadar) {
        SWAM.on("gamePrep",updateStealth)
        SWAM.on("playerStealth", updateStealth)
        SWAM.on("scoreboardUpdate",updateStealth)
        SWAM.on("playerReteamed", updateStealth)
      } else {
        SWAM.off("gamePrep",updateStealth)
        SWAM.off("playerStealth", updateStealth)
        SWAM.off("scoreboardUpdate",updateStealth)
        SWAM.off("playerReteamed", updateStealth)
      }
    })
  })

  /**
   * Message variables
   */
  SWAM.on("gameLoaded", function() {
    const originalNetworkSenders = {
      sendSay: Network.sendSay,
      sendTeam: Network.sendTeam,
      sendWhisper: Network.sendWhisper,
      sendChat: Network.sendChat
    }
    const carrierInfo = {
      [RED_TEAM]: {plane:null,team:RED_TEAM},
      [BLUE_TEAM]: {plane:null,team:BLUE_TEAM}
    }
    SWAM.on("carrierInfo", (info) => {
      carrierInfo[info.team] = info
    })
    const getEmojiColor = (blue,red) => blue>red ?"🔵":red>blue?"🔴":"⚪"
    const enhanceMessage = (message) => {
      return message
      .replace(/\$REC/i,() => {
        const myTeam = Players.getMe()?.team
        const recInfo = carrierInfo[myTeam === RED_TEAM ? RED_TEAM : BLUE_TEAM]
        if (!recInfo) { return ""}
        const emoji = myTeam === RED_TEAM ? "🔵" : "🔴"
        const redBots = recInfo.reds.filter(isBot).length
        const blueBots = recInfo.blues.filter(isBot).length
        const redPlayers = recInfo.reds.length - redBots
        const bluePlayers = recInfo.blues.length - blueBots
        return recInfo.plane ? `REC! ${emoji}${recInfo.player?.name} on ${PLANE_LABELS[recInfo.plane]}.` +
          (recInfo.hasCount ? ` Nearby 👨🏻[${bluePlayers}${getEmojiColor(bluePlayers,redPlayers)}${redPlayers}] 🤖[${blueBots}${getEmojiColor(blueBots,redBots)}${redBots}]` : "") : ``
      })
      .replace(/\$CAP/i,() => {
        const myTeam = Players.getMe()?.team
        const capInfo = carrierInfo[myTeam === RED_TEAM ? BLUE_TEAM : RED_TEAM]
        if (!capInfo) { return ""}
        const emoji = myTeam === RED_TEAM ? "🔴" : "🔵"
        const redBots = capInfo.reds.filter(isBot).length
        const blueBots = capInfo.blues.filter(isBot).length
        const redPlayers = capInfo.reds.length - redBots
        const bluePlayers = capInfo.blues.length - blueBots
        return capInfo.plane ? `CAP! ${emoji}${capInfo.player?.name} on ${PLANE_LABELS[capInfo.plane]}.` +
          (capInfo.hasCount ? ` Nearby 👨🏻[${bluePlayers}${getEmojiColor(bluePlayers,redPlayers)}${redPlayers}] 🤖[${blueBots}${getEmojiColor(blueBots,redBots)}${redBots}]` : "") : ``
      })
      .replace(/\$PLANES|\$SHIPS/i,() => {
        const [blue5555,red5555] = getFastBots()
        return Object.entries(getPlaneGroups())
        .sort(([planeA],[planeB]) => planeA > planeB ? 1 : -1)
        .map(([plane,[blue,red]]) => `${PLANE_LABELS[plane]?.toLowerCase()}[${blue}${getEmojiColor(blue,red)}${red}]`)
        .concat((blue5555.length || red5555.length) ? [`🚀🤖[${blue5555.length}${getEmojiColor(blue5555.length,red5555.length)}${red5555.length}]`] : [])
        .join(" ")
      })
    }
    const enhanceSender = (key, msgIndex) => {
      Network[key] = (...args) => {
        const enhancedMessage = enhanceMessage(args[msgIndex])
        if (!enhancedMessage || ['/t','/s'].indexOf(enhancedMessage.trim()) >= 0) { return }
        args[msgIndex] = enhancedMessage
        originalNetworkSenders[key](...args)
      }
    }
    enhanceSender('sendSay',0);
    enhanceSender('sendTeam',0);
    enhanceSender('sendWhisper',1);
    enhanceSender('sendChat',0);
  });


  /**
   * Leader enhancements
   */
  SWAM.on("gameRunning", () => {
    const BOTS_MODE_SMALL_LABEL = {
      recover: 'recap',
      capture: 'cap'
    }
    const MODE_COLORS = {
      'auto':'#193729',
      'recover':'#00a1ff',
      'defend':'#9100ff',
      'capture':'#ff8d00',
      'buddy':'#ff00ff',
      'assist':'#1b781b'
    }
    let currentLeader = null;
    let currentMode = null
    let currentAssisted = null;
    let lastCommandLinePlayer = null
    let lastAssistLine = '';

    SWAM.on("chatLineAdded",(player,text,type) => {
      if (text.indexOf("#assist")>=0) {
        lastCommandLinePlayer = player
        lastAssistLine = unescapeHTML(text);
        return;
      }
      if (['#cap','#recap','#recover','#buddy','#defend','#auto','#storm'].indexOf(text)>=0) {
        lastCommandLinePlayer = player
        return
      }
      if (isBot(player)) {
        if (text.indexOf(" is still the team leader.")>0) {
          currentLeader = Players.getByName(text.replace(" is still the team leader.",""))
        } else if (text.indexOf(' has been chosen as the new team leader.')>=0) {
          currentMode = 'auto';
          currentAssisted = null
          currentLeader = Players.getByName(text.replace(' has been chosen as the new team leader.',''))
        } else if (text.indexOf(' the new team leader.')>=0 && text.indexOf("#yes") < 0) {
          currentMode = 'auto';
          currentAssisted = null
          currentLeader = Players.getByName(text.replace(/^.* has made (.*) the new team leader\.$/,'$1'))
        } else if (text.indexOf('The blue team has 6 bots in ')===0) {
          currentMode = text.split('The blue team has 6 bots in ')[1].split(' ')[0]
          currentLeader = Players.getByName(text.split('controlled by ')[1].replace(/\.$/,''))
        } else if (text.indexOf('The red team has 6 bots in ')===0) {
          currentMode = text.split('The red team has 6 bots in ')[1].split(' ')[0]
          currentLeader = Players.getByName(text.split('controlled by ')[1].replace(/\.$/,''))
        } else {
          switch (text) {
            case 'Bots will storm the base in 60 seconds!':
              currentMode = 'storm';
              currentAssisted = null
              currentLeader = lastCommandLinePlayer
            case 'recover mode enabled.':
              currentMode = 'recover';
              currentAssisted = null
              currentLeader = lastCommandLinePlayer
              break;
            case 'capture mode enabled.':
              currentMode = 'capture';
              currentAssisted = null
              currentLeader = lastCommandLinePlayer
              break;
            case 'defend mode enabled.':
              currentMode = 'defend';
              currentAssisted = null
              currentLeader = lastCommandLinePlayer
              break;
            case 'auto mode enabled.':
              currentMode = 'auto';
              currentAssisted = null
              currentLeader = lastCommandLinePlayer
              break;
            case 'buddy mode enabled.':
              currentMode = 'buddy';
              currentAssisted = null
              currentLeader = lastCommandLinePlayer
              break;
            case 'assist mode enabled.':
              currentLeader = lastCommandLinePlayer
              const assisted = lastAssistLine.replace("#assist ","")
              if (assisted === 'me') {
                currentAssisted = currentLeader.name
              } else {
                currentAssisted = assisted;
              }
              currentMode = 'assist';
              break;
          }
        }
        SWAM.trigger("leaderInfo",{mode:currentMode,leader:currentLeader,assist: currentAssisted})
      }
    })
    const resetMode = (defaultMode = '') => {
      currentMode = defaultMode
      currentAssisted = null
      SWAM.trigger("leaderInfo",{mode:currentMode,leader:currentLeader})
    }
    const resetLeader = (defaultMode = '') => {
      resetMode(defaultMode)
      currentLeader = null
    }
    SWAM.on("CTF_MatchEnded", () => resetLeader('auto'))
    SWAM.on("gamePrep", resetLeader)
    const onPlayerChange =  ({id}) => {
      if (id === Players.getMe()?.id) {
        resetLeader()
      } else if (Players.getByName(currentAssisted)?.id === id) {
        resetMode('auto')
      }
    }
    SWAM.on("playerReteamed",onPlayerChange)
    SWAM.on("playerDestroyed", onPlayerChange)

    /*SWAM.on("CTF_FlagEvent",(_,team,action) => {
      switch (action) {
        case 'taken':
      }
      if (false && currentLeader === Players.getMe()) {
        if (team === Players.getMe().team) {
          if (action === 'taken') {
            if (currentMode === 'defend') {
              Network.sendTeam("#recap")
            }
          } else if (action === 'returned') {
            // if ()
          } else if (currentMode === 'recap') {
            Network.sendTeam("#defend")
          }
        } else if (action === 'captured') {
          // SWAM.trigger("leaderInfo", {mode: 'recover', leader: currentLeader})
        }
      }
    })*/

    const modeText = $("<span></span>").css({
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              maxWidth: '100px',
                                              textOverflow: 'ellipsis',
                                              display: 'block',
                                            })
    const assistText = $("<span></span>").css({
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                maxWidth: '100px',
                                                textOverflow: 'ellipsis',
                                                display: 'block',
                                              })
    const modeContainer = $("<div></div>").css({
                                                 verticalAlign: 'top',
                                                 padding: '6px 4px',
                                                 backgroundColor: '#228a12',
                                                 borderRadius: '4px',
                                                 fontSize: '13px',
                                                 fontWeight: '700',
                                                 cursor: 'pointer',
                                                 color: '#fff',
                                                 textShadow: '0 -1px 0 rgba(0, 0, 0, .6)',
                                                 borderBottom: '2px solid rgba(0, 0, 0, .2)'
                                               })
    const leaderContainer = $("<div>").css({
                                             fontSize: '12px',
                                             paddingLeft: '32px',
                                             maxWidth: '100px',
                                             textOverflow: 'ellipsis',
                                             whiteSpace: 'nowrap',
                                             overflow: 'hidden',
                                             display: 'inline-block',
                                             color: '#fff',
                                             fontWeight: '700',
                                             marginRight: '20px',
                                             verticalAlign: 'middle',
                                             textShadow: '0 0 6px rgba(0, 0, 0, .6)'
                                           })
    let hasStarted = false
    const addModeContainer = () => {
      modeContainer.hide()
      if (game.gameType == SWAM.GAME_TYPE.CTF) {
        $("#gamespecific > .redflag").before(modeContainer).css({left: 'calc(50% + 26px)'})
        $("#gamespecific > .blueflag").css({right: 'calc(50% + 24px)'})
      }
    }
    onSettingsUpdated('showBotMode',(showBotMode) => {
      if (!showBotMode) {
        leaderContainer.remove()
        modeContainer.remove()
        $("#roomname").show()
        $("#gamespecific > .redflag").css({left:''})
        $("#gamespecific > .blueflag").css({right:''})
        return
      }
      if (hasStarted) {
        addModeContainer()
      }
      modeContainer.hide().append(modeText).append(assistText)
      $("#roomname").after(leaderContainer)

      SWAM.on("leaderInfo", ({mode, leader, assist}) => {
        $("#roomname").toggle(!(leader || mode))
        if (leader) {
          leaderContainer.text(leader.name).css({display: 'inline-block'})
        } else {
          leaderContainer.text("").css({display: 'hidden'})
        }
        if (mode) {
          modeText.text(BOTS_MODE_SMALL_LABEL[mode] || mode)
          modeContainer.css({display: 'inline-block', backgroundColor: MODE_COLORS[mode]}).show()
        } else {
          modeText.text("")
          modeContainer.css({display: 'none'})
        }
        if (assist) {
          assistText.text(assist).show()
        } else {
          assistText.text("").hide()
        }
      })

      SWAM.on("playerAdded", (player) => {
        if (player === Players.getMe()) {
          hasStarted = true
          addModeContainer()
        }
      })
    })
  })

  /**
   * Font
   */
  SWAM.on("gameRunning", () => {
    let ModStyles = $("#ModStyles")
    let originalModStyles
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#scoreboard .line { margin-bottom: 5px; line-height: 15px; }';

    onSettingsUpdated("vanillaFont", (vanillaFont) => {
      if (vanillaFont) {
        const toRemove = [45, 27, 27]
        originalModStyles = ModStyles.clone()
        const styleSheet = Array.from(document.styleSheets).find(e => e.ownerNode === ModStyles[0])
        toRemove.forEach(i => styleSheet.deleteRule(i))
        document.getElementsByTagName('head')[0].appendChild(style);
      } else if (originalModStyles) {
        ModStyles.remove()
        originalModStyles.appendTo("body")
        ModStyles = originalModStyles
        document.getElementsByTagName('head')[0].removeChild(style)
      }
    })
  })

  /**
   * Add flag/leader to nameplate, remove health
   */
  SWAM.on("gameRunning", () => {
    SWAM.on("gamePrep",() => {
      clearInterval(SWAM.PlayerInfoTimer)
      const updatePlayersNamePlate = function() {
        var Bt = Players.getIDs()
          , Gt = Players.getMe();
        for (var Xt in Bt) {
          var Yt = Players.get(Xt);
          "undefined" != typeof Yt.scorePlace && (Yt.sprites.name.text = Yt.scorePlace + ". " + Yt.name)
        }
      }
      SWAM.PlayerInfoTimer = setInterval(updatePlayersNamePlate, 500)
    })


    let ResizeNamePlates = (Bt) =>{
      let Gt = Math.round(25 * Bt / 2500) + "px"
        , Xt = Math.round(20 * Bt / 2500) + "px";
      if (config.playerNameSize = Gt,
        config.playerLevelSize = Xt,
      game.state == Network.STATE.PLAYING) {
        let Yt = Players.getIDs();
        for (let jt in Yt) {
          var Ht = Players.get(jt);
          Ht.sprites.name.style.fontSize = Gt,
          Ht.sprites.level && (Ht.sprites.level.style.fontSize = Xt)
        }
      }
    }

    onSettingsUpdated('resizeNameplate',(resizeNameplate) => {
      if (resizeNameplate) {
        SWAM.resizeMap = function(Bt) {
          config.scalingFactor = Bt,
            Graphics.resizeRenderer(window.innerWidth, window.innerHeight),
            ResizeNamePlates(Bt)
        }
        SWAM.resizeMap(config.scalingFactor)
      } else {
        SWAM.resizeMap = function(Bt) {
          config.scalingFactor = Bt,
            Graphics.resizeRenderer(window.innerWidth, window.innerHeight),
            ResizeNamePlates(3500)
        }
        SWAM.resizeMap(config.scalingFactor)
      }
    })
  })


  /**
   * Save chat size
   */
  SWAM.on("gameRunning", () => {
    const savedChatboxSizeStr = localStorage.getItem("chatboxsize")
    if (savedChatboxSizeStr) {
      const {width,height} = JSON.parse(savedChatboxSizeStr)
      const constrainedHeight = Math.min(parseInt(height),window.innerHeight-140)
      $("#chatbox").css({width,height:constrainedHeight})
      $("#minimizechatcontainer").css({width,bottom:constrainedHeight})
      $("#chatinput").css({width,bottom: constrainedHeight + 20 + "px"})
      $("#radioPanel").css({bottom: constrainedHeight + "px"})
    }
    $("#chatbox").on("mouseup", (e) => {
      localStorage.setItem("chatboxsize", JSON.stringify({
        width: e.currentTarget.style.width,
        height: e.currentTarget.style.height
      }))
    })
  })


  /**
   * Remove upgrades
   */
  SWAM.on("gameRunning", () => {
    const prevUIUpdateUpgrades = UI.updateUpgrades
    let prevIsZero = false

    UI.updateUpgrades = (values,...rest) => {
      const totalUpgs = values.reduce((a, b) => a + b, 0)
      if (prevIsZero) {
        if (totalUpgs === 20) {
          $(".upgrade").hide()
        } else {
          $(".upgrade").show()
        }
      }
      prevIsZero = totalUpgs === 0
      prevUIUpdateUpgrades(values,...rest)
    }
  })


  /**
   * Radio keybindings
   */

  SWAM.on("gameRunning", function () {
    const originalSwamRadioHandleKeys = SWAM.radio.handle_keys
    onSettingsUpdated(['chatRadioKey','teamRadioKey','sayRadioKey'], ({chatRadioKey,teamRadioKey,sayRadioKey}) => {
      const mapping = {
        [chatRadioKey.toLowerCase()]: 90,
        [teamRadioKey.toLowerCase()]: 88,
        [sayRadioKey.toLowerCase()]: 67
      }
      SWAM.radio.handle_keys = (e) => {
        if ([90, 88, 67].indexOf(e.which) >= 0 && !mapping[e.key.toLowerCase()]) {
          return;
        }
        if (mapping[e.key.toLowerCase()]) {
          originalSwamRadioHandleKeys(
            {
              which: mapping[e.key.toLowerCase()],
              preventDefault: e.preventDefault,
              stopPropagation: e.stopPropagation,
              stopImmediatePropagation: e.stopImmediatePropagation
            })
        } else {
          originalSwamRadioHandleKeys(e)
        }
      }
    })
  });


  /**
   * Add chat filter
   */
  /*SWAM.on("gameRunning", () => {
    let filters = []
    return false
    const createFilter = (label) => {
      return $(`<label style="background: black;padding: 3px;"><input type='checkbox' style='vertical-align: middle;margin-right: 3px;'>${label}</label>`)
    }
    const mentions = createFilter('Mention')
    const pub = createFilter('Pub')
    const whisper = createFilter('DM')
    const bots = createFilter('Bots')
    const team = createFilter('Team')
    $("#minimizechatcontainer").prepend(mentions, pub, whisper, bots, team)
  })*/

  /**
   * Airmash-refugees zoom slider
   */

    // airmash-refugees Zoom slider (https://github.com/airmash-refugees/airmash-frontend/)

  SWAM.on("gameLoaded", () => {
    let scaleBox = null;
    let scaleKnob = null;
    let scaleIsDragging = false;
    let scaleDragOffset = -1;
    let delayedGraphicsResizeTimer = null;
    const SCALE_MIN = 800;
    const SCALE_MAX = 7000;


    UI.createScaleSlider = function() {
      scaleBox = document.createElement('div');
      scaleBox.style.position = 'absolute';
      scaleBox.style.width = '250px';
      scaleBox.style.background = 'white';
      scaleBox.style.borderRadius = '5px';
      scaleBox.style.top = '21px';
      scaleBox.style.left = '320px';
      scaleBox.style.zIndex = 110;
      scaleBox.style.height = '10px';
      scaleBox.style.opacity = 0.07;

      scaleKnob = document.createElement('div');
      scaleKnob.style.position = 'absolute';
      scaleKnob.style.width = '22px';
      scaleKnob.style.background = 'white';
      scaleKnob.style.borderRadius = '5px';
      scaleKnob.style.top = '21px';
      scaleKnob.style.left = '350px';
      scaleKnob.style.zIndex = 110;
      scaleKnob.style.height = '10px';
      scaleKnob.style.opacity = 0.08;

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', 24);
      svg.setAttribute('height', 24);
      svg.setAttribute('viewBox', '0 0 24 24');

      document.body.appendChild(scaleBox);
      document.body.appendChild(scaleKnob);

      scaleKnob.addEventListener('mousedown', UI.onScaleKnobMouseDown);
      document.addEventListener('mousemove', UI.onScaleKnobMouseMove);
      document.addEventListener('mouseup', UI.onScaleKnobMouseUp);

      UI.updateScalingWidgetState();
    };


    UI.scaleIncrease = function() {
      UI.setScalingFactor(UI.getScalingFactor() + 200);
      UI.updateScalingWidgetState();
    };

    UI.scaleDecrease = function() {
      UI.setScalingFactor(UI.getScalingFactor() - 200);
      UI.updateScalingWidgetState();
    };

    UI.scaleDefault = function() {
      UI.setScalingFactor(2500);
      UI.updateScalingWidgetState();
    };

    UI.hideScaleSlider = function() {
      scaleBox.style.display = 'none';
      scaleKnob.style.display = 'none';
    };

    UI.showScaleSlider = function() {
      scaleBox.style.display = 'block';
      scaleKnob.style.display = 'block';
    };

    UI.onScaleKnobMouseDown = function(event) {
      scaleIsDragging = true;
      scaleDragOffset = event.clientX - event.target.getBoundingClientRect().left;
    };

    UI.getScalingFactor = function() {
      return UI.capScalingFactor(config.scalingFactor)
    };

    UI.capScalingFactor = function(zoom) {
      return Math.min(SCALE_MAX, Math.max(SCALE_MIN, zoom));
    };

    UI.scheduleGraphicsResize = function(delay) {
      clearTimeout(delayedGraphicsResizeTimer);
      delayedGraphicsResizeTimer = setTimeout(function()
                                              {
                                                SWAM.resizeMap(config.scalingFactor)
                                              }, delay || 0);
    };

    UI.setScalingFactor = function(zoom) {
      config.scalingFactor = zoom
      UI.scheduleGraphicsResize(100);
    };

    UI.onScaleKnobMouseMove = function(event) {
      if(scaleIsDragging) {
        var minLeft = parseInt(scaleBox.style.left, 10);
        var maxLeft = minLeft + (
          parseInt(scaleBox.style.width, 10) -
          parseInt(scaleKnob.style.width, 10)
        );

        var left = Math.max(
          minLeft,
          Math.min(
            maxLeft,
            event.clientX - scaleDragOffset
          )
        );
        scaleKnob.style.left = left + 'px';
        UI.setScalingFactor(SCALE_MIN + ((SCALE_MAX - SCALE_MIN) * ((left - minLeft) / (maxLeft - minLeft))));
      }
    };

    UI.updateScalingWidgetState = function() {

      var minLeft = parseInt(scaleBox.style.left, 10);
      var maxLeft = minLeft + (
        parseInt(scaleBox.style.width, 10) -
        parseInt(scaleKnob.style.width, 10)
      );

      var zoom = UI.getScalingFactor();
      var left = minLeft + ((zoom - SCALE_MIN) * ((maxLeft - minLeft) / (SCALE_MAX - SCALE_MIN)));
      scaleKnob.style.left = left + 'px';
    };

    UI.onScaleKnobMouseUp = function(event) {
      if(scaleIsDragging) {
        scaleIsDragging = false;
      }
    };

    const originalUISetup = UI.setup
    const originalUIGameStart = UI.gameStart
    UI.setup = () => {
      originalUISetup()
      UI.createScaleSlider();
      UI.hideScaleSlider();
    }
    UI.gameStart = (playerName, isFirstTime) => {
      originalUIGameStart(playerName, isFirstTime)
      UI.showScaleSlider();
    }

  })


  SWAM.on("gameRunning",() => {
    //removes powerup effects and zoom slider
    SWAM.settingsProvider.sections[0].fields.splice(0,1)
    SWAM.settingsProvider.sections[0].fields.splice(2,1)

    if (SWAM.Settings.general.powerupsFX || !SWAM.Settings.extensions.starmashthings.SWAMSensibleDefaults) {
      // sensible defaults
      SWAM.Settings.extensions.starmashthings.SWAMSensibleDefaults = 1
      SWAM.Settings.general.powerupsFX = false
      SWAM.Settings.ui.useSquaredScene = false
      if(SWAM.Settings.general.powerupsFX) {
        SWAM.Settings.ui.showWhoKilledWho = false
        SWAM.Settings.ui.showLogConnections = false
      }
      Tools.setSettings({
        SWAM_Settings: SWAM.Settings
      })
    }
    if (typeof SWAM.Settings.extensions.starmashthings.othersEnergyCircle === 'boolean') {
      SWAM.Settings.extensions.starmashthings.othersEnergyCircle =
        SWAM.Settings.extensions.starmashthings.othersEnergyCircle ? 'all' : 'none'
      SWAM.Settings.extensions.starmashthings.othersHealthGlow =
        SWAM.Settings.extensions.starmashthings.othersHealthGlow ? 'all' : 'none'
      Tools.setSettings({
                          SWAM_Settings: SWAM.Settings
                        })
    }

  })

  /**
   *  utils
   */
  function deepEqual(x, y) {
    if (typeof x !== "object" || x === null ||
      typeof y !== "object" || y === null
    ) return Object.is(x, y);

    if (x === y)
      return true;

    if (Array.isArray(x)) {
      if (!Array.isArray(y) || x.length !== y.length)
        return false;

      for (let i = 0; i < x.length; i++) {
        if (!deepEqual(x[i], y[i]))
          return false;
      }
    } else {
      if (Array.isArray(y))
        return false;

      const keys = Object.keys(x);
      if (Object.keys(y).length !== keys.length)
        return false;

      for (const key of keys) {
        if (!Object.prototype.propertyIsEnumerable.call(y, key) ||
          !deepEqual(x[key], y[key])
        ) return false;
      }
    }
    return true;
  }

  const createRectangleSprite = ({color,x,y, height,width, alpha = 0.3}) => {
    var sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.tint = color; //Change with the color wanted
    sprite.alpha = alpha;
    sprite.width = width;
    sprite.height = height;
    sprite.x = x
    sprite.y = y
    sprite.roundPixels = true
    return sprite
  }


  const unescapeHTML = (text) => text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/").replace(/&#x60;/g, "`")

  SWAM.registerExtension({
    name: "Starmash*",
    id: "starmashthings",
    description: "De* collection of Starmash features (see Mod Settings)",
    author: "Debug",
    version: "1.3.2",
    settingsProvider: createSettingsProvider()
  });

}();
