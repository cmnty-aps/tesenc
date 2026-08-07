import FormData from "form-data";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import mime from "mime-types";

const termaiKey = 'AIzaBj7z2z3xBjsk';
const termaiDomain = 'https://c.termai.cc';

async function detectExt(buffer: Buffer, fallback = 'bin') {
    try {
        const type = await fileTypeFromBuffer(buffer);
        return type?.ext || fallback;
    } catch {
        return fallback;
    }
}

export async function uploadToCatbox(buffer: Buffer, filename: string) {
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, {
            filename,
            contentType: mime.lookup(filename) || 'application/octet-stream'
        });

        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        if (res.status === 200 && typeof res.data === 'string' && res.data.startsWith('http')) {
            return { host: 'Catbox', url: res.data, expires: 'Permanent' };
        }
    } catch (err) {
        // Fallback to Litterbox on 412 or network failure
    }
    const fallback = await uploadToLitterbox(buffer, filename);
    return { host: 'Catbox (Litterbox)', url: fallback.url, expires: fallback.expires };
}

export async function uploadToLitterbox(buffer: Buffer, filename: string) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('time', '72h');
    form.append('fileToUpload', buffer, {
        filename,
        contentType: mime.lookup(filename) || 'application/octet-stream'
    });

    const res = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', form, {
        headers: {
            ...form.getHeaders(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 30000
    });

    if (res.status !== 200) throw new Error('Litterbox gagal');
    const url = res.data;
    if (typeof url !== 'string' || !url.startsWith('http')) throw new Error('Invalid response');
    return { host: 'Litterbox', url, expires: '72 jam' };
}

export async function uploadToTmpFiles(buffer: Buffer, filename: string) {
    const form = new FormData();
    form.append('file', buffer, {
        filename,
        contentType: mime.lookup(filename) || 'application/octet-stream'
    });

    const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: form.getHeaders(),
        timeout: 30000
    });

    if (res.status !== 200) throw new Error('TmpFiles gagal');
    const data = res.data;
    if (!data?.data?.url) throw new Error('Invalid response');

    let url = data.data.url;
    const idMatch = url.match(/\/(\d+)(?:\/|$)/);
    if (idMatch) {
        url = `https://tmpfiles.org/dl/${idMatch[1]}/${filename}`;
    } else {
        url = url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    }

    return { host: 'TmpFiles', url, expires: '60 menit' };
}

export async function uploadToGofile(buffer: Buffer, filename: string) {
    try {
        const serverRes = await axios.get('https://api.gofile.io/servers', { timeout: 10000 });
        const serverData = serverRes.data;
        if (serverData?.data?.servers?.[0]?.name) {
            const server = serverData.data.servers[0].name;
            const form = new FormData();
            form.append('file', buffer, {
                filename,
                contentType: mime.lookup(filename) || 'application/octet-stream'
            });

            const res = await axios.post(`https://${server}.gofile.io/uploadFile`, form, {
                headers: form.getHeaders(),
                timeout: 30000
            });

            if (res.status === 200 && res.data?.data?.downloadPage) {
                return { host: 'Gofile', url: res.data.data.downloadPage, expires: 'Permanent' };
            }
        }
    } catch (err) {
        // Fallback
    }
    const fallback = await uploadToPutIcu(buffer, filename);
    return { host: 'Gofile (Put.icu)', url: fallback.url, expires: fallback.expires };
}

export async function uploadToQuax(buffer: Buffer, filename: string) {
    const form = new FormData();
    form.append('files[]', buffer, {
        filename,
        contentType: mime.lookup(filename) || 'application/octet-stream'
    });

    const res = await axios.post('https://qu.ax/upload.php', form, {
        headers: form.getHeaders(),
        timeout: 60000
    });

    if (res.status !== 200) throw new Error('Qu.ax gagal');
    const data = res.data;

    if (!data?.success || !Array.isArray(data.files) || !data.files[0]?.url) {
        throw new Error('Invalid response');
    }

    return { host: 'Qu.ax', url: data.files[0].url, expires: 'Permanent' };
}

export async function uploadToYpnk(buffer: Buffer, filename: string) {
    try {
        const form = new FormData();
        form.append('files', buffer, {
            filename,
            contentType: mime.lookup(filename) || 'application/octet-stream'
        });

        const res = await axios.post('https://cdn.ypnk.biz.id/upload', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        if (res.status === 200 && res.data?.success && res.data?.files?.[0]?.url) {
            return {
                host: 'YPNK',
                url: `https://cdn.ypnk.biz.id${res.data.files[0].url}`,
                expires: 'Unknown'
            };
        }
    } catch (err) {
        // Fallback if DNS or server fails
    }
    const fallback = await uploadToTmpFiles(buffer, filename);
    return { host: 'YPNK (TmpFiles)', url: fallback.url, expires: fallback.expires };
}

export async function uploadToPutIcu(buffer: Buffer, filename: string) {
    const res = await axios.put('https://put.icu/upload/', buffer, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': mime.lookup(filename) || 'application/octet-stream'
        },
        timeout: 120000
    });

    if (res.status !== 200) throw new Error('Put.icu gagal');
    const data = res.data;

    if (data?.direct_url) {
        return { host: 'Put.icu', url: data.direct_url, expires: '1 hari' };
    }

    if (data?.url) {
        return { host: 'Put.icu', url: data.url, expires: '1 hari' };
    }

    throw new Error('Invalid response');
}

export async function uploadToTermai(buffer: Buffer) {
    try {
        const ext = await detectExt(buffer, 'bin');
        const form = new FormData();
        form.append('file', buffer, { filename: `file.${ext}` });

        const res = await axios.post(`${termaiDomain}/api/upload?key=${termaiKey}`, form, {
            headers: form.getHeaders(),
            timeout: 10000
        });

        if (res.status === 200 && res.data?.status && res.data?.path) {
            return { host: 'Termai', url: res.data.path, expires: 'Unknown' };
        }
    } catch (err) {
        // Fallback if HTTP 500 or timeout
    }
    const fallback = await uploadToQuax(buffer, 'file.bin');
    return { host: 'Termai (Qu.ax)', url: fallback.url, expires: fallback.expires };
}

export const UPLOADERS = [
    { name: 'Catbox', fn: uploadToCatbox },
    { name: 'Litterbox', fn: uploadToLitterbox },
    { name: 'TmpFiles', fn: uploadToTmpFiles },
    { name: 'Gofile', fn: uploadToGofile },
    { name: 'Qu.ax', fn: uploadToQuax },
    { name: 'YPNK', fn: uploadToYpnk },
    { name: 'Put.icu', fn: uploadToPutIcu },
    { name: 'Termai', fn: uploadToTermai }
];
