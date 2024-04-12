const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cheerio = require("cheerio");
const crypto = require('crypto');
const fetch = require('fetch');
const qs = require('qs');
const Jimp = require('jimp');
const FormData = require('form-data');
const { HttpsProxyAgent } = require('https-proxy-agent');
const httpsAgent = new HttpsProxyAgent('http://168.63.76.32:3128');
const baseUrl = 'https://tools.betabotz.org';
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware untuk CORS
app.use(cors());

function igdl(url) {
    return new Promise(async (resolve, reject) => {
        axios.request({
            url: 'https://www.instagramsave.com/download-instagram-videos.php',
            method: 'GET',
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "cookie": "PHPSESSID=ugpgvu6fgc4592jh7ht9d18v49; _ga=GA1.2.1126798330.1625045680; _gid=GA1.2.1475525047.1625045680; __gads=ID=92b58ed9ed58d147-221917af11ca0021:T=1625045679:RT=1625045679:S=ALNI_MYnQToDW3kOUClBGEzULNjeyAqOtg"
            }
        })
            .then(({ data }) => {
                const $ = cheerio.load(data)
                const token = $('#token').attr('value')
                let config = {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                        "cookie": "PHPSESSID=ugpgvu6fgc4592jh7ht9d18v49; _ga=GA1.2.1126798330.1625045680; _gid=GA1.2.1475525047.1625045680; __gads=ID=92b58ed9ed58d147-221917af11ca0021:T=1625045679:RT=1625045679:S=ALNI_MYnQToDW3kOUClBGEzULNjeyAqOtg",
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    },
                    data: {
                        'url': url,
                        'action': 'post',
                        'token': token
                    }
                }
                axios.post('https://www.instagramsave.com/system/action.php', qs.stringify(config.data), { headers: config.headers })
                    .then(({ data }) => {
                        resolve(data.medias)
                    })
            })
            .catch(reject)
    })
}

async function igstalk(username) {
  try {
    const { data } = await axios.get(`https://dumpor.com/v/${username}`, {
      headers: {
        "user-agent": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "cookie": "_inst_key=SFMyNTY.g3QAAAABbQAAAAtfY3NyZl90b2tlbm0AAAAYT3dzSXI2YWR6SG1fNFdmTllfZnFIZ1Ra.5Og9VRy7gUy9IsCwUeYW8O8qvHbndaus-cqBRaZ7jcg; __gads=ID=f8ead4404e6a0e16-2206b4189ace0028:T=1636352226:RT=1636352226:S=ALNI_MbsEYYwp3U-9PJHoUHPA0mj4zn3uQ; _ym_uid=1636352226596108095; _ym_d=1636352226; _ym_isad=2; __atssc=google%3B1; FCNEC=[[\"AKsRol8BmQbGXTRP_1wzoi3Qg8PSMr7FFU0k- LGYROfG4nmvg - yFq6fARCalcofDHQIoyhwlo75582yk2a5WLTZakmPZu - SIkkXQNAePmtpVXwaPISfK8HC1pJ8tUjrRWRiFfjPaZh3rC - _6nkHQN25c - 1YR- NJtDQ == \"],null,[]]; FCCDCF=[null,null,[\"[[], [], [], [], null, null, true]\",1636352300969],null,null,null,[]]; __atuvc=3%7C45; __atuvs=6188c0df986e798b002"
      }
    })
    const $ = cheerio.load(data)
    const results = {
      username: ($('#user-page > div.user > div.row > div > div.user__title > h4').text() || '').replace(/@/gi, '').trim(),
      fullName: $('#user-page > div.user > div.row > div > div.user__title > a > h1').text(),
      profilePicHD: ($('#user-page > div.user > div.row > div > div.user__img').attr('style') || '').replace(/(background-image: url\(\'|\'\);)/gi, '').trim(),
      bio: $('#user-page > div.user > div.row > div > div.user__info-desc').text(),
      followers: ($('#user-page > div.user > div.row > div > ul > li').eq(1).text() || '').replace(/Followers/gi, '').trim(),
      followersM: ($('#user-page > div.container > div > div > div:nth-child(1) > div > a').eq(2).text() || '').replace(/Followers/gi, '').trim(),
      following: ($('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li').eq(2).text() || '').replace(/Following/gi, '').trim(),
      followingM: ($('#user-page > div.container > div > div > div:nth-child(1) > div > a').eq(3).text() || '').replace(/Following/gi, '').trim(),
      postsCount: ($('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li').eq(0).text() || '').replace(/Posts/gi, '').trim(),
      postsCountM: ($('#user-page > div.container > div > div > div:nth-child(1) > div > a').eq(0).text() || '').replace(/Posts/gi, '').trim()
    }
    return results
  } catch (e) {
    console.error(e)
    throw 'Not found ;-;'
  }
}

function quotesAnime() {
return new Promise((resolve, reject) => {
const page = Math.floor(Math.random() * 184)
axios.get('https://otakotaku.com/quote/feed/'+page)
.then(({ data }) => {
const $ = cheerio.load(data)
const hasil = []
$('div.kotodama-list').each(function(l, h) {
hasil.push({
link: $(h).find('a').attr('href'),
gambar: $(h).find('img').attr('data-src'),
karakter: $(h).find('div.char-name').text().trim(),
anime: $(h).find('div.anime-title').text().trim(),
episode: $(h).find('div.meta').text(),
up_at: $(h).find('small.meta').text(),
quotes: $(h).find('div.quote').text().trim()
})
})
resolve(hasil)
}).catch(reject)
})
}

async function ghstalk(username) {
        return new Promise(async (resolve, reject) => {
            await axios
                .get("https://api.github.com/users/" + username)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((e) => {
                    console.log(e);
                    reject({
                        status: 300,
                        message: "request failed",
                    });
                });
        });
    };
//Ghstalkbyrull

async function npmstalk(packageName) {
  let stalk = await axios.get("https://registry.npmjs.org/"+packageName)
  let versions = stalk.data.versions
  let allver = Object.keys(versions)
  let verLatest = allver[allver.length-1]
  let verPublish = allver[0]
  let packageLatest = versions[verLatest]
  return {
    name: packageName,
    versionLatest: verLatest,
    versionPublish: verPublish,
    versionUpdate: allver.length,
    latestDependencies: Object.keys(packageLatest.dependencies).length,
    publishDependencies: Object.keys(versions[verPublish].dependencies).length,
    publishTime: stalk.data.time.created,
    latestPublishTime: stalk.data.time[verLatest]
  }
}

function lirik(judul){
	return new Promise(async(resolve, reject) => {
   		axios.get('https://www.musixmatch.com/search/' + judul)
   		.then(async({ data }) => {
   		const $ = cheerio.load(data)
   		const hasil = {};
   		let limk = 'https://www.musixmatch.com'
   		const link = limk + $('div.media-card-body > div > h2').find('a').attr('href')
	   		await axios.get(link)
	   		.then(({ data }) => {
		   		const $$ = cheerio.load(data)
		   		hasil.thumb = 'https:' + $$('div.col-sm-1.col-md-2.col-ml-3.col-lg-3.static-position > div > div > div').find('img').attr('src')
		  		$$('div.col-sm-10.col-md-8.col-ml-6.col-lg-6 > div.mxm-lyrics').each(function(a,b) {
		   hasil.lirik = $$(b).find('span > p > span').text() +'\n' + $$(b).find('span > div > p > span').text()
		   })
	   })
	   resolve(hasil)
   })
   .catch(reject)
   })
}

function nekopoi(url) {
    return new Promise((resolve, reject) => {
    const hasil = {}
    axios.get(url)
    .then((res) => {
        const $ = cheerio.load(res.data)
hasil.thumb = $('#content > div.animeinfos > div.imgdesc > img').attr('src')
hasil.synopsis = $('#content > div.animeinfos > div.imgdesc > span > p').text()
hasil.visitor_count = $('#content > div.animeinfos > div.tabulasi > div:nth-child(3)').text()
hasil.judul_jp = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(1)').text()
hasil.type = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(2)').text()
hasil.jmlh_epsd = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(3)').text()
hasil.status = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(4)').text()
hasil.publish = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(5)').text()
hasil.judul = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(6)').text()
hasil.genre = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(7)').text()
hasil.duration = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(8)').text()
hasil.rating = $('#content > div.animeinfos > div.listinfo > ul > li:nth-child(9)').text()
hasil.episode_url = [];                 
})
      axios.get(url)
        .then(({
           data
        }) => {
            const $ = cheerio.load(data)
            $('#content > div.animeinfos > div.episodelist > ul > li').each(function(a, b) {
            result = {
            title: $(b).find('> span.leftoff > a').text(),
            epsd_url: $(b).find('> span.leftoff > a').attr('href')
            }            
            hasil.episode_url.push(result)
            })
resolve(hasil)
})
})
}

function quotes(input) {
    return new Promise((resolve, reject) => {
        fetch('https://jagokata.com/kata-bijak/kata-' + input.replace(/\s/g, '_') + '.html?page=1')
            .then(res => res.text())
            .then(res => {
                const $ = cheerio.load(res)
                data = []
                $('div[id="main"]').find('ul[id="citatenrijen"] > li').each(function (index, element) {
                    x = $(this).find('div[class="citatenlijst-auteur"] > a').text().trim()
                    y = $(this).find('span[class="auteur-beschrijving"]').text().trim()
                    z = $(element).find('q[class="fbquote"]').text().trim()
                    data.push({ author: x, bio: y, quote: z })
                })
                data.splice(2, 1)
                if (data.length == 0) return resolve({ creator: 'stikerin', status: false })
                resolve({ creator: 'stikerin', status: true, data })
            }).catch(reject)
    })
}

async function facebook(url) {
    return new Promise((resolve, reject) => {
        axios({
            url: 'https://aiovideodl.ml/',
            method: 'GET',
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "cookie": "PHPSESSID=69ce1f8034b1567b99297eee2396c308; _ga=GA1.2.1360894709.1632723147; _gid=GA1.2.1782417082.1635161653"
            }
        }).then((src) => {
            let a = cheerio.load(src.data)
            let token = a('#token').attr('value')
            axios({
                url: 'https://aiovideodl.ml/wp-json/aio-dl/video-data/',
                method: 'POST',
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "cookie": "PHPSESSID=69ce1f8034b1567b99297eee2396c308; _ga=GA1.2.1360894709.1632723147; _gid=GA1.2.1782417082.1635161653"   
                },
                data: new URLSearchParams(Object.entries({ 'url': link, 'token': token }))
            }).then(({ data }) => {
                resolve(data)
            })
        })
    })
}

async function draw(input) {
  const image = await Jimp.read(input);
  const buffer = await new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
      if (err) {
        reject('Terjadi Error Saat Mengambil Data......');
      } else {
        resolve(buf);
      }
    });
  });
  const form = new FormData();
  form.append('image', buffer, { filename: 'toanime.jpg' });
  try {
    const { data } = await axios.post(`${baseUrl}/ai/toanime`, form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'application/json',
      },
    });
    var res = {
      image_data: data.result,
      image_size: data.size
    };
    return res;
  } catch (error) {
    console.error('Identifikasi Gagal:', error);
    return 'Identifikasi Gagal';
  }
}


function ssweb(url, device = 'desktop') {
     return new Promise((resolve, reject) => {
          const base = 'https://www.screenshotmachine.com'
          const param = {
            url: url,
            device: device,
            full: true,
            cacheLimit: 0
          }
          axios({url: base + '/capture.php',
               method: 'POST',
               data: new URLSearchParams(Object.entries(param)),
               headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
               }
          }).then((data) => {
               const cookies = data.headers['set-cookie']
               if (data.data.status == 'success') {
                    axios.get(base + '/' + data.data.link, {
                         headers: {
                              'cookie': cookies.join('')
                         },
                         responseType: 'arraybuffer'
                    }).then(({ data }) => {
                        result = {
                            status: 200,
                            author: "KyuuRzy",
                            result: data
                        }
                         resolve(result)
                    })
               } else {
                    reject({ status: 404, author: "KyuuRzy", message: data.data })
               }
          }).catch(reject)
     })
}


function pinterestvideodownloader(t) {
  return new Promise(async (e, a) => {
    let i = new URLSearchParams();
    i.append("url", t);
    let o = await (
      await fetch("https://pinterestvideodownloader.com/", {
        method: "POST",
        body: i,
      })
    ).text();
    $ = cheerio.load(o);
    let r = [];
    if (
      ($("table > tbody > tr").each(function (t, e) {
        "" != $($(e).find("td")[0]).text() &&
          r.push({ url: $($(e).find("td")[0]).find("a").attr("href") });
      }),
      0 == r.length)
    )
      return e({ status: !1 });
    e({ status: !0, data: r });
  });
}

function tiktokdl(URL) {
    return new Promise(async(resolve, rejecet) => {
        let { data } = await axios.request({
            url: "https://lovetik.com/api/ajax/search",
            method: "POST",
            data: new URLSearchParams(Object.entries({ query: URL }))
        })
        let result = {
            desc: data.desc,
            author: data.author,
            author_name: data.author_name,
            cover: data.cover,
            video: data.play_url,
            audio: data.links[4].a || "".replace("https", "http")
        }
        resolve(result)
    })
}


// Fungsi untuk ragBot
async function ragBot(message) {
  try {
    const response = await axios.post('https://ragbot-starter.vercel.app/api/chat', {
      messages: [{ role: 'user', content: message }],
      useRag: true,
      llm: 'gpt-3.5-turbo',
      similarityMetric: 'cosine'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk degreeGuru
async function degreeGuru(message, prompt) {
  try {
    const response = await axios.post('https://degreeguru.vercel.app/api/guru', {
      messages: [
        { role: 'user', content: message }
      ]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk pinecone
async function pinecone(message) {
  try {
    const response = await axios.post('https://pinecone-vercel-example.vercel.app/api/chat', {
      messages: [{ role: 'user', content: message }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk smartContract
async function smartContract(message) {
  try {
    const response = await axios.post("https://smart-contract-gpt.vercel.app/api/chat", {
      messages: [{ content: message, role: "user" }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function blackboxAIChat(message) {
  try {
    const response = await axios.post('https://www.blackbox.ai/api/chat', {
      messages: [{ id: null, content: message, role: 'user' }],
      id: null,
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {},
      trendingAgentMode: {},
      isMicMode: false,
      isChromeExt: false,
      githubToken: null
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Endpoint TikTokDl
app.get('/api/ghstalk', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Example: kyyyxd' });
    }
    const response = await ghstalk(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint TikTokDl
app.get('/api/quotes', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Example: Malam' });
    }
    const response = await quotes(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint TikTokDl
app.get('/api/igdl', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Where is the Instagram URL?' });
    }
    const response = await igdl(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint TikTokDl
app.get('/api/quotesAnime', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Example: naruto' });
    }
    const response = await quotesAnime(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint TikTokDl
app.get('/api/lirik', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Example: Drunk Text' });
    }
    const response = await lirik(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint TikTokDl
app.get('/api/toanime', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Where is the picture?' });
    }
    const response = await draw(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint TikTokDl
app.get('/api/nekopoi', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Where is the URL?' });
    }
    const response = await nekopoi(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { hasil } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint TikTokDl
app.get('/api/npmstalk', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Example: axios' });
    }
    const response = await npmstalk(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint TikTokDl
app.get('/api/igstalk', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Example: kyuurzyyy / username Instagram' });
    }
    const response = await igstalk(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
	    
// Endpoint PinVideo
app.get('/api/ssweb', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Example: https://kyuurzy.my.id' });
    }
    const response = await ssweb(message);
    res.status(200).json({
      status: 200,
      creator: "Hyuu",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint PinVideo
app.get('/api/pinvideo', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await pinterestvideodownloader(url);
    res.status(200).json({
      status: 200,
      creator: "Hyuu",
      data: { t }
    });
  } catch (error) {
    res.status(500).json({ error: error.url });
  }
});

// Endpoint TikTokDl
app.get('/api/tiktokdl', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await tiktokdl(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk ragBot
app.get('/api/ragbot', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await ragBot(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk degreeGuru
app.get('/api/degreeguru', async (req, res) => {
  try {
    const { message }= req.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await degreeGuru(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk pinecone
app.get('/api/pinecone', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await pinecone(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk smartContract
app.get('/api/smartcontract', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await smartContract(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: {response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk blackboxAIChat
app.get('/api/blackboxAIChat', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await blackboxAIChat(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
