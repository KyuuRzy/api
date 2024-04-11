const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cheerio = require("cheerio");
const crypto = require('crypto');
const qs = require('qs');
const Jimp = require('jimp');
const FormData = require('form-data');
const { HttpsProxyAgent } = require('https-proxy-agent');
const httpsAgent = new HttpsProxyAgent('http://168.63.76.32:3128');
const baseUrl = 'https://tools.betabotz.org';

const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware untuk CORS
app.use(cors());

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

async function twitter(link){
	return new Promise((resolve, reject) => {
let config = {
	'URL': link
}
axios.post('https://twdown.net/download.php',qs.stringify(config),{
	headers: {
"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
"sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
"cookie": "_ga=GA1.2.1388798541.1625064838; _gid=GA1.2.1351476739.1625064838; __gads=ID=7a60905ab10b2596-229566750eca0064:T=1625064837:RT=1625064837:S=ALNI_Mbg3GGC2b3oBVCUJt9UImup-j20Iw; _gat=1"
	}
})
.then(({ data }) => {
const $ = cheerio.load(data)
resolve({
desc: $('div:nth-child(1) > div:nth-child(2) > p').text().trim(),
thumb: $('div:nth-child(1) > img').attr('src'),
HD: $('tbody > tr:nth-child(1) > td:nth-child(4) > a').attr('href'),
SD: $('tr:nth-child(2) > td:nth-child(4) > a').attr('href'),
audio: 'https://twdown.net/' + $('tr:nth-child(4) > td:nth-child(4) > a').attr('href')
	})
})
	.catch(reject)
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
app.get('/api/twtdl', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await twitter(message);
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
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
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
app.get('/api/fbdl', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await facebook(message);
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
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
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
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
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
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
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

// Endpoint PinVideo
app.get('/api/ssweb', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
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
