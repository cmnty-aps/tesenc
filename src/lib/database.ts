import { db } from './firebase.ts';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, increment } from 'firebase/firestore';

export interface GroupData {
    [key: string]: any;
}

export interface UserData {
    [key: string]: any;
}

export interface BotSettings {
    autoRead: boolean;
    autoTyping: boolean;
    [key: string]: any;
}

export interface CommandStat {
    name: string;
    count: number;
    lastUsed?: string;
}

export const VALID_COMMANDS = new Set([
  '3d', '3dfy', 'absen', 'addalink', 'addantilink', 'addblocklink', 'addowner', 'afk', 'akan', 'akankah', 'algc', 'alquran', 'anime', 'anonim', 'antara', 'antilinkgc', 'antilinkgrup', 'antilinklist', 'antilinkwa', 'apa', 'apakah', 'asahotak', 'attp', 'aturangrup', 'audioquran', 'autoadzan', 'autoread', 'autosholat', 'avengers', 'ba', 'bacaquran', 'bachar', 'bagaimana', 'ban', 'banlist', 'bear', 'bearnadbrat', 'berapa', 'berita', 'bisa', 'bisakah', 'black', 'blackpink', 'block', 'blonde', 'blue-archive', 'bluearchive', 'bluearchive-char', 'blur', 'blurface', 'bola', 'brat', 'brat2', 'bratanime', 'bratbahlil', 'bratbearnad', 'bratcewek', 'bratgif', 'bratgif2', 'bratgirl', 'bratgreen', 'bratmega', 'bratmegawati', 'bratprabowo', 'brats', 'bratvermeil', 'bratvid', 'bratvid2', 'bratvideo', 'bratvideo2', 'bratwowo', 'buatgrup', 'buatsaluran', 'buildml', 'bukaabsen', 'bye', 'caklontong', 'capcut', 'capcutdl', 'carikodepos', 'cartoon-graffiti', 'catbox', 'cc', 'ccdl', 'cecan-china', 'cecan-indo', 'cecan-indonesia', 'cecan-japan', 'cecan-jepang', 'cecan-kor', 'cecan-korea', 'cecan-thai', 'cecan-thailand', 'cecan-tiongkok', 'cecan-viet', 'cecan-vietnam', 'cekabsen', 'cekantilink', 'cekhodam', 'cekidch', 'cekidgc', 'cekip', 'cekkhodam', 'cekonline', 'cekpacar', 'cektime', 'cerdascermat', 'cewekbrat', 'channelid', 'chatstat', 'chatstats', 'checkonline', 'chibi', 'chibistyle', 'circlevideo', 'close', 'closeabsen', 'closetime', 'cnbc', 'cnn', 'coba', 'colong', 'comic', 'confess', 'confession', 'countwrmlbb', 'creategroup', 'createnewsletter', 'createsaluran', 'cuaca', 'daftarabsen', 'delalink', 'delantilink', 'delban', 'delblocklink', 'delclosetime', 'deleteabsen', 'deleteintro', 'delintro', 'delopentime', 'delowner', 'demote', 'deploy', 'dimana', 'dns', 'dnslookup', 'donasi', 'donate', 'dongart', 'dor', 'emix', 'emojigif', 'emojimix', 'enhancevid', 'facebook', 'facebookdl', 'fakebankjago', 'fakecall', 'fakecallwa', 'fakedana', 'fakedev', 'fakeff', 'fakektp', 'fakeml', 'fakestory', 'fb', 'fbdown', 'ffstalk', 'fstory', 'gabung', 'gangbang', 'gawr', 'gay', 'gb', 'gclink', 'gebetan', 'gempa', 'genshin', 'getlink', 'gi', 'gimana', 'gitclone', 'gitdl', 'githubdl', 'githubstalk', 'gitstalk', 'glitch', 'goodbye', 'graffiti', 'groupid', 'groupinfo', 'grouponly', 'grouprules', 'grules', 'gura', 'h', 'h2', 'hapusabsen', 'harus', 'haruskah', 'hd', 'hd2', 'hdvid', 'hdvideo', 'hentai', 'hidetag', 'hidetag2', 'hitam', 'hitamkan', 'how', 'howgay', 'howmany', 'howmuch', 'ht', 'ht2', 'idch', 'idgc', 'idgrup', 'ig', 'igstalk', 'igstory', 'infogc', 'infotourney', 'instagram', 'instagramstalk', 'intro', 'introdel', 'introset', 'ip', 'ipinfo', 'iplookup', 'iptrack', 'ipwho', 'iqc', 'jadwalbola', 'jadwaltv', 'jodoh', 'jodohin', 'join', 'joingroup', 'joingrup', 'kalkulatormlbb', 'kalkulatorwr', 'kasedaiki', 'keluar', 'khodam', 'kick', 'kodepos', 'latex', 'leaderboard', 'leave', 'leavegroup', 'leavegrup', 'lengkapikalimat', 'lihathadir', 'linkgc', 'linkgrup', 'lirik', 'listabsen', 'listantilink', 'listban', 'listbanned', 'listowner', 'lockgroup', 'lockgrup', 'loli', 'lookup', 'mana', 'mascot', 'math', 'mediafire', 'mediafiredl', 'megawatibrat', 'memes', 'memesticker', 'menfess', 'mf', 'mfdl', 'mixemoji', 'mlbbfake', 'mlcard', 'mlfake', 'mlstalk', 'mltourney', 'mulaiabsen', 'murottal', 'murrotal', 'naruto', 'newgroup', 'newlink', 'nglspam', 'nobg', 'npm', 'npmfind', 'npmjs', 'npmsearch', 'nulis', 'online', 'onlygc', 'onlygroup', 'onlypc', 'onlyprivate', 'onlythisgroup', 'onlythisgrup', 'open', 'openabsen', 'opentime', 'otp', 'pacar', 'pak-ustad', 'pakustad', 'pap', 'pasangan', 'paste', 'pastebin', 'pay', 'payment', 'pb', 'perkenalan', 'ping', 'pinpack', 'pins', 'pinsearch', 'pinsearchpack', 'pinstalk', 'pinsticker', 'pinterest', 'pintereststalk', 'pixel-glitch', 'play', 'playmp3', 'playmp4', 'playtiktok', 'playvid', 'pornhub', 'ppack', 'prabowobrat', 'private-mode', 'privateonly', 'promote', 'ptv', 'public', 'publicmode', 'pvideo', 'qc', 'qr', 'qrcode', 'qrcustom', 'qris', 'quotechat', 'quotedsticker', 'quran', 'quraudio', 'rch', 'readmore', 'readviewonce', 'recordweb', 'recweb', 'remantilink', 'removebg', 'repodownload', 'resetabsen', 'resetgoodbye', 'resetgrouprules', 'resetintro', 'resetlink', 'resetlinkgc', 'resetrulesgrup', 'resetwelcome', 'revokelink', 'rip', 'roblox', 'rulesgrup', 'rumus', 'rvo', 's', 'saweria', 'screenshot', 'searchsticker', 'selamatdatang', 'selengkapnya', 'self', 'selfmode', 'sensorwajah', 'setaturangrup', 'setgoodbye', 'setgrouprules', 'setintro', 'setperkenalan', 'setrulesgrup', 'setwelcome', 'sholat', 'should', 'siapakahaku', 'siapayangonline', 'sindonews', 'smeme', 'snackvideo', 'snackvideodl', 'sp', 'spamngl', 'spamotp', 'spdl', 'splay', 'spoiler', 'spotdl', 'spotify-dl', 'spotifydl', 'spotplay', 'ss', 'ssweb', 'stalkff', 'stalkgenshin', 'stalking', 'stalkml', 'stalkrbx', 'stalkroblox', 'stalkwa', 'startabsen', 'statusgrup', 'sticker', 'stickermark', 'stickerpack', 'stickersearch', 'stickertoimage', 'stickerwm', 'stifyplay', 'stimg', 'suport', 'surah', 'susu', 'susunkata', 'susutaro', 'sv', 'svdl', 'swgc', 'swgroup', 'swm', 'tako', 'tanyaustad', 'tb', 'tdl', 'tebakbendera', 'tebakgambar', 'tebakgame', 'tebakheroml', 'tebakkalimat', 'tebakkata', 'tebaklagu', 'tebaklogo', 'tekateki', 'tembak', 'tera', 'terabox', 'testwelcome', 'testwelcomecard', 'threaddl', 'threads', 'threadsdl', 'tiktok', 'tiktokdl', 'tiktokmusic', 'tiktokplay', 'tiktokstalk', 'to3d', 'to3dmodel', 'toblack', 'toblonde', 'tochibi', 'tohitam', 'toimage', 'toimg', 'toanime', 'wanted', 'notifwa', 'notifwav2', 'topchat', 'totalchat', 'tourl', 'tourney', 'tr', 'trackip', 'translate', 'try', 'tt', 'ttdown', 'ttmp3', 'ttmp4', 'ttmusic', 'ttplay', 'ttstalk', 'turnamen', 'tutupabsen', 'tv', 'tvjadwal', 'uch', 'unban', 'unblock', 'upch', 'upload', 'uploadch', 'uploadsaluran', 'url', 'vercel', 'videy', 'videydl', 'w2z', 'wafat', 'wastalk', 'wc', 'web2apk', 'web2zip', 'webrecord', 'webss', 'webtoapk', 'webtozip', 'welcome', 'whatsappstalk', 'where', 'whois', 'whosonline', 'will', 'wm', 'wowobrat', 'wrmlbb', 'youtubemp3', 'youtubemp4', 'ytaudio', 'ytmp3', 'ytmp4', 'ytplay', 'ytplayvid', 'ytvideo'
]);

export const getDatabase = () => {
    return {
        getGroup: async (jid: string): Promise<GroupData> => {
            const docRef = doc(db, 'groups', jid);
            const docSnap = await getDoc(docRef);
            return (docSnap.exists() ? docSnap.data() : {}) as GroupData;
        },
        getAllGroups: async (): Promise<GroupData[]> => {
            const groupsCol = collection(db, 'groups');
            const groupSnapshot = await getDocs(groupsCol);
            return groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GroupData[];
        },
        setGroup: async (jid: string, data: Partial<GroupData>) => {
            const docRef = doc(db, 'groups', jid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, data);
            } else {
                await setDoc(docRef, data);
            }
        },
        getUser: async (jid: string): Promise<UserData> => {
            const docRef = doc(db, 'users', jid);
            const docSnap = await getDoc(docRef);
            return (docSnap.exists() ? docSnap.data() : {}) as UserData;
        },
        setUser: async (jid: string, data: Partial<UserData>) => {
            const docRef = doc(db, 'users', jid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, data);
            } else {
                await setDoc(docRef, data);
            }
        },
        getSettings: async (): Promise<BotSettings> => {
            const docRef = doc(db, 'settings', 'bot');
            const docSnap = await getDoc(docRef);
            return (docSnap.exists() ? docSnap.data() : { autoRead: false, autoTyping: false }) as BotSettings;
        },
        setSettings: async (data: Partial<BotSettings>) => {
            const docRef = doc(db, 'settings', 'bot');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, data);
            } else {
                await setDoc(docRef, data);
            }
        },
        recordCommandUsage: async (commandName: string) => {
            if (!commandName) return;
            const cleanCmd = commandName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            if (!cleanCmd || cleanCmd === 'menu' || cleanCmd === 'help' || !VALID_COMMANDS.has(cleanCmd)) return;
            try {
                const docRef = doc(db, 'commands', cleanCmd);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    await updateDoc(docRef, {
                        count: increment(1),
                        lastUsed: new Date().toISOString()
                    });
                } else {
                    await setDoc(docRef, {
                        name: cleanCmd,
                        count: 1,
                        lastUsed: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error('[DATABASE] Error recording command usage:', err);
            }
        },
        getCommandStats: async (): Promise<CommandStat[]> => {
            try {
                const colRef = collection(db, 'commands');
                const snapshot = await getDocs(colRef);
                const stats: CommandStat[] = [];
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const name = data.name || docSnap.id;
                    if (name === 'menu' || name === 'help' || !VALID_COMMANDS.has(name)) return;
                    stats.push({
                        name: name,
                        count: data.count || 0,
                        lastUsed: data.lastUsed
                    });
                });
                stats.sort((a, b) => b.count - a.count);
                return stats.slice(0, 10);
            } catch (err) {
                console.error('[DATABASE] Error getting command stats:', err);
                return [];
            }
        },
        data: null // Firestore doesn't hold all data in memory
    };
};
