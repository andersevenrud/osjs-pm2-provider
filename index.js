/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2019, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

const {ServiceProvider} = require('@osjs/common');
const pmx = require('pmx');

class PM2ServiceProvider extends ServiceProvider {

  constructor(core, options = {}) {
    this.core = core;
    this.options = options;
  }

  destroy() {
  }

  provides() {
    return [];
  }

  start() {
  }

  async init() {
    pmx.init({
      http: true,
      errors: true,
      custom_probes: true,
      network: true,
      ports: true
    });

    const reqCount = pmx.probe()
      .counter({name: 'Request count', agg_type: 'sum'});

    const wsCount = pmx.probe()
      .counter({name: 'Websocket connections', agg_type: 'sum'});

    const wss = this.core.ws.getWss();
    wss.on('connection', client => {
      client.on('close', () => wsCount.dec());
      wsCount.inc();
    });

    this.core.app.use((req, res, next) => {
      reqCount.inc();

      next();
    });

    this.core.app.get('/health', (req, res) => {
      res.status(200).json({success: true});
    });
  }

}

module.exports = PM2ServiceProvider;
