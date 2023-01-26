// ==UserScript==
// @name         DnDBeyond Encounter Tools
// @description  Encounter Tools
// @version      0.1.0
// @author       Sowry
// @namespace    Sowry
// @downloadURL    https://raw.githubusercontent.com/sowry-rascality/DnDBeyondEncounterTools/main/DnDBeyondEncounterTools.js
// @updateURL    https://raw.githubusercontent.com/sowry-rascality/DnDBeyondEncounterTools/main/DnDBeyondEncounterTools.js
// @homepageURL  https://github.com/sowry-rascality/DnDBeyondEncounterTools
// @match      https://www.dndbeyond.com/*combat-tracker/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
  'use strict';
  const styles = `
  `;
  
  
  var cssId = 'DnDBeyondEncounterTools';  // you could encode the css path itself to generate id..
  if (!document.getElementById(cssId))
  {
      var head  = document.getElementsByTagName('head')[0];
      var style  = document.createElement('style');
      style.id   = cssId;
      style.innerText = styles;
      head.appendChild(style);
  }
  
  class EncounterTools__Session {
    token = null;
    tokenExpires = 0;

    constructor() {
      this.validToken = this.validToken.bind(this);
      this.getToken = this.getToken.bind(this);
      this.getData = this.getData.bind(this);
    }

    validToken() {
      return this.token != null && this.tokenExpires > Date.now();
    }

    getToken() {
      console.log('refreshing token');
      return fetch('https://auth-service.dndbeyond.com/v1/cobalt-token', {
        method: 'POST',
        credentials: 'include'
      }).then(resp => resp.json()).then(data => {
        console.log('token updated');
        this.token = data.token;
        this.tokenExpires = Date.now() + data.ttl * 1000 - 10000;
      }).catch(error => console.error(error));
    }

    getData(path = '', obj = {}) {
      console.log('loading data');
      if (!this.validToken()) {
        return this.getToken().then(() => this._fetchData(path, obj));
      } else {
        return this._fetchData(path, obj);
      }
    }

    _buildRequestHeader(obj) {
      return Object.assign(obj.headers || {}, {'Content-type': 'application/json;charset=utf-8', 'Authorization': 'Bearer ' + this.token})
    }

    _fetchData(path, obj) {
      obj.headers = this._buildRequestHeader(obj);
      if (obj.body) {obj.body = JSON.stringify(obj.body);}
      return fetch(path, obj).then(resp => resp.json()).then(data => data.data).catch(error => console.error(error));
    }
  }
  
  class EncounterTools__Monster {
    id = null;
    groupId = null;
    uniqueId = null;
    name = null;
    order = null;
    notes = null;
    index = null;
    currentHitPoints = 0;
    temporaryHitPoints = 0;
    maximumHitPoints = 0;
    initiative = 0;
    
    constructor(data) {
      this.id = data.id;
      this.groupId = data.groupId;
      this.uniqueId = data.uniqueId;
      this.name = data.name;
      this.order = data.order;
      this.quantity = data.quantity;
      this.notes = data.notes;
      this.index = data.index;
      this.currentHitPoints = data.currentHitPoints;
      this.temporaryHitPoints = data.temporaryHitPoints;
      this.maximumHitPoints = data.maximumHitPoints;
      this.initiative = data.initiative;
    }
    
    static LoadFromArray(encounter, monster) {
      return players.map(player => new EncounterTools__Monster(encounter, monster));
    }
  }
  
  class EncounterTools__Player {
    encounter = null;
    id = null;
    count = -1;
    level = -1;
    type = "";
    hidden = false;
    race = null;
    gender = null;
    name = null;
    userName = null;
    isReady = true;
    avatarUrl = null;
    classByLine = null;
    initiative = 0;
    currentHitPoints = 0;
    temporaryHitPoints = 0;
    maximumHitPoints = 0;
    
    constructor(encounter, data) {
      this.encounter = encounter;
      this.id = data.id;
      this.count = data.count;
      this.level = data.level;
      this.type = data.type;
      this.hidden = data.hidden;
      this.race = data.race;
      this.gender = data.gender;
      this.name = data.name;
      this.userName = data.userName;
      this.isReady = data.isReady;
      this.avatarUrl = data.avatarUrl;
      this.classByLine = data.classByLine;
      this.initiative = data.initiative;
      this.currentHitPoints = data.currentHitPoints;
      this.maximumHitPoints = data.maximumHitPoints;
    }
    
    static LoadFromArray(encounter, players) {
      return players.map(player => new EncounterTools__Player(encounter, player));
    }
  }
  
  class EncounterTools__Encounter {
    id = null;
    name = null;
    monsters = [];
    groups = [];
    players = [];
    
    constructor(session) {
      this.session = session;
      this.load = this.load.bind(this);
      this._load = this._load.bind(this);
    }
    
    load(id) {
      return this.session.getData('https://encounter-service.dndbeyond.com/v1/encounters/' + id).then((resp) => {
        this._load(resp.data);
      });;
    }
    
    _load(data) {
      this.id = data.id;
      this.name = data.name;
      this.monsters = EncounterTools__Monster.LoadFromArray(this, data.monsters);
      this.groupds = data.groups;
      this.players = EncounterTools__Player.LoadFromArray(this, data.players);
    }
  }
  
  const encounter = new EncounterTools__Encounter();
  
  const init = () => {
    const encounterId = location.pathname.split('/combat-tracker/')[1].split('/')[0];
    encounter.load(encounterId).then(() => console.log(encounter));
  };
  
  let initializer = null;
  let prevUrl = '';
  const obs = new MutationObserver(mut => {
    if (location.href !== prevUrl) {
      prevUrl = location.href;
      let delay = 1000;
      if (/\/builder/.test(window.location.pathname) && loaded === 0) {
        delay = 0;
      }
      clearTimeout(initializer);
      initializer = setTimeout(init, delay);
    }
  });
  obs.observe(document, {subtree: true, childList: true});
})();
