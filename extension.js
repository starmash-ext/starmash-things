!function() {

  let settings = {
    fixPlayerCount: true,
    respawnLines: true,
    fixHud: true,
    keepFiringWhileTyping:true,
    carrier: 'count',
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
    dropFlagKey: 'Y'
  };

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
    miscSection.addBoolean("keepFiringWhileTyping", "Keep firing while typing");
    miscSection.addString("dropFlagKey", "CTF drop key.");
    miscSection.addBoolean("fixPlayerCount", "Improve CTF team player count");
    miscSection.addBoolean("respawnLines", "Add CTF respawn lines");
    miscSection.addValuesField("carrier", "Display CTF carrier type",
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
    SWAM.on("settingsUpdated", (nextSettings) => {
      if (!deepEqual(previousSettings[key],nextSettings[key])) {
        callback(nextSettings[key],false)
      }
      previousSettings = nextSettings
    })
    callback(settings[key],true)
  }


  /**
   *  FIX PLAYER COUNT
   */
  SWAM.on("gameRunning",async function () {

    const INITIAL_EXTRALATENCY = 0;
    let lowPings = []

    const originalPlayersKill = Players.kill
    const originalUIUpdateScore = UI.updateScore;
    const originalUIUpdateStats = UI.updateStats;

    const isBot = player => player.name.indexOf('[bot] ') === 0 && lowPings.indexOf(player.id) >= 0
    const isSpec = player =>
      player.removedFromMap && (performance.now() - (player.lastKilled || 0)) > 3000

    const toggle = (isEnabled) => {
      if (isEnabled) {
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
          lowPings = On.scores.filter(p => p.ping < 10).map(p => p.id)
        }

        UI.updateStats = function (Bt) { // same code from engine.js
          let Gt = "";
          if (game.gameType == SWAM.GAME_TYPE.CTF) {
            let Ht = 0
              , jt = 0;
            forEachPlayer(Wt => {
                if (!isSpec(Wt) && !isBot(Wt)) { // new code
                  1 == Wt.team ? Ht++ : jt++
                }
              }
            ),
              Gt = "<span class='greyed'>&nbsp;&nbsp;(<span style='color: #4076E2'>" + Ht + "</span>&nbsp;/&nbsp;<span style='color: #EA4242'>" + jt + "</span>)<span class='greyed'>"
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
          Yt += '<div class="item"><span class="icon-container"><div class="icon players"></div></span><span class="greyed">' + Bt.playersgame + "&nbsp;/&nbsp;</span>" + Xt + Gt + '<span class="icon-container padded"><div class="icon ping"></div></span>' + Bt.ping + '<span class="millis">ms</span></div>',
            $("#gameinfo").html(Yt),
            game.ping = Bt.ping
        };
      } else {
        Players.kill = originalPlayersKill
        UI.updateScore = originalUIUpdateScore;
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
    const createSprite = ({color,x,y, height,width}) => {
      var sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      sprite.tint = color; //Change with the color wanted
      sprite.alpha = 0.3;
      sprite.width = width;
      sprite.height = height;
      sprite.x = x
      sprite.y = y
      sprite.roundPixels = true
      return sprite
    }
    const blueXSpawn = createSprite({color:0x0000FF, x:0,y:-config.mapHeight/2, height:config.mapHeight,width:1/game.graphics.layers.groundobjects.scale.x})
    const redXSpawn = createSprite({color:0xFF0000, x:-1024,y:-config.mapHeight/2, height:config.mapHeight,width:1/game.graphics.layers.groundobjects.scale.x})
    const blueYSpawn = createSprite({color:0x0000FF, y:0, x:0,  width:config.mapWidth/2,height:1/game.graphics.layers.groundobjects.scale.y})
    const redYSpawn = createSprite({color:0xFF0000, y:-512, x:-1024 - config.mapWidth/2,width:config.mapWidth/2,height:1/game.graphics.layers.groundobjects.scale.y})

    const onRenderResized = async function () {
      redXSpawn.width = 1 / game.graphics.layers.groundobjects.scale.x
      blueXSpawn.width = 1 / game.graphics.layers.groundobjects.scale.x
      redYSpawn.height = 1 / game.graphics.layers.groundobjects.scale.y
      blueYSpawn.height = 1 / game.graphics.layers.groundobjects.scale.y
    }
    const toggle = (isEnabled,firstTime) => {
      if (isEnabled) {
        const addRespawnLines = () => {
          if (game.gameType === 2) {
            game.graphics.layers.groundobjects.addChild(redXSpawn)
            game.graphics.layers.groundobjects.addChild(blueXSpawn)
            game.graphics.layers.groundobjects.addChild(redYSpawn)
            game.graphics.layers.groundobjects.addChild(blueYSpawn)
          } else {
            game.graphics.layers.groundobjects.removeChild(redXSpawn)
            game.graphics.layers.groundobjects.removeChild(blueXSpawn)
            game.graphics.layers.groundobjects.removeChild(redYSpawn)
            game.graphics.layers.groundobjects.removeChild(blueYSpawn)
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
        game.graphics.layers.groundobjects.removeChild(redXSpawn)
        game.graphics.layers.groundobjects.removeChild(blueXSpawn)
        game.graphics.layers.groundobjects.removeChild(redYSpawn)
        game.graphics.layers.groundobjects.removeChild(blueYSpawn)
        SWAM.off("rendererResized", onRenderResized)
      }
    }
    onSettingsUpdated('respawnLines', toggle)
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

      Graphics.render = function () {
        Graphics.renderer.render(game.graphics.layers.shadows, game.graphics.gui.shadows, true),
          Graphics.renderer.render(game.graphics.layers.game)
      };

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
   * CTF flag carrier esc/rec
   */
  SWAM.on("gameRunning",async function () {

    const PLANE_LABELS = {
      1: "pred",
      2: "goli",
      3: "heli",
      4: "torn",
      5: "prow",
    }

    const BLUE_COLOR = '#4076E2'
    const RED_COLOR = '#EA4242'

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
              blueCarrier = t.id
              playerPlane.style.position = "absolute"
              playerPlane.style.top = "-20px"
              playerPlane.style.opacity = "0.45"
              playerPlane.style.right = "72px"
              element.insertBefore(playerPlane,element.querySelector(".rounds"))
            } else {
              redCarrier = t.id
              playerPlane.style.position = "absolute"
              playerPlane.style.top = "-20px"
              playerPlane.style.opacity = "0.45"
              playerPlane.style.left = "72px"
              element.prepend(playerPlane)
            }
          } else {
            if (isBlue) {
              blueCarrier = null
            } else {
              redCarrier = null
            }
          }
        }

        const getCloseToCarrier = (player) => {
          const players = Object.keys(Players.getIDs()).map(Players.get).filter(({removedFromMap}) => !removedFromMap)
            .map(({id,team,lowResPos}) => ({id,team,distance: DISTANCE(lowResPos,player.lowResPos)}))
          const redTeam = players.filter(({team}) => team === 2)
          const blueTeam = players.filter(({team}) => team === 1)
          return [blueTeam.filter(({distance}) => distance < 2500).length, redTeam.filter(({distance}) => distance < 2500).length]
        }
        UI.scoreboardUpdate = (t,n,i) => {
          originalUIscoreboardUpdate(t,n,i)
          if (type === 'count') {
            if (blueCarrier) {
              const [bluesClose, redsClose] = getCloseToCarrier(Players.get(blueCarrier))
              document.getElementById("blueflag-name").querySelector(".blues-close").innerText = ` ${bluesClose} `
              document.getElementById("blueflag-name").querySelector(".reds-close").innerText = ` ${redsClose} `
            }
            if (redCarrier) {
              const [bluesClose, redsClose] = getCloseToCarrier(Players.get(redCarrier))
              document.getElementById("redflag-name").querySelector(".blues-close").innerText = ` ${bluesClose} `
              document.getElementById("redflag-name").querySelector(".reds-close").innerText = ` ${redsClose} `
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
      if (UI.chatBoxOpen() && maybePlaneBinding(event.key)) {
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
      if (UI.chatBoxOpen() && maybePlaneBinding(event.key)) {
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
      if (!UI.chatBoxOpen() && event.key?.toLowerCase() === settingsRef.ref?.toLowerCase()) {
        Network.sendCommand("drop","",true)
      }
    }
    $(window).on("keydown", onWindowKeyDown)
    onSettingsUpdated('dropFlagKey', (key) => {
      settingsRef.ref = key
      Network.sendCommand = originalNetworkSendCommand
      if (key) {
        Network.sendCommand = (command, value, force) => {
          if (command === "drop" && !force) { return }
          originalNetworkSendCommand(command, value)
        }
      }
    })
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

  SWAM.registerExtension({
      name: "Starmash*",
      id: "starmashthings",
      description: "De* collection of Starmash features (see Mod Settings)",
      author: "Debug",
      version: "1.1",
      settingsProvider: createSettingsProvider()
  });

}();
