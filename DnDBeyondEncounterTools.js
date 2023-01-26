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
  
  const encounterId = location.pathname.split('/combat-tracker/')[1].split('/')[0];
  
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
      return fetch('https://encounter-service.dndbeyond.com/v1/encounters/' + path, obj).then(resp => resp.json()).then(data => data.data).catch(error => console.error(error));
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
    
    
    constructor(data) {
      this.id = data.id;
      this.groupId = data.groupId;
      this.uniqueId = data.uniqueId;
      this.name = data.name;
      this.order = data.order;
      this.quantity = data.quantity;
      this.notes = data.notes;
      this.index = data.index;
      this.currentHit
    }
  }
  
  class EncounterTools__Player {
    constructor() {
    }
  }
  
  class EncounterTools__Encounter {
    
    id = null;
    monsters = [];
    groups = [];
    players = [];
    
    constructor(id) {
      this.id = id;
    }
  }
})();
