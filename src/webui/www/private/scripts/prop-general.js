/*
 * Bittorrent Client using Qt and libtorrent.
 * Copyright (C) 2009  Christophe Dumez <chris@qbittorrent.org>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * In addition, as a special exception, the copyright holders give permission to
 * link this program with the OpenSSL project's "OpenSSL" library (or with
 * modified versions of it that use the same license as the "OpenSSL" library),
 * and distribute the linked executables. You must obey the GNU General Public
 * License in all respects for all of the code used other than "OpenSSL".  If you
 * modify file(s), you may extend this exception to your version of the file(s),
 * but you are not obligated to do so. If you do not wish to do so, delete this
 * exception statement from your version.
 */

"use strict";

window.qBittorrent ??= {};
window.qBittorrent.PropGeneral ??= (() => {
    const exports = () => {
        return {
            updateData: updateData,
            clear: clear
        };
    };

    const piecesBar = new window.qBittorrent.PiecesBar.PiecesBar([], {
        height: 18
    });
    document.getElementById("progress").appendChild(piecesBar);

    const clearData = () => {
        document.getElementById("progressPercentage").textContent = "";
        document.getElementById("time_elapsed").textContent = "";
        document.getElementById("eta").textContent = "";
        document.getElementById("nb_connections").textContent = "";
        document.getElementById("total_downloaded").textContent = "";
        document.getElementById("total_uploaded").textContent = "";
        document.getElementById("dl_speed").textContent = "";
        document.getElementById("up_speed").textContent = "";
        document.getElementById("dl_limit").textContent = "";
        document.getElementById("up_limit").textContent = "";
        document.getElementById("total_wasted").textContent = "";
        document.getElementById("seeds").textContent = "";
        document.getElementById("peers").textContent = "";
        document.getElementById("share_ratio").textContent = "";
        document.getElementById("popularity").textContent = "";
        document.getElementById("importance").textContent = "";
        document.getElementById("reannounce").textContent = "";
        document.getElementById("last_seen").textContent = "";
        document.getElementById("total_size").textContent = "";
        document.getElementById("pieces").textContent = "";
        document.getElementById("created_by").textContent = "";
        document.getElementById("addition_date").textContent = "";
        document.getElementById("completion_date").textContent = "";
        document.getElementById("creation_date").textContent = "";
        document.getElementById("torrent_hash_v1").textContent = "";
        document.getElementById("torrent_hash_v2").textContent = "";
        document.getElementById("save_path").textContent = "";
        document.getElementById("comment").textContent = "";
        document.getElementById("private").textContent = "";
        piecesBar.clear();
    };

    let loadTorrentDataTimer = -1;
    const loadTorrentData = () => {
        if (document.hidden)
            return;
        if (document.getElementById("propGeneral").classList.contains("invisible")
            || document.getElementById("propertiesPanel_collapseToggle").classList.contains("panel-expand")) {
            // Tab changed, don't do anything
            return;
        }
        const current_id = torrentsTable.getCurrentTorrentID();
        if (current_id === "") {
            clearData();
            clearTimeout(loadTorrentDataTimer);
            return;
        }

        const propertiesURL = new URL("api/v2/torrents/properties", window.location);
        propertiesURL.search = new URLSearchParams({
            hash: current_id
        });
        fetch(propertiesURL, {
                method: "GET",
                cache: "no-store"
            })
            .then(async (response) => {
                if (!response.ok) {
                    document.getElementById("error_div").textContent = "QBT_TR(qBittorrent client is not reachable)QBT_TR[CONTEXT=HttpServer]";
                    clearTimeout(loadTorrentDataTimer);
                    loadTorrentDataTimer = loadTorrentData.delay(10000);
                    return;
                }

                document.getElementById("error_div").textContent = "";

                const data = await response.json();
                if (data) {
                    // Update Torrent data

                    document.getElementById("progressPercentage").textContent = window.qBittorrent.Misc.friendlyPercentage(data.progress);

                    const timeElapsed = (data.seeding_time > 0)
                        ? "QBT_TR(%1 (seeded for %2))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyDuration(data.time_elapsed))
                        .replace("%2", window.qBittorrent.Misc.friendlyDuration(data.seeding_time))
                        : window.qBittorrent.Misc.friendlyDuration(data.time_elapsed);
                    document.getElementById("time_elapsed").textContent = timeElapsed;

                    document.getElementById("eta").textContent = window.qBittorrent.Misc.friendlyDuration(data.eta, window.qBittorrent.Misc.MAX_ETA);

                    const nbConnections = "QBT_TR(%1 (%2 max))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", data.nb_connections)
                        .replace("%2", ((data.nb_connections_limit < 0) ? "∞" : data.nb_connections_limit));
                    document.getElementById("nb_connections").textContent = nbConnections;

                    const totalDownloaded = "QBT_TR(%1 (%2 this session))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyUnit(data.total_downloaded))
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.total_downloaded_session));
                    document.getElementById("total_downloaded").textContent = totalDownloaded;

                    const totalUploaded = "QBT_TR(%1 (%2 this session))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyUnit(data.total_uploaded))
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.total_uploaded_session));
                    document.getElementById("total_uploaded").textContent = totalUploaded;

                    const dlSpeed = "QBT_TR(%1 (%2 avg.))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyUnit(data.dl_speed, true))
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.dl_speed_avg, true));
                    document.getElementById("dl_speed").textContent = dlSpeed;

                    const upSpeed = "QBT_TR(%1 (%2 avg.))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", window.qBittorrent.Misc.friendlyUnit(data.up_speed, true))
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.up_speed_avg, true));
                    document.getElementById("up_speed").textContent = upSpeed;

                    const dlLimit = (data.dl_limit === -1)
                        ? "∞"
                        : window.qBittorrent.Misc.friendlyUnit(data.dl_limit, true);
                    document.getElementById("dl_limit").textContent = dlLimit;

                    const upLimit = (data.up_limit === -1)
                        ? "∞"
                        : window.qBittorrent.Misc.friendlyUnit(data.up_limit, true);
                    document.getElementById("up_limit").textContent = upLimit;

                    document.getElementById("total_wasted").textContent = window.qBittorrent.Misc.friendlyUnit(data.total_wasted);

                    const seeds = "QBT_TR(%1 (%2 total))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", data.seeds)
                        .replace("%2", data.seeds_total);
                    document.getElementById("seeds").textContent = seeds;

                    const peers = "QBT_TR(%1 (%2 total))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", data.peers)
                        .replace("%2", data.peers_total);
                    document.getElementById("peers").textContent = peers;

                    document.getElementById("share_ratio").textContent = data.share_ratio.toFixed(2);

                    document.getElementById("popularity").textContent = data.popularity.toFixed(2);

                    document.getElementById("importance").textContent = data.importance.toFixed(2);

                    document.getElementById("reannounce").textContent = window.qBittorrent.Misc.friendlyDuration(data.reannounce);

                    const lastSeen = (data.last_seen >= 0)
                        ? new Date(data.last_seen * 1000).toLocaleString()
                        : "QBT_TR(Never)QBT_TR[CONTEXT=PropertiesWidget]";
                    document.getElementById("last_seen").textContent = lastSeen;

                    const totalSize = (data.total_size >= 0) ? window.qBittorrent.Misc.friendlyUnit(data.total_size) : "";
                    document.getElementById("total_size").textContent = totalSize;

                    const pieces = (data.pieces_num >= 0)
                        ? "QBT_TR(%1 x %2 (have %3))QBT_TR[CONTEXT=PropertiesWidget]"
                        .replace("%1", data.pieces_num)
                        .replace("%2", window.qBittorrent.Misc.friendlyUnit(data.piece_size))
                        .replace("%3", data.pieces_have)
                        : "";
                    document.getElementById("pieces").textContent = pieces;

                    document.getElementById("created_by").textContent = data.created_by;

                    const additionDate = (data.addition_date >= 0)
                        ? new Date(data.addition_date * 1000).toLocaleString()
                        : "QBT_TR(Unknown)QBT_TR[CONTEXT=HttpServer]";
                    document.getElementById("addition_date").textContent = additionDate;

                    const completionDate = (data.completion_date >= 0)
                        ? new Date(data.completion_date * 1000).toLocaleString()
                        : "";
                    document.getElementById("completion_date").textContent = completionDate;

                    const creationDate = (data.creation_date >= 0)
                        ? new Date(data.creation_date * 1000).toLocaleString()
                        : "";
                    document.getElementById("creation_date").textContent = creationDate;

                    const torrentHashV1 = (data.infohash_v1 !== "")
                        ? data.infohash_v1
                        : "QBT_TR(N/A)QBT_TR[CONTEXT=PropertiesWidget]";
                    document.getElementById("torrent_hash_v1").textContent = torrentHashV1;

                    const torrentHashV2 = (data.infohash_v2 !== "")
                        ? data.infohash_v2
                        : "QBT_TR(N/A)QBT_TR[CONTEXT=PropertiesWidget]";
                    document.getElementById("torrent_hash_v2").textContent = torrentHashV2;

                    document.getElementById("save_path").textContent = data.save_path;

                    document.getElementById("comment").innerHTML = window.qBittorrent.Misc.parseHtmlLinks(window.qBittorrent.Misc.escapeHtml(data.comment));

                    document.getElementById("private").textContent = (data.has_metadata
                        ? (data.private
                            ? "QBT_TR(Yes)QBT_TR[CONTEXT=PropertiesWidget]"
                            : "QBT_TR(No)QBT_TR[CONTEXT=PropertiesWidget]")
                        : "QBT_TR(N/A)QBT_TR[CONTEXT=PropertiesWidget]");
                }
                else {
                    clearData();
                }
                clearTimeout(loadTorrentDataTimer);
                loadTorrentDataTimer = loadTorrentData.delay(5000);
            });

        const pieceStatesURL = new URL("api/v2/torrents/pieceStates", window.location);
        pieceStatesURL.search = new URLSearchParams({
            hash: current_id
        });
        fetch(pieceStatesURL, {
                method: "GET",
                cache: "no-store"
            })
            .then(async (response) => {
                if (!response.ok) {
                    document.getElementById("error_div").textContent = "QBT_TR(qBittorrent client is not reachable)QBT_TR[CONTEXT=HttpServer]";
                    clearTimeout(loadTorrentDataTimer);
                    loadTorrentDataTimer = loadTorrentData.delay(10000);
                    return;
                }

                document.getElementById("error_div").textContent = "";

                const data = await response.json();
                if (data)
                    piecesBar.setPieces(data);
                else
                    clearData();

                clearTimeout(loadTorrentDataTimer);
                loadTorrentDataTimer = loadTorrentData.delay(5000);
            });
    };

    const updateData = () => {
        clearTimeout(loadTorrentDataTimer);
        loadTorrentDataTimer = -1;
        loadTorrentData();
    };

    const clear = () => {
        clearData();
    };

    return exports();
})();
Object.freeze(window.qBittorrent.PropGeneral);
